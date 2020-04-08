/**
 * 导入封装函数
 */

import {
  ajaxPromise,
  showToast,
} from '../../../utils/util.js';

import {
  URL
} from '../../../utils/config.js';

// 神策埋点
const app = getApp();
app.sensors.track('小程序页面浏览', {
  cinemaName: wx.getStorageSync('cinemaName'),
});

// 请求接口
const {
  prefixImg,
  homeAd,
  cardRecommend,
  filmList,
  isWantSee,
  locationCity,
  homeNotice,
  limitRedPackage,
  redictRedPackage,
  grabRedPackage
} = URL || '';

wx.setStorageSync('changeCity', 'changeCity');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    dotColor: 'rgba(255, 255, 255, .5)',
    dotCurColor: '#ff630e',
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 800,
    circular: true,
    isEject: false,
    iWant: true,
    agree: true,
    cityName: '',
    layerAdImg: '',
    bannerArr: [],
    recmCard: {},
    hotFilmArr: [],
    queryType: 0,
    limitRedPackage: false,
    package: false,
    redictPackage: false,
    notice: true,
    noticeContent: '',
    renderData: {},
    renderShow: false,
    source: 2,
    cardTitle: '',
    adWidth: 500,
    adHigh: 700,
    isSpecial: false,
    recommendCard: {}
  },
  isFirst: false,

  /**
   * 生命周期函数--监听页面第一次加载
   */
  onLoad() {
    this.isFirst = true;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 设置影院名称最大11位
    let title = wx.getStorageSync('cinemaName');
    if (title.length > 11) {
      title = title.substring(0, 11) + '...'
    }
    wx.setNavigationBarTitle({
      title
    });

    // 最近城市
    if (wx.getStorageSync('scenc') === 1011) {
      this.setData({
        cityName: wx.getStorageSync('cinemaName')
      });
    } else {
      this.setData({
        cityName: wx.getStorageSync('cityName')
      });
    }

    // 限量红包
    ajaxPromise(false, limitRedPackage, {})
      .then((res) => {
        this.limitRedPackageCall(res)
      })
      .catch(() => {
      })

    // 卡推荐
    ajaxPromise(false, cardRecommend, {
      sortType: 1
    }, false, true)
      .then((res) => {
        this.cardRecommendCall(res)
      })
      .catch(() => {
      })

    // 定向红包
    ajaxPromise(false, redictRedPackage, {})
      .then((res) => {
        this.redictRedPackageCall(res)
      })
      .catch(() => {
      })

    // 购票须知
    ajaxPromise(false, homeNotice, {})
      .then((res) => {
        this.noticeCall(res)
      })
      .catch(() => {
      })

    // 查询是否开启广告
    ajaxPromise(false, homeAd, {
      channel: '2'
    })
      .then((res) => {
        this.adCall(res)
      })
      .catch(() => {
      })

    // 查询首页排片
    let type;
    if (this.data.queryType > 0) {
      type = this.data.queryType
    } else {
      type = 0;
    }
    this.queryFilmList(type);

    this.setData({
      queryType: type
    })

    // 检查是否授权开启定位
    this.scopeLocation();

    // 埋点
    app.sensors.para.autoTrack['pageShow'] = {
      platform_type: '小程序',
      cinemaName: wx.getStorageSync('cinemaName'),
    }

    this.isFirst = false;
  },

  /**
   * 监听页面隐藏
   */
  onHide() {
    this.setData({
      queryType: this.data.queryType
    })
  },

  /**
   * 卡推荐成功回调
   */
  cardRecommendCall(res) {
    let recommendCard = res.resultData.recommendCard;
    if (recommendCard.gId) {
      let cardTitle = [];
      if (recommendCard.pType == 1) { // 显示卡推荐
        if (recommendCard.minPrice > 0) {
          cardTitle.push('持卡享特惠，购票');
          cardTitle.push('元起');
          cardTitle.push(recommendCard.minPrice)
        } else {
          cardTitle.push('持卡享特惠')
        }
      } else {// 显示首单立减
        if (recommendCard.number > 0){
          cardTitle.push('持卡享特惠，首单立减');
          cardTitle.push(`元起`);
          cardTitle.push(recommendCard.promotionFirstPrice);
        }else {
          cardTitle.push('持卡享特惠');
        }
      }
      this.setData({
        renderShow: true,
        recommendCard: recommendCard,
        cardTitle
      })
    } else {
      this.setData({
        renderShow: false,
      })
    }
  },

  /**
   * 经纬度保持实时的
   */
  scopeLocation() {
    let _this = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude;
        const longitude = res.longitude;
        // 获取成功向后台请求数据
        ajaxPromise(false, locationCity, {
          lat: latitude,
          lon: longitude
        })
          .then((res) => {
            _this.locationCall(res)
          })
          .catch(() => {
          })
      },
      fail(res) {
        showToast('检查是否开启定位');
      },
    });
  },

  /**
   * 最近影院定位请求成功回调
   */
  locationCall(res) {
    // console.log(res);
    let currentCinemaName = res.resultData.cinemaVoList[0].cinemaName;
    let cityCode = res.resultData.cityCode;
    let cinemaName = wx.getStorageSync('cinemaName')
    if (currentCinemaName != cinemaName) {
      if (wx.getStorageSync('changeCity')) {
        wx.showModal({
          title: '',
          content: '当前离您最近的影院是' + currentCinemaName + '，是否切换？',
          showCancel: true,
          cancelText: "取消",
          confirmText: "切换",
          success(res) {
            if (res.confirm) {
              // 重置首次进入小程序标识
              wx.setStorageSync('firstEntry', false);
              wx.setStorageSync('cityCode', cityCode);
              wx.redirectTo({
                url: '/pages/cinema/cinema',
              })
            }
          },
          complete(res) {
            wx.setStorageSync('changeCity', '');
          }
        })
      }
    }
  },

  /**
   * 限量红包成功回调
   */
  limitRedPackageCall(res) {
    if (res.resultData) {
      this.setData({
        limitRedPackage: true,
        packageId: res.resultData.packetId
      })
    } else {
      this.setData({
        limitRedPackage: false
      })
    }
  },

  /**
   * 查看限量红包
   */
  checkRedPackage() {
    this.setData({
      package: true,
    })
  },

  /**
   * 关闭限量红包
   */
  closePackage() {
    this.setData({
      package: false,
      limitRedPackage: false
    })
  },

  /**
   * 抢红包
   */
  grabRed() {
    let packageId = this.data.packageId;
    ajaxPromise(true, grabRedPackage, {
      packetId: packageId
    })
      .then((res) => {
        // console.log(res);
        app.globalData.counponData = res.resultData;
        this.setData({
          package: false,
        })
        wx.navigateTo({
          url: '../coupon/coupon',
        });
      })
      .catch((res) => {
        this.setData({
          package: false,
        })
      })
  },

  /**
   * 定向红包成功回调
   */
  redictRedPackageCall(res) {
    // console.log(res);
    if (res.resultData) {
      let redictCouponList = res.resultData.vouchers;
      this.setData({
        redictPackage: true,
        redictCouponList: redictCouponList
      })
    }
  },

  /**
   * 关闭定向红包
   */
  closeRedictPackage() {
    this.setData({
      redictPackage: false
    })
  },

  /**
   * 购票须知
   */
  noticeCall(res) {
    if (res.resultData) {
      this.setData({
        noticeContent: res.resultData
      });
    } else {
      this.setData({
        noticeContent: ''
      });
    }
  },

  /**
   * 购票须知
   */
  showNotice() {
    if (this.data.noticeContent) {
      if (this.data.noticeContent.length > 27) {
        this.setData({
          notice: !this.data.notice
        })
      }
    }
  },

  /**
   * 广告请求成功回调
   */
  adCall(res) {
    // console.log(res);
    if (res.resultData && res.resultData.adBox && res.resultData.adBox.length > 0) {
      let layerAdImg = prefixImg + res.resultData.adBox[0].adImg;
      let ejectData = res.resultData.adBox;
      let adShowOnce = app.globalData.adShowOnce;
      let updateTime = res.resultData.adBox[0].updateTime;
      let {
        adWidth,
        adHigh
      } = res.resultData.adBox[0];
      if (adWidth == 750) {
        this.setData({
          isSpecial: true
        })
      }
      let time = wx.getStorageSync('updateTime');
      if (time === '') {
        wx.setStorageSync('updateTime', updateTime);
      } else {
        if (time != updateTime) {
          adShowOnce = true;
          app.globalData.adShowOnce = true;
          wx.setStorageSync('updateTime', updateTime);
        }
      }
      this.setData({
        ejectData: ejectData,
        layerAdImg: layerAdImg,
        adWidth,
        adHigh
      });
      if (adShowOnce) {
        this.setData({
          isEject: true
        })
      } else {
        this.setData({
          isEject: false
        })
      }
    } else {
      this.setData({
        isEject: false
      })
    }

    // 判断是否有banner
    if (res.resultData && res.resultData.ads) {
      let bannerArr = res.resultData.ads;
      for (let i = 0; i < bannerArr.length; i++) {
        bannerArr[i].adImg = prefixImg + bannerArr[i].adImg
      }
      this.setData({
        bannerArr: bannerArr
      });
    }
  },

  /**
   * banner跳转
   */
  bannerJump(e) {
    wx.setStorageSync('bannerFlag', ' ')
    let bannerData = e.currentTarget.dataset.ads;
    let bannerType = bannerData.adLinkType;
    let index = e.currentTarget.dataset.id;
    if (bannerData.adLinkType == 9) {
      bannerType = bannerData.adLink;
    }
    this.adJumpType(bannerType, bannerData.adLink);

    // 埋点
    app.sensors.track('bannerClick', {
      platform_type: '小程序',
      cinemaName: wx.getStorageSync('cinemaName'),
      clickType: 'banner',
      bannerLocation: index,
      bannerName: bannerData.adName,
      bannerID: bannerData.id,
      turnurl: 'pages/nav-home/activity/activity'
    });
  },

  /**
   * 弹窗跳转
   */
  ejectJump() {
    let ejectData = this.data.ejectData[0];
    let adType = ejectData.adLinkType;
    if (adType == 9) {
      adType = ejectData.adLink;
    }
    this.adJumpType(adType, ejectData.adLink);
    this.setData({
      adType: adType,
      isEject: false
    });
  },

  /**
   * 弹窗跳转类型封装
   */
  adJumpType(type, link) {
    if (type == 1) {
      wx.navigateTo({
        url: `/pages/nav-home/detail/film-detail/film-detail?filmCode=${link}`,
      })
      app.globalData.adShowOnce = false;
    } else if (type == 6) {
      wx.reLaunch({
        url: `/pages/nav-goods/goods?page=1`,
      })
      app.globalData.adShowOnce = false;
    } else if (type == 7) {
      wx.reLaunch({
        url: `/pages/nav-goods/goods?page=0`,
      })
      app.globalData.adShowOnce = false;
    } else if (type == 10 || type == 11 || type == 12 || type == 13) {
      if (wx.getStorageSync('member').memberCode) {
        if (type == 10) {
          wx.navigateTo({
            url: `/pages/nav-my/my-order/my-order?page=1`,
          })
        }
        if (type == 11) {
          wx.navigateTo({
            url: `/pages/nav-my/my-card/vip-card/vip-card`,
          })
        }
        if (type == 12) {
          wx.navigateTo({
            url: `/pages/nav-my/my-coupon/my-coupon`,
          })
        }
        if (type == 13) {
          wx.navigateTo({
            url: `/pages/nav-my/my-account/account/account`,
          })
        }
        app.globalData.adShowOnce = false;
      } else {
        wx.navigateTo({
          url: `/pages/sign-in/authorize/authorize`,
        })
      }
    } else if (type == 20) {
      wx.navigateTo({
        url: "../prize/prize?luckDrawId=" + link
      })
      app.globalData.adShowOnce = false;
    } else if (type == 9) {
      wx.reLaunch({
        url: `/pages/nav-my/my/my`,
      })
    }
  },

  /**
   * 切换影片列表
   */
  changeFilmList(e) {
    let queryType = e.currentTarget.dataset.type;
    let pages = this.data.queryType;
    if (queryType === pages) {
      return
    }
    this.queryFilmList(queryType);
    this.setData({
      queryType: queryType
    });
  },

  /**
   * 查询影片信息
   */
  queryFilmList(type) {
    ajaxPromise(this.isFirst, filmList, {
      type
    }, false, true)
      .then((res) => {
        this.filmListCall(res)
      })
      .catch(() => {
      })
  },

  /**
   * 查询影片成功回调
   */
  filmListCall(res) {
    let hotFilmArr = res.resultData.allFilms;
    this.setData({
      hotFilmArr: hotFilmArr
    });
  },

  /**
   * 选择影城
   */
  changeCinema() {
    // 重置首次进入小程序标识
    wx.setStorageSync('firstEntry', false);

    wx.redirectTo({
      url: '/pages/cinema/cinema',
    })
  },

  /**
   * 跳转到场次页
   */
  goScene(e) {
    if (wx.getStorageSync('member').memberCode) {
      let key = e.currentTarget.dataset.key;
      wx.navigateTo({
        url: '../scene/scene?key=' + key,
      })
    } else {
      wx.navigateTo({
        url: `/pages/sign-in/authorize/authorize`,
      })
    }
  },

  /**
   * 跳转到详情页
   */
  goDetail(e) {
    let isSale = e.currentTarget.dataset.type.isSale;
    let filmCode = e.currentTarget.dataset.id;
    let noSeeType = this.data.queryType;
    wx.navigateTo({
      url: '../detail/film-detail/film-detail?filmCode=' + filmCode + '&noSeeType=' + noSeeType + '&isSale=' + isSale,
    });
  },

  /**
   * 是否想看
   */

  isWanted(e) {
    if (wx.getStorageSync('member').memberCode) {
      let currentWantIndex = e.currentTarget.dataset.index;
      let filmCode = e.currentTarget.dataset.item.film_key;
      let flag = e.currentTarget.dataset.flag;
      ajaxPromise(true, isWantSee, {
        filmCode: filmCode,
        flag: flag
      })
        .then((res) => {
          this.isWantCall(res)
        })
        .catch(() => {
        })

      this.setData({
        currentWantIndex: currentWantIndex,
        filmCode: filmCode
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
    this.queryFilmList(this.data.queryType);
  },

  /**
   * 关闭广告弹层
   */
  closeLayer() {
    app.globalData.adShowOnce = false;
    this.setData({
      isEject: false
    });
  },

  /**
   * 监听进入首页
   **/
  onTabItemTap(item) {
    if (item.index === 0) {
      wx.setStorageSync('type', '');
      app.globalData.page = '';
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(res) {
    let companyCode = wx.getStorageSync('companyCode');
    let cinemaName = wx.getStorageSync('cinemaName');
    let cinemaCode = wx.getStorageSync('cinemaCode');
    let cityName = wx.getStorageSync('cityName');
    return {
      title: '走！去' + cinemaName + '看电影',
      path: `pages/nav-home/index/index?cinemaCode=${cinemaCode}&companyCode=${companyCode}&cityName=${cityName}`,
    }
  }
})
