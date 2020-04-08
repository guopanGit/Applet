/**
 * 导入封装函数
 */

import {
  ajaxPromise,
  showToast,
  uuid
} from '../../../utils/util.js';

import {
  URL
} from '../../../utils/config.js';

// 获取请求链接
const {
  authorize,
  getUserInfo,
  checkLogin
} = URL || '';

Page({


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
  },

  /**
   * 监听页面显示
   */
  onShow() {
    let _this = this;
    wx.login({
      success(res) {
        _this.setData({
          sessionKey: res.code
        })
      }
    })
  },

  /**
   * 用户授权
   */
  bindGetUserInfo(e) {
    let _this = this;
    let encryptedData = e.detail.encryptedData;
    let iv = e.detail.iv;
    wx.checkSession({
      success() {
        let sessionKey = _this.data.sessionKey;
        _this.wxLogin(sessionKey, encryptedData, iv);
      },
      fail() { // session 失效
        wx.login({
          success(res) {
            let sessionKey = res.code;
            _this.wxLogin(sessionKey, encryptedData, iv);
          }
        })
      },
    })
  },

  /**
   * 检查session是否失效
   * @param {*} sessionKey
   * @param {*} encryptedData
   * @param {*} iv
   */
  wxLogin(sessionKey, encryptedData, iv) {
    ajaxPromise(true, authorize, {
      js_code: sessionKey,
      movieCode: wx.getStorageSync('companyCode')
    })
      .then((res) => {
        ajaxPromise(false, getUserInfo, {
          iv: iv,
          encryptedData: encryptedData,
          sessionId: res.resultData
        })
          .then((res) => {
            this.getUserCall(res)
          })
          .catch(() => {
          })
        this.setData({
          sessionId: res.resultData
        })
      })
      .catch(() => {
      })
  },

  /**
   *
   * @param {res} 获取用户信息回调参数
   */
  getUserCall(res) {
    let userInfo = JSON.parse(res.resultData);
    if (res.resultCode == null) {
      showToast('网络缓慢，请重试');
      return
    }
    if (res.resultCode == '500') {
      showToast('登录失败，请重试');
      return
    }
    if (res.resultCode == '0') {
      if (userInfo.openId) {
        let unionid = userInfo.unionId;
        if (!userInfo.unionId) {
          unionid = userInfo.openId + wx.getStorageSync('companyCode')
        }
        // 检查登录状态
        let deviceCode = uuid();
        ajaxPromise(true, checkLogin, {
          city: userInfo.city,
          country: userInfo.country,
          headimgurl: userInfo.avatarUrl,
          language: userInfo.language,
          nickName: userInfo.nickName,
          openid: userInfo.openId,
          province: userInfo.province,
          sex: userInfo.gender,
          unionid,
          loginType: '5',
          source: '5',
          deviceCode
        })
          .then((res) => {
            this.checkLoginCall(res,userInfo.nickName)
          })
          .catch(() => {
          })
      } else {
        showToast('请求超时，请重试');
      }
    } else {
      wx.showModal({
        title: '提示',
        content: userInfo.resultDesc,
        showCancel: false,
        confirmText: '知道了',
      })
    }
  },

  /**
   *
   * @param {res} 检查登录状态回调参数
   */
  checkLoginCall(res,nickName) {
    //  console.log(res);
    if (res.resultCode == '500') {
      showToast('网络超时，请重试');
      return
    }
    if (res.resultData.openid && res.resultData.token) {
      if (res.resultData.isBinding == '0') { // 如果没有绑定手机号,去绑定页面
        wx.redirectTo({
          url: '../bind-phone/bind-phone'
        })
      } else {
        wx.navigateBack({
          delta: 1
        });
      }
      let member = {
        memberCode: res.resultData.memberCode,
        country: res.resultData.country,
        language: res.resultData.language,
        avatar: res.resultData.memberHeadImgNew,
        birthday: res.resultData.memberBirthday,
        nickName: res.resultData.memberName || nickName,
        phone: res.resultData.memberPhone,
        gender: res.resultData.memberSex,
        openid: res.resultData.openid,
        token: res.resultData.token,
        unionId: res.resultData.unionid,
        sessionId: this.data.sessionId
      }
      wx.setStorageSync('member', member);
    }
  },

  /**
   * 暂不登录
   */
  noneLogin() {
    wx.navigateBack({
      delta: 1
    });
  }
})
