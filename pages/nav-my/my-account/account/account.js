import {
  URL
} from '../../../../utils/config';

import {
  ajaxPromise,
  showToast
} from '../../../../utils/util';

const {
  cardsList
} = URL || '';

// 账号安全
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
    ajaxPromise(false, cardsList, {
      pageNo: 1,
      cardType: 1
    })
      .then((res) => {
        let orders = res.resultData.orders.length || 0;
        if (orders > 0) {
          this.setData({
            valid: true
          })
        } else {
          this.setData({
            valid: false
          })
        }
      })
      .catch(() => {
      })
  },

  /**
   * 重设支付密码
   */
  toRecompose() {
    let valid = this.data.valid;
    if (!valid) {
      showToast('您还没有储值卡,无需重设密码');
      return
    }
    wx.navigateTo({
      url: '../modify/modify'
    })
  },

  /**
   * 修改手机号
   */

  changePhone(){
    wx.navigateTo({
      url:'/pages/sign-in/bind-phone/bind-phone?source=1'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: '账号安全'
    })
  },
  onShow(){
    let phone = wx.getStorageSync('member').phone;
    if (phone) {
      phone = phone.substr(0, 3) + '****' + phone.substr(7, 4);
      this.setData({
        phone
      })
    }
  },
})
