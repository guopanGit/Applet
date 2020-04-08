/**
 * 导入封装函数
 */

import {
  URL,
  CINEMA
} from './config.js';

// 请求头
const header = {
  "Content-Type": "application/x-www-form-urlencoded",
  'Accept': 'application/json'
}

/**
 * 时间格式化函数
 * @date 传入日期对象
 * @dateTime 日期类型(日期/日期+时间)
 */
export function formatTime(date, dateTime, divide) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  let hour = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();

  // 分隔符
  if (!divide) {
    divide = '-'
  }

  // 日期 + 时间
  if (dateTime == 5) {
    return [year, month, day].map(formatNumber).join(divide) + ' ' + [hour, minute].map(formatNumber).join(':');
  } else if (dateTime == 2) {
    return [minute, second].map(formatNumber).join(':');
  } else {
    return [year, month, day].map(formatNumber).join(divide);
  }
}

/**
 * 数字前面自动补齐0
 */
export function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 发送请求Promise封装
 * @isLoading 是否显示Loading
 * @url 请求地址
 * @data 请求参数
 * @method 请求类型
 */

export function ajaxPromise(isLoading, url, data, method, modal) {
  // 请求判断类型
  if (method) {
    method = 'POST'
  } else {
    method = 'GET'
  }
  // 是否显示加载动画
  if (isLoading) {
    wx.showLoading({
      title: '加载中',
      mask: true,
    });
  }
  // 公共参数
  data.companyCode = wx.getStorageSync("companyCode") || "";
  data.cinemaCode = wx.getStorageSync("cinemaCode") || "";
  data.memberCode = wx.getStorageSync('member').memberCode || "";
  data.CVersion = wx.getStorageSync('CVersion') || "";
  data.OS = wx.getStorageSync('OS') || "";
  data.token = wx.getStorageSync('member').token || "";
  data.channel = data.channel || '5';

  // 请求封装
  return new Promise((resolve, rejected) => {
    wx.request({
      url,
      data,
      header,
      method,
      success: (res) => {
        if (isLoading) {
          wx.hideLoading();
        }
        if (res.data.resultCode === '0') { // 成功
          resolve(res.data)
        } else if (res.data.resultDesc == "TOKEN_INVALID") { //TOKEN 失效
          wx.showModal({
            content: '为了您的账号安全，请登录',
            showCancel: false,
            confirmText: '知道了',
            success: (res) => {
              wx.removeStorageSync('member')
              wx.navigateTo({
                url: '/pages/sign-in/authorize/authorize'
              })
            }
          })
        } else if (res.data.resultCode == '2202') { // 未绑定手机
          wx.navigateTo({
            url: `/pages/sign-in/bind-phone/bind-phone`,
          });
        } else {
          rejected(res.data)
          if (!modal) {
            showToast(res.data.resultDesc || '网络开小差了，请稍后重试')
          }
        }
      },
      fail: (res) => {
        rejected(res)
        if (isLoading) {
          wx.hideLoading();
        }
        showToast('请求超时')
      }
    })
  })
}

/*
 * 动画效果封装
 * @that 传入指针
 */
export function layerAnimate(that, duration) {
  if (!duration) {
    duration = 500;
  }
  // 创建动画
  const animation = wx.createAnimation({
    duration,
    timingFunction: 'ease',
    delay: 1,
    transformOrigin: "50% 100% 0"
  });
  // 执行动画
  that.animation = animation;
  animation.translateY(380).step();
  // 导出动画
  that.setData({
    animate: animation.export(),
  });
  // 动画效果
  setTimeout(() => {
    animation.translateY(0).step();
    that.setData({
      animate: animation.export(),
    });
  }, 200);
}

/*
 * 弱提示封装
 * @title 提示内容
 */
export function showToast(title) {
  wx.showToast({
    title: title,
    icon: 'none',
    duration: 3000,
  })
}

/*
 * 订单支付封装
 * @title 提示内容
 */

// 创建订单
export function creatOrder(type, code, successCall, seatParams, failCall) {
  // 公共参数
  wx.showLoading({
    title: '加载中...',
    mask: true,
  });
  let url;
  let params = {
    companyCode: wx.getStorageSync('companyCode'),
    memberCode: wx.getStorageSync('member').memberCode,
    cinemaCode: wx.getStorageSync('cinemaCode'),
    CVersion: wx.getStorageSync('CVersion'),
    OS: wx.getStorageSync('OS'),
    token: wx.getStorageSync('member').token,
    channel: '5',
  }

  // 不同类型的订单 发送不同请求
  if (type == 1) { // 影票（包含影票和卖品组合）
    params.oldOrderNo = seatParams.oldOrderNo;
    params.showTime = seatParams.showTime;
    params.eventCode = seatParams.eventCode;
    params.hallCode = seatParams.hallCode;
    params.showCode = seatParams.showCode;
    params.filmCode = seatParams.filmCode;
    params.filmNo = seatParams.filmNo;
    params.recvpPhone = seatParams.recvpPhone;
    params.seatInfo = seatParams.seatInfo;
    params.payType = '3';
    params.companyChannelId = seatParams.companyChannelId;
    url = URL.ticketOrder;
  } else if (type == 2) { // 单独卖品
    params.goodsInfo = seatParams.goodsInfo;
    params.userPhoneNum = seatParams.phone;
    url = URL.goodsCardOrder;
  } else if (type == 3) { // 购卡订单
    let inviteCode = '';
    let scene = wx.getStorageSync('scene');
    let invite= wx.getStorageSync('inviteCode') || '';
    if(scene == 1011 && invite){
      inviteCode = invite
    }
    params.goodsCode = code;
    params.inviteCode = inviteCode;
    params.applyId = CINEMA.appId;
    params.promotionId = seatParams.promotionId || '';
    url = URL.buyCardOrder;
  } else if (type == 4) { // 充值订单
    params.cardNo = code.cardNo;
    params.rechargeMoney = code.rechargeMoney;
    url = URL.recharge;
  }

  // 发送订单请求
  wx.request({
    url,
    data: params,
    header: header,
    method: 'GET',
    success: (res) => {
      wx.hideLoading();
      if (res.data.resultCode == '0') {
        successCall(res.data);
      } else if (res.data.resultDesc == "TOKEN_INVALID") { // TOKEN失效
        wx.showModal({
          content: '为了您的账号安全，请登录',
          showCancel: false,
          confirmText: '知道了',
          success: (res) => {
            wx.removeStorageSync('member')
            wx.navigateTo({
              url: '/pages/sign-in/authorize/authorize'
            })
          }
        })
      } else if (res.data.resultCode == '2202') { // 为绑定手机
        wx.navigateTo({
          url: `/pages/sign-in/bind-phone/bind-phone`,
        });
      } else {
        if (failCall) failCall(res)
        showToast(res.data.resultDesc)
      }
    },
    fail: (res) => {
      wx.hideLoading();
      if (failCall) failCall(res)
    }
  })
}

// 支付订单
export function payOrder(type, orderNo, successCall, failCall) {
  let params = {
    memberCode: wx.getStorageSync('member').memberCode,
    cinemaCode: wx.getStorageSync('cinemaCode'),
    openId: wx.getStorageSync('member').openid,
    CVersion: wx.getStorageSync('CVersion'),
    OS: wx.getStorageSync('OS'),
    token: wx.getStorageSync('member').token,
    payType: 1,
    orderType: type,
    orderNo: orderNo,
  }
  wx.request({
    url: URL.payCardOrder,
    data: params,
    header: header,
    method: 'GET',
    success: (res) => {
      wx.hideLoading();
      if (res.data.resultCode != 0) {
        showToast(res.data.resultDesc)
        return;
      }
      successCall(res.data);
    },
    fail: (res) => {
      wx.hideLoading();
      if (failCall) failCall(res)
    },
    complete: () => {
    }
  })
}

// 唤起微信支付
export function wxPayment(wxPayPara, successCall, failCall) {
  wx.showLoading({
    title: '加载中...',
    mask: true,
  });
  wx.requestPayment({
    timeStamp: wxPayPara.timeStamp,
    nonceStr: wxPayPara.nonceStr,
    package: wxPayPara.package,
    signType: wxPayPara.signType,
    paySign: wxPayPara.paySign,
    success: (res) => {
      successCall(res);
    },
    fail: (res) => {
      if (res.errMsg === 'requestPayment:fail cancel') {
        showToast('支付取消')
      }
      if (failCall) failCall(res);
    },
    complete: () => {
      wx.hideLoading();
    }
  })
}

/**
 * 生成16位随机数
 */
export function uuid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
