// pages/nav-my/agreement/agreement.js

import {
  ajaxPromise,
} from '../../utils/util';

import {
  URL
} from '../../utils/config';

const agreement = URL.agreement;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: '',
    dateil:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    ajaxPromise(true,agreement,{
      type:options.type
    })
    .then((res) => {
      this.setData({
        dateil: res.resultData
      })
    })
    .catch(() => {})
    this.setData({
      type: options.type,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let type = this.data.type;
    if (type == 0) {
      wx.setNavigationBarTitle({
        title: '用户协议'
      });
    } else if(type == 1) {
      wx.setNavigationBarTitle({
        title: '购卡协议'
      });
    } else if(type == 2){
      wx.setNavigationBarTitle({
        title: '隐私政策'
      });
    } else if(type == 3){
      wx.setNavigationBarTitle({
        title: '购券协议'
      });
    }

  }
})
