import {
  URL
} from '../../../utils/config.js';

import {
  ajaxPromise
} from '../../../utils/util.js';
import {showToast} from "../../../utils/util";


let {
  prepayment,
  goodsPrepayment,
  queryCoupon
} = URL || '';

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chooseCouponList: [],
    id: 1,
    content: '',
    freeNum: 0,
    restsNum: 0,
    voucherCode: '',
    voucherName: '',
    checked: [],
    isAffirm: false,
    iPhoneX: false,
    isCard: 0,
    cardType: 0
  },

  orderNo: '',
  filmCount: 0,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
    this.setData({
      iPhoneX: app.globalData.iPhoneX,
      cardType: app.globalData.cardType,
      isCard: options.isCard
    })
    let filmCount = options.filmCount || 0;
    let id = options.id;
    if (filmCount <= 0) id = 2;
    this.orderNo = options.orderNo;
    this.filmCount = options.filmCount;
    this.setData({
      orderNo: options.orderNo,
      type: options.type,
      id
    })
    if (id == 1) {
      this.setData({
        content: `免费兑换券可使用多张`
      })
    } else {
      this.setData({
        content: '不可与活动、会员卡权益折叠使用',
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: '选择优惠券',
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let data = {
      pageNo: 1,
      voucherType: 4,
      orderNo: this.orderNo
    };
    let filmCount = this.filmCount;
    if (filmCount != 0) {
      ajaxPromise(true, queryCoupon, data)
        .then((res) => {
          let id = this.data.id;
          let freeNum = res.resultData.totalCount;
          let freeList = res.resultData.vouchers;

          if (id == 1) {
            if (freeList.length < 1) {
              this.selectComponent("#default").show();
            } else {
              this.selectComponent("#default").hide();
            }
            this.setData({
              chooseCouponList: freeList,
              content: '免费兑换券可使用多张'
            })
          }
          this.setData({
            freeNum,
            freeList,
          })
        })
        .catch(() => {
        })
    } else {
      this.setData({
        freeNum: 0,
        freeList: [],
      })
    }

    data.voucherType = '-2';
    ajaxPromise(true, queryCoupon, data)
      .then((res) => {
        setTimeout(() => {
          let id = this.data.id;
          let restsNum = res.resultData.totalCount;
          let restsList = res.resultData.vouchers;
          if (id == 2) {
            if (restsList.length < 1) {
              this.selectComponent("#default").show();
            } else {
              this.selectComponent("#default").hide();
            }
            this.setData({
              chooseCouponList: restsList,
              content: '不可与活动、会员卡权益折叠使用'
            })
          }
          this.setData({
            restsNum,
            restsList
          })
          let freeList = this.data.freeList;
          let filmCount = this.filmCount;
          if (freeList.length == 0 && restsList.length > 0) {
            this.setData({
              chooseCouponList: restsList,
              id: 2,
              content: '不可与活动、会员卡权益折叠使用'
            })
            this.selectComponent("#default").hide();
          } else if (restsList.length == 0 && filmCount > 0) {
            this.setData({
              chooseCouponList: freeList,
              id: 1,
              content: '免费兑换券可使用多张'
            })
          }
        }, 200)
      })
      .catch(() => {
      })
    let checked = app.globalData.couponIndex;
    if (checked.length > 0) {
      this.setData({
        checked,
        voucherCode: checked
      })
    }
  },

  /**
   * 切换列表
   */
  switcher(e) {
    let id = e.currentTarget.dataset.id;
    let ids = this.data.id;
    if (id == ids) {
      return
    } else if (id == 1) {
      let {
        freeList
      } = this.data;
      if (freeList.length < 1) {
        this.selectComponent("#default").show();
      } else {
        this.selectComponent("#default").hide();
      }
      this.setData({
        chooseCouponList: freeList,
        id,
        content: `免费兑换券可使用多张`,
        checked: []
      })
    } else {
      let restsList = this.data.restsList;
      if (restsList.length < 1) {
        this.selectComponent("#default").show();
      } else {
        this.selectComponent("#default").hide();
      }
      this.setData({
        chooseCouponList: restsList,
        id,
        content: '不可与活动、会员卡权益折叠使用',
        checked: []
      })
    }
  },

  /**
   *  支付前选择券
   */
  chooseCoupon(e) {
    let {voucherName, voucherCode} = e.detail;
    let {
      id,
      checked
    } = this.data;
    let filmCount = this.filmCount;
    if (id == 1) {
      if (checked.indexOf(voucherCode) == -1) {
        if (checked.length < filmCount) {
          checked.push(voucherCode)
        } else {
          showToast(`本次消费最多选择${filmCount}张券`);
          return
        }
      } else {
        let index = checked.indexOf(voucherCode);
        checked.splice(index, 1)
      }

      this.setData({
        voucherCode: checked,
        voucherName,
        checked
      })
    } else {
      checked = [];
      if (checked.length < 1) {
        checked.push(voucherCode)
      }
      this.setData({
        voucherCode: checked,
        voucherName,
        checked
      })
    }
  },

  /**
   * 确认选券
   */
  confirm() {

    let checked = this.data.checked;
    let isCard = this.data.isCard;
    let filmCount = this.filmCount;
    if (checked.length < 1) {
      showToast('请选择优惠券')
      return
    }

    let url = '';
    let type = this.data.type;
    let cardType = this.data.cardType;
    let {voucherName, voucherCode} = this.data;
    if (voucherName != '') {
      app.globalData.voucherName = voucherName;
    }
    voucherCode = voucherCode.join(',');
    if (type == 1) {
      url = prepayment;
    } else if (type == 2) {
      url = goodsPrepayment;
    }
    let params = {
      orderNo: this.data.orderNo,
      bindType: "1",
      prefAccount: voucherCode
    };
    if (isCard == 1) params.bindType = 2;
    if (checked.length ==  filmCount) {
      params.bindType = '1';
    }
    ajaxPromise(true, url, params)
      .then((res) => {
        let couponData = res.resultData;
        if (!couponData.voucherName || couponData.voucherName == '') {
          couponData.voucherName = app.globalData.voucherName;
        }
        couponData.cardCode = voucherCode;
        couponData.bindType = params.bindType;
        if (res.resultCode == '0') {
          let pages = getCurrentPages();
          let prevPage = pages[pages.length - 2]; //上一个页面
          let checked = this.data.checked;
          prevPage.options.couponData = couponData;
          prevPage.options.id = this.data.id;
          prevPage.options.orderNo = this.data.orderNo;
          prevPage.options.bindType = params.bindType;
          app.globalData.couponIndex = checked;
          if (cardType != 1 || checked.length ==  filmCount) {
            prevPage.options.chooseCardData = '';
            app.globalData.cardIndex = '';
          }
          this.setData({
            isAffirm: true
          })
          wx.navigateBack({
            delta: 1
          })
        }
      })
      .catch((res) => {
        app.globalData.couponIndex = [];
      })
  },

  /**
   * 不使用 优惠券
   */
  noCard() {
    this.setData({
      isAffirm: true
    });
    let type = this.data.type;
    let {
      cardIndex,
      cardType
    } = app.globalData;
    if (cardIndex) {
      let url;
      if (type == 1) {
        url = prepayment;
      } else if (type == 2) {
        url = goodsPrepayment;
      }
      ajaxPromise(true, url, {
        orderNo: this.data.orderNo,
        bindType: "0",
        prefAccount: cardIndex,
        cardType
      })
        .then((res) => {
          let chooseCardData = res.resultData;
          chooseCardData.bindType = 0;
          if (res.resultCode == '0') {
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2]; // 上一个页面
            prevPage.options.chooseCardData = chooseCardData;
            prevPage.options.orderNo = this.data.orderNo;
            app.globalData.cardType = cardType;
            prevPage.options.couponData = '';
            app.globalData.couponIndex = [];
            wx.navigateBack({
              delta: 1
            })
          }
        })
        .catch(() => {
        })
    } else {
      let freeList = this.data.freeList;
      let restsList = this.data.restsList;
      let filmCount = this.filmCount;
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2]; // 上一个页面
      prevPage.options.couponData = '';
      prevPage.options.orderNo = this.data.orderNo;
      if (freeList.length > 0) {
        prevPage.options.id = 1;
      } else if (freeList.length == 0 && restsList.length > 0) {
        prevPage.options.id = 2;
      } else if (freeList.length == 0 && restsList.length == 0 && filmCount > 0) {
        prevPage.options.id = 1;
      }
      app.globalData.couponIndex = [];
      wx.navigateBack({
        delta: 1
      })
    }
  },

  /**
   * 绑券
   */
  clickBtn() {
    wx.navigateTo({
      url: `/pages/nav-my/binding/binding?id=1`
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    let {
      isAffirm,
    } = this.data;
    if (!isAffirm) {
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2]; // 上一个页面
      prevPage.options.chooseCardData = '';
      prevPage.options.couponData = '';
      app.globalData.cardIndex = '';
      app.globalData.couponIndex = [];
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },
})
