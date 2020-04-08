/**
 * 导入封装函数
 */

import {
  ajaxPromise
} from '../../../utils/util.js';

import {
  URL
} from '../../../utils/config.js';

// 赋值
const searchCinema = URL.searchCinema;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isClear: false,
    isHasData: false,
    inputVal: '',
    searchList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.setNavigationBarTitle({
      title: "影院搜索",
    });
  },


  /**
   * 监听用户输入内容
   */
  bindKeyInput(e) {
    let inputVal = e.detail.value;
    let reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
    if (reg.test(inputVal)) {
      setTimeout(() => {
        ajaxPromise(true, searchCinema, {
          lat: wx.getStorageSync('latitude'),
          lon: wx.getStorageSync('longitude'),
          input: inputVal
        })
        .then((res) => {
          this.searchCall(res)
        })
        .catch(() => {})
      }, 1000);
    }

    if (inputVal.length > 0) {
      this.setData({
        isClear: true
      })
    } else {
      this.setData({
        isClear: false
      })
    }

    this.setData({
      inputVal: inputVal
    })
  },

  /**
   * 查询成功回调
   */
  searchCall(res) {
    if (res.resultData.length) {
      this.setData({
        isHasData: false,
        searchList: res.resultData
      })
    } else {
      this.setData({
        isHasData: true,
        searchList: res.resultData
      })
    }

  },

  /**
   * 清楚输入内容
   */
  clearVal() {
    this.setData({
      isClear: false,
      isHasData: true,
      inputVal: '',
      searchList: []
    })
  },

  /**
   * 取消搜索
   */
  cancelearch() {
    wx.navigateBack({
      delta: 1
    })
  },


  /**
   * 进入首页
   */
  goHome(e) {
    let cinemaCode = e.currentTarget.dataset.id.cinemaCode;
    let cinemaName = e.currentTarget.dataset.id.cinemaName;
    let cityName = e.currentTarget.dataset.id.cinemaDesc;
    let cityCode = e.currentTarget.dataset.id.cityCode;

    // 固定信息存入缓存
    wx.setStorageSync('cinemaCode', cinemaCode);
    wx.setStorageSync('cinemaName', cinemaName);
    wx.setStorageSync('cityName', cityName);
    wx.setStorageSync('cityCode', cityCode);

    // 重置首次进入小程序标识
    wx.setStorageSync('firstEntry', true);

    wx.switchTab({
      url: '../../nav-home/index/index',
    })
  }

})
