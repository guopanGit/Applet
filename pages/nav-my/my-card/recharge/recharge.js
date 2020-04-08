// 充值

import {
  showToast,
  creatOrder,
  payOrder,
  wxPayment
} from '../../../../utils/util.js';

import {
  URL
} from '../../../../utils/config';

const {
  recharge
} = URL;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rechargeAmount: 0,
    cardCode: 0,
    cardName: '',
    moneys: [50, 100, 200],
    money: 0,
    inputVal: 0,
    catHighLightIndex: 0,
    val: '',
    placeholder: '其他金额'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
     // console.log(data)
    let {
      cardCode,
      cardName,
      rechargeAmount
    } = JSON.parse(options.val) || '';
    rechargeAmount = rechargeAmount / 100;

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
      moneys
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
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
      money,
      val: '',
      inputVal: 0,
      catHighLightIndex: 0
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
      val: '',
      inputVal: 0
    })
  },

  /*
  输入框获取焦点
  */
  focusFn(e) {
    this.setData({
      catHighLightIndex: -1,
      money: 0,
      inputVal: 0,
      placeholder: ''
    })
  },

  overFn() {
    this.setData({
      placeholder: '其他金额'
    })
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
    let rechargeAmount = this.data.rechargeAmount;
    let inputVal = this.data.inputVal;
    let money = this.data.money;
    let rechargeMoney = 0;
    if (money == 0 && inputVal < rechargeAmount && inputVal != 0) {
      showToast(`不能低于最低限额${rechargeAmount}元`);
      return
    } else if (inputVal == 0 && money == 0) {
      showToast(`不能低于最低限额${rechargeAmount}元`);
      return
    } else if (inputVal != 0 && money == 0) {
      rechargeMoney = inputVal;
    } else if (inputVal == 0 && money != 0) {
      rechargeMoney = money;
    }

    creatOrder(4, {
      cardNo: this.data.cardCode,
      rechargeMoney,
    }, (res) => {
      if (res.resultCode == 0) {
        let orderNo = res.resultData.orderNo;
        payOrder(4, orderNo, (res) => {
          if (res.resultCode == '0') {
            let data = res.resultData;
            wxPayment(data, (res) => {
              wx.navigateTo({
                url: `/pages/success/success?orderNo=${orderNo}&type=1`
              })
            }, (res) => {
               // console.log(res);
            })
          }
        })
      } else {
        showToast('支付失败')
      }
    })
  }
})
