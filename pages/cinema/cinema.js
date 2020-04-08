/**
 * 导入封装函数
 */

import {
  ajaxPromise,
  showToast
} from '../../utils/util.js';

import {
  URL,
  CINEMA
} from '../../utils/config.js';

// 赋值
const companyCode = CINEMA.companyCode;
const {
  locationCity,
  prefixImg,
  queryCinema,
  selectCity,
} = URL || '';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    logo: '',
    nearCity: '',
    cityCode: '',
    cinemaList: [],
    locationFail: true,
    myLocation: '定位中...',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.cityCode) {
      this.setData({
        cityCode: options.cityCode
      })
    } else {
      this.setData({
        cityCode: wx.getStorageSync('cityCode')
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: "影院选择",
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.setStorageSync('companyCode', companyCode);
    let _this = this;

    if (wx.getStorageSync('firstEntry')) {
      wx.switchTab({
        url: '../nav-home/index/index',
      })
    } else {
      // 获取经纬度
      wx.getLocation({
        type: 'wgs84',
        isHighAccuracy: true,
        success(res) {
          const latitude = res.latitude + 0.001276;
          const longitude = res.longitude + 0.006256;
          if (_this.data.cityCode) {
            _this.selectCityCall();
          } else {
            // 获取成功向后台请求数据
            ajaxPromise(true, locationCity, {
              lat: latitude,
              lon: longitude
            })
              .then((res) => {
                _this.locationCall(res)
              })
              .catch(() => {
              })
          }
          wx.getStorageSync('member').memberCode
          // 获取当前位置信息
          _this.myLocation(latitude, longitude);

          wx.setStorageSync('latitude', latitude);
          wx.setStorageSync('longitude', longitude);
        },
        fail(res) {
          showToast('检查是否开启定位');
          _this.setData({
            myLocation: '定位失败',
          });
          ajaxPromise(false, locationCity, {
            lat: 1.123,
            lon: 1.123
          })
            .then((res) => {
              _this.locationCall(res)
            })
            .catch(() => {
            })

          _this.setData({
            locationFail: false
          })

          // 定位失败 城市展示
          ajaxPromise(false, selectCity, {})
            .then((res) => {
              _this.cityList(res)
            })
            .catch(() => {
            })
        },
      });
    }
  },

  /**
   * 定位失败显示第一个城市
   */
  cityList(res) {
    let firstCity = res.resultData[0].cityVoList[0].cityName;
    this.setData({
      nearCity: firstCity
    });
  },

  /**
   * 影院信息请求成功回调
   */
  locationCall(res) {
    // console.log(res);
    let locationData = res.resultData;
    let logo = prefixImg + locationData.logoUrl;
    wx.setStorageSync('logo', logo);
    wx.setStorageSync('cityName', locationData.latelyCity);
    wx.setStorageSync('latelyCity', locationData.latelyCity);
    wx.setStorageSync('latelyCityCode', locationData.cityCode);

    this.setData({
      logo: logo,
      nearCity: locationData.latelyCity,
      cinemaList: locationData.cinemaVoList
    });
  },

  /**
   * 选择城市成功回调
   */
  selectCityCall() {
    let _this = this;
    wx.request({
      url: queryCinema,
      header: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      data: {
        companyCode: wx.getStorageSync('companyCode'),
        lat: wx.getStorageSync('latitude'),
        lon: wx.getStorageSync('longitude'),
        cityCode: this.data.cityCode,
      },
      success(res) {
        let result = res.data.resultData;
        if (res.data.resultCode == '0') {
          wx.setStorageSync('cityName', result.latelyCity);
          _this.setData({
            logo: wx.getStorageSync('logo'),
            nearCity: result.latelyCity,
            cinemaList: result.cinemaVoList
          })
        }
      }
    })
  },

  /**
   * 获取当前位置信息
   */
  myLocation(latitude, longitude) {
    let _this = this
    wx.request({
      url: 'https://api.map.baidu.com/geocoder/v2/',
      method: 'GET',
      data: {
        'ak': '6vj8nn4IxhL69HCNc7tPyLWq3zfo4L2y',
        'location': latitude + ',' + longitude,
        'output': 'json',
        'pois': 1
      },
      header: {
        'Content-Type': 'application/json'
      },
      success(res) {
        if (res.data.result.formatted_address) {
          let myLocation = res.data.result.formatted_address;
          _this.setData({
            myLocation: myLocation
          })

        } else {
          _this.setData({
            myLocation: '定位失败'
          })
        }
      },
      fail() {
        showToast('定位失败');
      },
    });
  },

  /**
   * 跳转到城市列表
   */
  selectCity() {
    wx.navigateTo({
      url: '../cinema-home/city-list/city-list',
    });
  },

  /**
   * 跳转城市搜索
   */
  goSearch() {
    wx.navigateTo({
      url: '../cinema-home/search-cinema/search-cinema',
    });
  },

  /**
   * 进入首页
   */
  goHome(e) {
    let cinemaCode = e.currentTarget.dataset.id.cinemaCode;
    let cinemaName = e.currentTarget.dataset.id.cinemaName;
    wx.setStorageSync('cinemaCode', cinemaCode);
    wx.setStorageSync('cinemaName', cinemaName);
    wx.setStorageSync('cityCode', this.data.cityCode);

    // 重置首次进入小程序标识
    wx.setStorageSync('firstEntry', true);
    wx.switchTab({
      url: '../nav-home/index/index',
    });
  },

  /**
   * 转发
   */
  onShareAppMessage(res) {
    return {
      title: '选家影院看电影吧',
      path: 'pages/cinema/cinema'
    }
  }

})
