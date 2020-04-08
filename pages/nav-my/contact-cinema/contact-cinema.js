// 联系影院.js

import {
  ajaxPromise,
} from '../../../utils/util';

import {
  URL
} from '../../../utils/config';

const getCinemaInfo = URL.getCinemaInfo;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    http: URL.prefixImg,
    dateil: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
    ajaxPromise(true, getCinemaInfo, {},)
      .then((res) => {
        this.setData({
          dateil: res.resultData
        })
      })
      .catch(() => {
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: '联系影院'
    });

  },

  /**
   * 打电话
   */
  phone() {
    let phone = this.data.dateil.cinemaTel
    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
})
