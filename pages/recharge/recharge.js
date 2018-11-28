// pages/recharge/recharge.js
import {
  $requestPayment,
  $showToast,
  $getData
} from '../../utils/packaging.js'
var url = require('../../utils/url.js'),
  rechargeOrder = url.rechargeOrder,
  initPay = url.initPay,
  movieCode = wx.getStorageSync('movieCode'),
  cinemaCode = wx.getStorageSync('cinemaCode'),
  memberCode = wx.getStorageSync('memberCode'),
  member = wx.getStorageSync('member'),
  CVersion = wx.getStorageSync('CVersion'),
  OS = wx.getStorageSync('OS');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rechargeAmount: 0,
    cardCode: 0,
    cardName: '',
    cardNo: '',
    moneys: [50, 100, 200],
    money: 0,
    inputVal: 0,
    catHighLightIndex: 0,
    val: '',
    flag: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
    let data = JSON.parse(options.time);
    let rechargeAmount = data.rechargeAmount / 100;
    let cardCode = data.cardCode;
    let cardName = data.cardName;
    let cardNo = data.cardCode;
    let moneys = [];
    let j = 1;
    for (let i = 1; i < 4; i++) {
      let amount = rechargeAmount * j;
      j = j * 2
      moneys.push(amount)
    }
    this.setData({
      rechargeAmount,
      cardCode,
      cardName,
      cardNo,
      moneys
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.setNavigationBarTitle({
      title: '卡充值'
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let money = this.data.moneys[0];
    this.setData({
      money
    })
  },

  /*
  选择金额
  */
  select(e) {
    let index = e.target.dataset.index;
    let money = e.target.dataset.time;
    this.setData({
      catHighLightIndex: index,
      money,
      val: ''
    })
  },

  /*
  输入框获取焦点
  */
  focusFn(e) {
    console.log(e)
    this.setData({
      catHighLightIndex: -1,
      money: 0,
      inputVal: 0
    })
    console.log(this.data.inputVal, this.data.money)
  },

  /*
  获取输入的值
  */
  bindKeyInput(e) {
    let val = e.detail.value;
    this.setData({
      inputVal: val
    })
  },

  /*
  充值
  */
  rechargeCard() {
    if (this.data.flag) {
      this.setData({
        flag: false
      })
    } else {
      return false
    }
    setTimeout(() => {
      if (memberCode == '' || memberCode == undefined) {
        memberCode = member.memberCode;
      }
      let rechargeAmount = this.data.rechargeAmount;
      let cardNo = this.data.cardNo;
      let inputVal = this.data.inputVal;
      let money = this.data.money;
      let rechargeMoney = 0;
      if (money == 0 && inputVal < rechargeAmount && inputVal != 0) {
				$showToast(`不能低于最低限额${rechargeAmount}元`);
        this.setData({
          flag: true
        })
        return false
      }
      // console.log(t.data.inputVal, t.data.money)
      if (inputVal != 0 && money == 0) {
        rechargeMoney = inputVal;
      } else if (inputVal == 0 && money != 0) {
        rechargeMoney = money;
      } else if (inputVal == 0 && money == 0) {
				$showToast('请输入充值金额');
        this.setData({
          flag: true
        })
        return false
      }
      this.setData({
        flag: true
      })
      let rechargeData = {
        'cinemaCode': cinemaCode,
        'memberCode': memberCode,
        'cardNo': cardNo,
        'rechargeMoney': rechargeMoney,
        'channel': 5
      }
      $getData(rechargeOrder, rechargeData, this.rechargeOrderSucc)
    }, 1000)
  },

  // 创建订单成功回调
  rechargeOrderSucc(res) {
    if (res.data.resultCode == 500) {
      $showToast(res.data.resultData)
      return false
    }
    let orderId = res.data.resultData.orderNo;
    let params = {
      'cinemaCode': cinemaCode,
      'memberCode': memberCode,
      'companyCode': movieCode,
      'openId': member.openid,
      'CVersion': CVersion,
      'OS': OS,
      'token': member.token,
      'orderNo': orderId,
      'payType': 1,
      'orderType': 4
    }
    $getData(initPay, params, this.initPayScc)
  },

  // 预支付成功回调
  initPayScc(res) {
    if (res.data.resultCode == 0) {
      let data = res.data.resultData;
      $requestPayment(data, this.requestPaymentSucc, this.requestPaymentFail)
    } else {
      $showToast(res.data.resultData);
    }
  },

  // 微信支付成功回调
  requestPaymentSucc(res) {
    wx.hideLoading();
    if (res.errMsg == "requestPayment:ok") {
      wx.navigateTo({
        url: './Card-Order/Card-Order?isSucceed=succeed',
      })
    }
  },

  // 微信支付失败回调
  requestPaymentFail(res) {
    wx.hideLoading();
    if (res.errMsg == "requestPayment:fail cancel") {
      return false
    } else if (res.errMsg == "requestPayment:fail") {
      return false
    } else {
      wx.navigateTo({
        url: './Card-Order/Card-Order?isSucceed=defeated',
      })
    }
  }
})