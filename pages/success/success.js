// pages/success/success.js
import {
  ajaxPromise
} from '../../utils/util.js'

import {
  URL
} from '../../utils/config.js'

const {
  getState,
  mixtureOderDetail
} = URL || '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '购买结果',
    type: '',
    orderType: '',
    orderNo: '',
    isParkingVoucher: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
    let {type, orderNo, orderType} = options || '';
    let randomTime = new Date().getTime();
    let title;
    let status;
    let isSuccess;
    if (type == 2 || type == 4) {
      ajaxPromise(true, getState, {
        randomTime,
        orderNo,
      })
        .then((res) => {
          this.orderState(res)
        })
        .catch(() => {
        })
      this.setData({
        type,
        orderNo,
        orderType,
      })
    } else {
      isSuccess = 1;
      status = 1;

      if (type == 1) {
        title = `充值成功`;
      } else {
        title = `购买成功`;
      }

      this.setData({
        type,
        orderNo,
        orderType,
        title,
        status
      })
      wx.setStorageSync('scene', 1001);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    let title = this.data.title;
    wx.setNavigationBarTitle({
      title
    })
  },

  /**
   * 查看详情
   */
  check() {
    let url;
    let {type, orderNo} = this.data;
    switch (type) {
      case'1':
        url = `/pages/nav-my/my-card/vip-card/vip-card`;
        break;
      case'2':
        url = `/pages/order/order-detail/order-detail?orderNo=${orderNo}&type=${this.data.orderType}`;
        break;
      case'3':
        url = `/pages/order/order-detail/order-detail?orderNo=${orderNo}&type=3`;
        break;
    }
    wx.redirectTo({
      url
    })
  },

  // 刷新
  refresh() {
    let randomTime = new Date().getTime();
    let {orderNo} = this.data
    ajaxPromise(true, getState, {
      randomTime,
      orderNo,
    })
      .then((res) => {
        this.orderState(res)
      })
      .catch(() => {
      })
  },

  toHome() {
    wx.switchTab({
      url: '/pages/nav-home/index/index'
    })
  },

  // 订单状态
  orderState(res) {
    let title;
    let status;
    let isSuccess;
    let {
      type,
      orderType,
      orderNo
    } = this.data;
    let resultData = res.resultData;
    if (resultData == 1001) {
      isSuccess = 1;
      status = 1;
      title = `购买成功`;
    } else if (resultData == 1007) {
      isSuccess = 3;
      status = 3;
      if (orderType == 1) {
        title = '努力出票中，请稍等...';
      } else {
        title = '努力出货中，请稍等...';
      }
      if (type == 3) {
        title = '支付结果获取中，请稍后...';
      }
    } else {
      isSuccess = 2;
      status = 2;
      title = '订单异常,正在为你退款';
    }
    if (orderType == 1) {
      ajaxPromise(true, mixtureOderDetail, {
        orderNo
      })
        .then((res) => {
          let isParkingVoucher = res.resultData.isParkingVoucher
          this.setData({
            isParkingVoucher
          })
        })
        .catch(() => {
        })
    }
    this.setData({
      title,
      status
    })
  },

  /**
   * 查看停车券
   */
  toCoupon() {
    wx.navigateTo({
      url: '/pages/nav-my/my-coupon/my-coupon'
    })
  },

  /**
   * 监听页面卸载
   */
  onUnload() {
    wx.setStorageSync('scene', 1001);
    wx.removeStorageSync('inviteCode')
  },
})
