/**
 * 导入封装函数
 */

import {
  ajaxPromise
} from '../../../../utils/util.js';

import {
  URL
} from '../../../../utils/config.js';

// 赋值
const {
  filmDetail,
  isWantSee,
  queryWantSee
} = URL;

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isWant: true,
    isShow: true,
    hideBtn: true,
    detailData: {},
    stillsArr: [],
    iPhoneX: app.globalData.iPhoneX,
  },
  
  /**
   * 页面的初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('cinemaName'),
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取页面携带参数
    let filmCode = options.filmCode;
    let noSeeType = options.noSeeType;
    let isSale = options.isSale;
    
    // 查询影片详情信息
    ajaxPromise(true, filmDetail, {
      filmCode: filmCode,
      memberCode: ''
    })
      .then((res) => {
        this.filmDetailCall(res)
      })
      .catch(() => {
      })
    
    // 查询用户是否已想看
    if (wx.getStorageSync('member').memberCode) {
      ajaxPromise(true, queryWantSee, {
        filmCode: filmCode
      })
        .then((res) => {
          this.wantSeeCall(res)
        })
        .catch(() => {
        })
    }
    
    // 是否显示场次按钮
    if (noSeeType == 1 && isSale == 0) {
      this.setData({
        hideBtn: false
      })
    }
    
    this.setData({
      filmCode: filmCode
    })
  },
  
  /**
   * 影片详情页请求成功回调
   */
  filmDetailCall(res) {
    // 判断是否显示想看按钮
    let filmShowDate = new Date(res.resultData.filmShowDate);
    let currentTime = new Date();
    if (filmShowDate - currentTime < 0) {
      this.setData({
        isShow: false
      })
    } else {
      this.setData({
        isShow: true,
      })
    }
    
    // 处理剧照
    let stills = res.resultData.filmImgNew.split(',');
    let stillsArr = [];
    for (let i = 0; i < stills.length; i++) {
      stillsArr.push(stills[i])
    }
    this.setData({
      detailData: res.resultData,
      stillsArr: stillsArr
    });
  },
  
  /**
   * 查询想看成功回调
   */
  wantSeeCall(res) {
     // console.log(res);
    this.setData({
      isWant: res.resultData
    });
  },
  
  /**
   * 点击是否想看
   */
  isLoved(e) {
    let flag = e.currentTarget.dataset.flag;
    if (wx.getStorageSync('member').memberCode) {
      ajaxPromise(true, isWantSee, {
        filmCode: this.data.filmCode,
        flag
      })
        .then((res) => {
          this.isWantCall(res)
        })
        .catch(() => {
        })
    } else {
      wx.navigateTo({
        url: `/pages/sign-in/authorize/authorize`,
      })
    }
  },
  
  /**
   * 想看成功回调
   */
  isWantCall(res) {
    if (res.resultData == 1) {
      this.setData({
        isWant: false
      });
    } else {
      this.setData({
        isWant: true
      });
    }
  },
  
  /**
   * 跳转到场次页
   */
  goScene() {
    let key = this.data.filmCode;
     // console.log(key);
    wx.navigateTo({
      url: `/pages/nav-home/scene/scene?key=${key}`,
    })
  },
  
  /**
   * 预览剧照
   */
  previewImg(e) {
    let src = e.currentTarget.dataset.src;
    wx.previewImage({
      current: src,
      urls: this.data.stillsArr
    });
  },
  
  /**
   * 全部剧照
   */
  goAll() {
    let filmName = this.data.detailData.filmName;
    let stillsArr = JSON.stringify(this.data.stillsArr);
    wx.navigateTo({
      url: '../all-stills/all-stills?stillsArr=' + stillsArr + '&filmName=' + filmName,
    })
  },
  
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(res) {
    let companyCode = wx.getStorageSync('companyCode');
    let cinemaCode = wx.getStorageSync('cinemaCode');
    let cinemaName = wx.getStorageSync('cinemaName');
    let filmCode = this.data.filmCode;
    return {
      title: '走！去' + cinemaName + '看电影',
      path: `pages/nav-home/detail/film-detail/film-detail?companyCode=${companyCode}&cinemaCode=${cinemaCode}&filmCode=${filmCode}&cinemaName=${cinemaName}`,
    }
  }
})