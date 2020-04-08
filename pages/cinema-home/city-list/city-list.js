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
const selectCity = URL.selectCity;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    top: 0,
    isBlue: false,
    isFloat: false,
    letter: '',
    scrollNow: 0,
    cityArr: [],
    letterArr: [],
    nearCityText: '最近',
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady () {
    wx.setNavigationBarTitle({
      title: "选择城市",
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    wx.hideShareMenu();
    ajaxPromise(true, selectCity, {})
    .then((res) => {
      this.cityList(res)
    })
    .catch(() => {})
  },

  /**
   * 城市列表请求成功回调
   */
  cityList(res) {
    let cityArr = [];
    let letterArr = [];
    let firstLetter = '';
    let letterData = res.resultData;

    // 重组点击导航
    for (let i = 0; i < letterData.length; i++) {
      letterArr.push(letterData[i].firstLeter)
    }

    // 点击导航添加最近
    letterArr.unshift(this.data.nearCityText);

    // 重组城市列表
    for (let j = 0; j < letterData.length; j++) {
      firstLetter = letterData[j].firstLeter;
      for (let k = 0; k < letterData[j].cityVoList.length; k++) {
        letterData[j].cityVoList[0].firstLetter = firstLetter;
        cityArr.push(letterData[j].cityVoList[k]);
      }
    }

    // 把最近城市添加到城市列表
    // let nearCityName = wx.getStorageSync('latelyCity');
    let nearCity = {
      cinemaList: null,
      cityCode: wx.getStorageSync('latelyCityCode'),
      cityName: wx.getStorageSync('latelyCity'),
      firstLetter: this.data.nearCityText
    }

    // 插入数组
    cityArr.unshift(nearCity);
    this.setData({
      cityArr: cityArr,
      letterArr: letterArr
    });
  },

  /**
   * 点击字母 跳到对应的城市
   */
  bindLetter (e) {
     // console.log(e)
    let letter = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    let offsetTop = e.currentTarget.offsetTop - 6;
    let _this = this;

    this.setData({
      index: index,
      letter: letter,
      isFloat: true,
      top: offsetTop
    });

    if (letter == this.data.nearCityText) {
      this.setData({
        letter: '',
        isFloat: false
      })
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0,
      })
    } else {
      wx.createSelectorQuery().selectAll('.city-item-A-Z').fields({
        dataset: true,
        size: true,
        rect: true
      }, (res) => {
        res.forEach((re) => {
           // console.log(re);
          for (let i = 0; i < re.dataset.letter.length; i++) {
            if (letter == re.dataset.letter[i]) {
              wx.pageScrollTo({
                scrollTop: re.top + _this.data.scrollNow,
                duration: 0
              })
              _this.data.isShow = false;
            }
          }
        })
      }).exec();
    }
  },

  /**
   *  获取滚动条当前位置
   */
  onPageScroll (e) {
    this.setData({
      scrollNow: e.scrollTop
    })
  },

  /**
   *  选择城市
   */
  citySelected(e) {
     // console.log(e);
    let cityCode = e.currentTarget.dataset.citycode;
    wx.reLaunch({
      url: '../../cinema/cinema?cityCode=' + cityCode
    })
  }


})
