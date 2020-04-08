// pages/nav-my/card-detailed/card-detailed.js

import {
  ajaxPromise
} from '../../../../utils/util';

import {
  URL
} from '../../../../utils/config';

const {
  cardConsumeInfo
} = URL

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
  },
  cardNo: '',
  pageNo: 1,
  hasNext: false,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
    let val = JSON.parse(options.val)
    this.cardNo = val.cardCode
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: '账户明细'
    })
  },

  /**
   * 获取卡账单
   */
  getCardList(pageNo) {
    ajaxPromise(true, cardConsumeInfo, {
      pageNo,
      cardNo: this.cardNo
    })
      .then((res) => {
        this.pageNo += 1;
        this.cardConsumeInfoCall(res)
      })
      .catch(() => {
      })
  },

  /**
   * 卡账单成功回调
   */

  cardConsumeInfoCall(res) {
    let cardInfo = res.resultData.cardInfo;
    let cardOrderList = res.resultData.cardOrderList;
    this.hasNext = res.resultData.hasNext;
    let list = this.data.list;
    cardOrderList.forEach(element => {
      element.state = element.consumeType === '消费退款';
      list.push(element)
    })
    this.setData({
      cardInfo,
      list
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.pageNo = 1;
    this.setData({
      list: []
    });
    this.getCardList(1)
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
    let hasNext = this.hasNext;
    if (hasNext) {
      this.getCardList(this.pageNo)
    }
  }
})
