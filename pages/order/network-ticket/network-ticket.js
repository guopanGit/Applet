// 电子影票
import {URL} from '../../../utils/config.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    current: 0,
    http: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
    let detail = JSON.parse(options.val)
    let http = URL.PREFIXNL + '/qrcode/qrcode/getQRCode';
    let ticketInfos = getApp().globalData.ticketInfos;
    this.setData({
      list: ticketInfos,
      detail,
      http
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: '电子影票码'
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },

  /**
   * 切换二维码
   * */
  switch(e) {
    let current = e.detail.current
    this.setData({
      current
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  }
})
