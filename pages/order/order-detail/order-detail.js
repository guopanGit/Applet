// pages/order/order-detail/order-detail.js

import {
  ajaxPromise,
  formatTime,
  payOrder,
  wxPayment,
  showToast,
  formatNumber
} from '../../../utils/util';

import {
  URL
} from '../../../utils/config';

const {
  mixtureOderDetail, // 获取混合 影票 订单详情
  goodOderDetail, // 获取卖品订单详情
  cardOderDetail, // 获取会员卡订单详情
  cancelCardOrder, // 取消会员卡订单
  cancelOrder, // 取消订单
  refundTicket
} = URL || '';

let timer;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    qrcode: `${URL.PREFIXNL}/qrcode/qrcode/getQRCode`, //影票二维码
    barcode: `${URL.PREFIXNL}/barCode/barCode/getBarCode`, //卖品条形码
    type: '',
    orderNo: '',
    orderS: 0,
    cardDetil: {},
    mixtureDetil: '',
    common: {},
    switch: false,
    inputPsd: false,
    countTime: '10:20',
    orderType: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
    this.setData({
      type: options.type,
      orderNo: options.orderNo,
      orderS: options.orderS,
      orderType: options.orderType,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: '订单详情'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let {
      type,
      orderNo
    } = this.data;
    let data = {
      orderNo
    }
    if (type == '3') {
      ajaxPromise(true, cardOderDetail, {
        orderNo
      })
        .then((res) => {
          this.cardOderDetailCall(res)
        })
        .catch(() => {
        })
    } else if (type == '1') {
      ajaxPromise(true, mixtureOderDetail, {
        orderNo
      })
        .then((res) => {
          this.mixtureOderDetailCall(res)
        })
        .catch(() => {
        })
    } else if (type == '2') {
      data.orderId = orderNo;
      ajaxPromise(true, goodOderDetail, {
        orderId: orderNo
      })
        .then((res) => {
          this.goodOderDetailCall(res)
        })
        .catch(() => {
        })
    }

  },
  /**
   * 获取卡订单成功回调
   */

  cardOderDetailCall(res) {
    let cardDetil = res.resultData;
    this.setData({
      cardDetil
    })
  },
  /**
   * 获取影票订单成功回调
   */

  mixtureOderDetailCall(res) {
    let mixtureDetil = res.resultData;
    if (mixtureDetil.showStartTime) {
      mixtureDetil.showStartTime = formatTime(new Date(mixtureDetil.showStartTime), 5);
    }
    let totalPrice = (mixtureDetil.orderPrice - mixtureDetil.favorPrice) / 100;
    let orderTimeOut = mixtureDetil.orderTimeOut;
    mixtureDetil.payWay == 3 ? mixtureDetil.payWay = 5 : (mixtureDetil.payWay == 4 ? mixtureDetil.payWay = mixtureDetil.cardType : mixtureDetil.payWay)
    if (mixtureDetil.ticketNo) {
      let tag = ',';
      if (mixtureDetil.ticketNo.indexOf(',') != -1) {
        tag = ','
      } else if (mixtureDetil.ticketNo.indexOf('|') != -1) {
        tag = '|'
      }
      mixtureDetil.ticketNo = mixtureDetil.ticketNo.split(tag) || []
    }
    if (mixtureDetil.qrCode) {
      mixtureDetil.tickeQrCode = `?content=${mixtureDetil.qrCode}&posType=${mixtureDetil.posType}&cinemaCode=${mixtureDetil.cinemaCode}`
    } else {
      mixtureDetil.tickeQrCode = '';
    }
    let common = {
      actualPrice: mixtureDetil.actualPrice / 100,
      applyRefundTime: mixtureDetil.applyRefundTime,
      cinemaStatus: mixtureDetil.cinemaStatus || 0,
      cinemaName: mixtureDetil.cinemaName,
      prefAccount: mixtureDetil.prefName,
      prefType: mixtureDetil.prefType,
      orderMobile: mixtureDetil.orderMobile,
      orderNo: mixtureDetil.orderNo,
      orderTime: mixtureDetil.orderTime,
      orderType: mixtureDetil.orderType,
      goodsNo: mixtureDetil.goodsNo,
      takeFlag: mixtureDetil.takeFlag,
      orderState: mixtureDetil.orderState,
      totalPrice,
      payType: mixtureDetil.payWay,
      contactPhone: mixtureDetil.theaterPhone,
      posType: mixtureDetil.posType,
      refundStatus: mixtureDetil.refundStatus,
      refundDefaultImage: mixtureDetil.refundDefaultImage || '',
      goodsQrCode: `?content=${mixtureDetil.goodsNo}&posType=${mixtureDetil.posType}&cinemaCode=${mixtureDetil.cinemaCode}`
    };
    let goodsNo = common.goodsNo || '';
    if (goodsNo != '') {
      goodsNo = goodsNo.split(',');
    } else {
      goodsNo = []
    }
    common.goodsNo = goodsNo;
    orderTimeOut <= 0 ? orderTimeOut = 0 : orderTimeOut;
    if (mixtureDetil.orderState == '1000') this._countDown(orderTimeOut)

    switch (mixtureDetil.orderState) {
      case 1000:
        cardDetil.state = '待支付';
        break;
    }
    this.setData({
      mixtureDetil,
      common
    })
  },

  /**
   * 获取卖品订单详情
   */
  goodOderDetailCall(res) {
    let goodsDetil = res.resultData;
    if (goodsDetil.payType) {
      goodsDetil.payType == 3 ? goodsDetil.payType = 5 : (goodsDetil.payType == 4 ? goodsDetil.payType = goodsDetil.cardType : goodsDetil.payType)
    }
    if (goodsDetil.pickupGoodsCode) {
      goodsDetil.pickupGoodsCode = goodsDetil.pickupGoodsCode.split(',') || []
    }
    let common = {
      actualPrice: goodsDetil.realPrice / 100,
      cinemaStatus: goodsDetil.cinemaStatus || 0,
      applyRefundTime: goodsDetil.applyRefundTime,
      cinemaName: goodsDetil.cinemaName,
      cinemaCode: goodsDetil.cinemaCode,
      prefAccount: goodsDetil.prefName,
      prefType: goodsDetil.prefType,
      orderMobile: goodsDetil.phone,
      orderNo: goodsDetil.orderId,
      orderTime: goodsDetil.createTime,
      orderType: goodsDetil.type,
      goodsNo: goodsDetil.pickupGoodsCode,
      takeFlag: goodsDetil.takeFlag,
      orderState: goodsDetil.orderState,
      totalPrice: goodsDetil.totalPrice / 100,
      payType: goodsDetil.payType,
      contactPhone: goodsDetil.tel,
      posType: goodsDetil.posType,
      refundStatus: goodsDetil.refundStatus || 0,
      refundDefaultImage: goodsDetil.refundDefaultImage || '',
      goodsQrCode: `?content=${goodsDetil.pickupGoodsCode}&posType=${goodsDetil.posType}&cinemaCode=${goodsDetil.cinemaCode}`
    }
    this.setData({
      goodsDetil,
      common
    })
  },

  /**
   * 更多卖品开关
   */

  switch() {
    this.setData({
      switch: !this.data.switch
    })
  },

  /**
   * 支付订单
   */
  orderPay() {
    let common = this.data.common;
    let type = this.data.type;
    if (type == '1') {
      common.orderType = 1
    } else if (type == '2') {
      common.orderType = 2
    } else if (type == '3') {
      common = this.data.cardDetil;
      common.orderType = 6
    }

    if (common.payType == 5 || common.payType == 10 || common.payType == 11) {
      // 卡支付
      this.setData({
        inputPsd: true
      })
    } else {
      // 默认支付
      payOrder(common.orderType, common.orderNo, this.orderPayCall)
    }
  },

  /**
   * 支付订单成功回调
   */

  orderPayCall(res) {
    if (res.resultCode == '500') {
      showToast(res.resultDesc)
      return
    }
    let wxPayPara = res.resultData;
    wxPayment(wxPayPara, this.wxPaymentCall)
  },
  /**
   * 微信支付成功回调
   */
  wxPaymentCall(res) {
    if (res.errMsg == "requestPayment:ok") {
      let {
        type,
        orderNo
      } = this.data;
      if (type == '3') {
        ajaxPromise(true, cardOderDetail, {
          orderNo
        })
          .then((res) => {
            this.cardOderDetailCall(res)
          })
          .catch(() => {
          })
      } else if (type == '1') {
        ajaxPromise(true, mixtureOderDetail, {
          orderNo
        })
          .then((res) => {
            this.mixtureOderDetailCall(res)
          })
          .catch(() => {
          })
      } else if (type == '2') {
        ajaxPromise(true, goodOderDetail, {
          orderId: orderNo
        })
          .then((res) => {
            this.goodOderDetailCall(res)
          })
          .catch(() => {
          })
      }
    }
  },

  /**
   * 取消商品订单
   */
  cancelCard() {
    wx.showModal({
      title: '',
      content: '是否取消订单',
      success: res => {
        if (res.confirm) {
          let orderCode = this.data.cardDetil.orderNo;
          ajaxPromise(true, cancelCardOrder, {
            orderCode
          })
            .then((res) => {
              this.cancelCardCall(res)
            })
            .catch(() => {
            })
        }
      }
    })
  },

  /**
   * 取消卡订单成功回调
   */
  cancelCardCall(res) {
    if (res.resultCode == '0') {
      wx.showToast({
        title: '订单已取消',
        icon: 'none',
        duration: 2000,
        mask: true
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1, // 回退前 delta(默认为1) 页面
        })
      }, 2000)
    }
  },

  /**
   * 取消订单
   */

  cancel() {
    wx.showModal({
      title: '',
      content: '是否取消订单',
      success: res => {
        if (res.confirm) {
          let orderNo = this.data.common.orderNo;
          ajaxPromise(true, cancelOrder, {
            orderNo
          })
            .then((res) => {
              this.cancelCardCall(res)
            })
            .catch(() => {
            })
        }
      }
    })
  },

  /**
   * 联系影城
   */

  contact() {
    let phong = this.data.common.contactPhone;
    wx.makePhoneCall({
      phoneNumber: phong
    })
  },

  /**
   * 去电子影票
   */

  goTicket() {
    let data = this.data.mixtureDetil
    let val = {
      filmName: data.filmName,
      hallName: data.hallName,
      filmLang: data.filmLang,
      filmSight: data.filmSight,
      showTime: data.showTime,
    }
    let ticketInfos = data.ticketInfos
    getApp().globalData.ticketInfos = ticketInfos
    val = JSON.stringify(val)
    wx.navigateTo({
      url: `/pages/order/network-ticket/network-ticket?val=${val}`
    })
  },

  /**
   * 付款成功
   */
  confirmPassword() {
    this.setData({
      inputPsd: false
    })
  },

  /**
   * 倒计时
   */
  _countDown(countTime) {
    let formatCount = formatTime(new Date(countTime), 2);
    let minute = formatCount.split(":")[0];
    let second = formatCount.split(":")[1];
    this.setData({
      countTime: minute + ':' + second
    })
    timer = setInterval(() => {
      if (second > 0) {
        second--;
        second = formatNumber(second);
      }
      if (second == 0 && minute > 0) {
        minute--;
        minute = formatNumber(minute);
        second = 59;
      }
      if (second == 0 && minute == 0) {
        wx.showModal({
          title: '',
          content: '支付超时，请重新选座',
          showCancel: false,
          success: res => {
            if (res.confirm) {
              let orderNo = this.data.common.orderNo;
              ajaxPromise(true, cancelOrder, {
                orderNo
              }).then((res) => {
                wx.navigateBack({
                  delta: -1
                })
              })
                .catch(() => {
                })
            }
          }
        })
        clearInterval(timer);
      }
      this.setData({
        countTime: minute + ':' + second
      })
    }, 1000);
  },

  /**
   * 去使用停车券
   */
  goUse() {
    wx.navigateTo({
      url: '/pages/nav-my/my-coupon/my-coupon'
    })
  },

  /**
   * 退款
   */
  refund() {
    let orderNo = this.data.orderNo;
    wx.showModal({
      title: '',
      content: '确定将此宝座拱手让位吗?',
      confirmText: '含泪退款',
      cancelText: '打死不让',
      cancelColor: '#ccc',
      success(res) {
        if (res.confirm) {
          ajaxPromise(true, refundTicket, {orderNo})
            .then((res) => {
              showToast('退款成功');
              setTimeout(() => {
                wx.navigateBack({
                  data: 1
                })
              }, 2000)
            })
            .catch(() => {
            })
        }
      }

    })
  },

  // 放大条形码
  magnify(e) {
    let src = e.currentTarget.dataset.src;
    let urls = [];
    urls.push(src)
    wx.previewImage({
      urls,
      current: src
    })
  },


  /**
   * 隐藏密码输入框
   */
  hideInput() {
    this.setData({
      inputPsd: false
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    clearInterval(timer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    clearInterval(timer);
  },

})
