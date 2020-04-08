import {
  URL
} from '../../../utils/config.js';

import {
  ajaxPromise,
  showToast,
} from '../../../utils/util.js';

let {
  orderCardList,
  checkPassword,
  prepayment,
  goodsPrepayment
} = URL || '';

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    source: 1,
    balancePwd: '',
    showInput: false,
    chooseCardData: {},
    currentIndex: 999,
    iPhoneX: false,
    cardName: '',
    cardType: '',
    cardCode: '',
    isCoupon: 0,
    storeCard: [],
    noStoreCard: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
    let orderNo = options.orderNo;
    this.setData({
      orderNo,
      isCoupon: options.isCoupon,
      type: options.type,
      iPhoneX: app.globalData.iPhoneX
    })

    // 列表数据
    this.getList(orderNo)
    // 检查用户是否设置交易密码
    ajaxPromise(false, checkPassword, {})
      .then((res) => {
        let balancePwd = res.resultData.balancePwd;
        if (balancePwd == 1) {
          this.setData({
            balancePwd,
            showInput: true
          })
        }
      })
      .catch(() => {
      })
  },

  /**
   * 获取列表
   */
  getList(orderNo) {
    // 列表数据
    ajaxPromise(true, orderCardList, {
      orderNo: orderNo,
      pageNo: "1"
    })
      .then((res) => {
        let orders = res.resultData.orders.length || 0;
        let isCoupon = this.data.isCoupon;
        if (orders <= 0) {
          this.selectComponent("#default").show();
        } else {
          this.selectComponent("#default").hide();
          this.setData({
            chooseCardData: res.resultData
          })
          if (isCoupon == 1) {
            this.cardClassify(res.resultData.orders)
          }
        }
      })
      .catch(() => {
        let {chooseCardData} = this.data || '';
        let list = chooseCardData.orders || 0;
        if (list) {
          return false;
        }
        this.selectComponent("#default").show();
      })
  },

  /**
   *  会员卡分类
   */
  cardClassify(data) {
    let storeCard = [];
    let noStoreCard = [];
    data.forEach(element => {
      if (element.cardType == 1) {
        storeCard.push(element)
      } else {
        noStoreCard.push(element)
      }
    })
    this.setData({
      storeCard,
      noStoreCard
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: '选择会员卡'
    });
  },

  /**
   *
   * @param {} 选择会员卡
   */
  choosedCard(e) {
    // console.log(e)
    let balancePwd = this.data.balancePwd;
    let {
      cardName,
      cardType,
      cardCode
    } = e.detail;

    if (balancePwd == 1) {
      app.globalData.cardIndex = '';
      this.setData({
        showInput: true
      })
      return;
    }

    this.setData({
      cardName,
      cardType,
      cardCode,
      currentIndex: cardCode
    })
  },

  /**
   * 确定使用已选会员卡
   */
  confirm() {
    let {
      cardType,
      cardCode,
      type,
      isCoupon,
      currentIndex
    } = this.data;
    let url;
    if (type == 1) {
      url = prepayment;
    } else if (type == 2) {
      url = goodsPrepayment;
    }

    let params = {
      orderNo: this.data.orderNo,
      bindType: "0",
      prefAccount: cardCode || currentIndex,
      cardType
    };
    if (isCoupon == 1) params.bindType = 3;
    ajaxPromise(true, url, params)
      .then((res) => {
        let chooseCardData = res.resultData;
        chooseCardData.bindType = params.bindType;
        if (chooseCardData.cardType == '10' || chooseCardData.cardType == '11') {
          chooseCardData.cardName = '实体卡'
        }
        if (res.resultCode == '0') {
          let pages = getCurrentPages();
          let prevPage = pages[pages.length - 2]; // 上一个页面
          prevPage.options.chooseCardData = chooseCardData;
          prevPage.options.orderNo = this.data.orderNo;
          prevPage.options.bindType = params.bindType;
          app.globalData.cardIndex = this.data.currentIndex;
          app.globalData.cardType = cardType;
          if (cardType != 1) {
            prevPage.options.couponData = '';
            app.globalData.couponIndex = [];
          }
          wx.navigateBack({
            delta: 1
          })
        }
      })
      .catch(() => {
      })
  },

  /**
   * 不使用 会员卡
   */
  noCard() {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2]; // 上一个页面
    prevPage.options.chooseCardData = '';
    prevPage.options.orderNo = this.data.orderNo;
    app.globalData.cardIndex = '';
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let currentIndex = app.globalData.cardIndex;
    let cardType = app.globalData.cardType;
    this.setData({
      currentIndex,
      cardType
    })
  },

  /**
   * 暂不设置
   */
  closeInput() {
    this.setData({
      showInput: false
    })
  },

  /**
   * 设置成功
   */
  confirmPassword() {
    showToast('密码设置成功')
    this.setData({
      showInput: false,
      balancePwd: 0
    })
  },

  /**
   * 绑券
   */
  clickBtn() {
    wx.navigateTo({
      url: `/pages/nav-my/binding/binding?id=2`
    })
  },

  /**
   * 刷新
   */

  refresh() {
    this.getList(this.data.orderNo)
  },


  valueSix(e) {
    //  console.log(e);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  }
})
