/**
 * 导入封装函数
 */

import {
  URL
} from '../../../utils/config.js';

import {
  ajaxPromise,
  showToast,
  formatTime,
  formatNumber,
  payOrder,
  wxPayment
} from '../../../utils/util.js';

const app = getApp();
let {
  submitOrder,
  queryCoupon,
  queryVipCard,
  sellGoodsOrder,
  getTakeOutInfo,
  orderBinding,
  addRemarks,
  goodsOrderBinding,
  payExchange,
  cancelOrder,
  payBack
} = URL;

let timer = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: '',
    countTime: "",
    showLayer: false,
    usableCoupon: 0,
    usableCard: 0,
    agreement: wx.getStorageSync('agreeMent'),
    orderDetail: {},
    goodsDetail: {},
    detail: {},
    checked: true,
    hallInfo: [],
    multiArray: [],
    value: '请选择 (仅显示可配送影厅)',
    takeoutFee: 0,
    showMark: false,
    showSeat: false,
    showDate: false,
    showAllot: false,
    isEnd: true, // 是否结束滚动
    remarks: '',
    dayIndex: 0,
    items: [],
    itemIndex: 0,
    time: '',
    isDate: false,
    couponData: '',
    chooseCardData: '',
    bindType: '-1',
    cardType: '2',
    prefAccount: '',
    inputPsd: false,
    isDistribution: false,
    payMark: false,
    cinemaStatus: '1',
    goodsDate: false,
    getGoodsTime: '立即取货（约10分钟）',
    allocation: 0, // 取货时间 毫秒
    goodsType: 0,
    filmCount: 0,
    id: 1
  },
  isFirst: true, // 是否是第一次进入页面
  isSubmit: false, // 是否确认订单
  isOK: true,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
    this.getGoods();
    app.globalData.couponIndex = [];
    app.globalData.voucherName = [];
    let type = options.type || 0;
    let hallCode = wx.getStorageSync('hallCode');
    if (type) {
      this.isFirst = false;
      ajaxPromise(false, sellGoodsOrder, {
        orderId: options.orderNo
      })
        .then((data) => {
          let sendFlag = data.resultData.sendFlag;
          let goodsType = wx.getStorageSync('type');
          if (sendFlag == '1' && goodsType != 1) {
            ajaxPromise(true, getTakeOutInfo, {})
              .then((res) => {
                let hallInfo = res.resultData.hallInfo;
                let timeInfo = res.resultData.timeInfo;
                let takeoutFee = res.resultData.takeoutFee;
                let multiArray = [];
                let items = timeInfo[0].child;
                let time = timeInfo[0].child[0].name;
                multiArray.push(hallInfo);
                multiArray.push(hallInfo[0].child);
                multiArray.push(hallInfo[0].child[0].child);
                this.setData({
                  multiArray,
                  timeInfo,
                  hallInfo,
                  items,
                  time,
                  takeoutFee,
                  isDistribution: true
                })
                this.goodsOrderCall(data)
              })
              .catch(() => {
                this.setData({
                  checked: false
                })
                this.goodsOrderCall(data)
              })
          } else {
            this.goodsOrderCall(data)
          }
        })
        .catch(() => {
        })
    }
    if (hallCode) {
      let movie = wx.getStorageSync('movie');
      let row = wx.getStorageSync('row');
      let seat = wx.getStorageSync('seat');
      let sendAddress = `${movie} ${row} ${seat}`;
      ajaxPromise(false, addRemarks, {
        orderId: options.orderNo,
        sendAddress
      })
        .then((res) => {
          this.setData({
            value: sendAddress
          })
        })
        .catch(() => {
          this.setData({
            value: sendAddress
          })
        })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: '确认订单'
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow() {
    let pages = getCurrentPages();
    let options = pages[pages.length - 1].options;
    let orderNo = options.orderNo;
    let type = options.type;
    let id = options.id;
    let bindType = options.bindType || '-1';
    let params = {
      orderNo,
      bindType
    };
    if (id) {
      this.setData({
        id
      })
    }
    if (options.couponData) {
      let couponData = options.couponData;
      couponData.minus = false;
      let {
        oldPayAmount,
        ticketAmount,
        goodsAmount,
        paymentAmount,
        bindType
      } = couponData || 0;
      let covTdiscount = couponData.covTdiscount || couponData.covGdiscount;
      if(Number(covTdiscount) < 0){
        couponData.minus = true;
      }
      couponData.covTdiscount = Math.abs(covTdiscount);
      if (!type) {
        couponData.discounts = oldPayAmount - (Number(ticketAmount) + Number(goodsAmount))
      } else {
        couponData.discounts = oldPayAmount - Number(paymentAmount)
      }
      params.prefAccount = couponData.cardCode;
      if(bindType == 2){
        this.setData({
          bindType
        })
      }
      this.setData({
        couponData,
        bindType,
        prefAccount: couponData.cardCode,
      })
    } else if (options.couponData == '') {
      this.setData({
        couponData: ''
      })
    }

    if (options.chooseCardData) {
      let chooseCardData = options.chooseCardData;
      chooseCardData.minus = false;
      let {
        oldPayAmount,
        ticketAmount,
        goodsAmount,
        paymentAmount,
        bindType
      } = chooseCardData || 0;
      let covTdiscount = chooseCardData.covTdiscount || chooseCardData.covGdiscount;
      if(Number(covTdiscount) < 0){
        chooseCardData.minus = true;
      }
      chooseCardData.covTdiscount = Math.abs(covTdiscount);
      if (!type) {
        chooseCardData.discounts = oldPayAmount - (Number(ticketAmount) + Number(goodsAmount))
      } else {
        chooseCardData.discounts = oldPayAmount - Number(paymentAmount)
      }
      params.prefAccount = chooseCardData.cardCode;
      params.cardType = chooseCardData.cardType;
      if(bindType == 3){
        this.setData({
          bindType
        })
      }
      this.setData({
        chooseCardData,
        cardType: chooseCardData.cardType,
        prefAccount: chooseCardData.cardCode,
      })
    } else if (options.chooseCardData == '') {
      this.setData({
        chooseCardData: ''
      })
    }

    if (type) {
      params.orderId = orderNo;
      let isFirst = this.isFirst;
      if (isFirst) {
        ajaxPromise(false, sellGoodsOrder, params)
          .then((res) => {
            this.goodsOrderCall(res)
          })
          .catch(() => {
          })
      }
      this.isFirst = true;
      this.setData({
        type
      })
    } else {
      // 订单详情
      ajaxPromise(true, submitOrder, params)
        .then((res) => {
          this.orderCall(res)
        })
        .catch(() => {
        })
      this.setData({
        type: 1
      })
    }

    // 查询可用券
    ajaxPromise(false, queryCoupon, {
      orderNo,
      pageNo: "1",
      getWay: "1",
      voucherType: "-1",
    })
      .then((res) => {
        this.queryCouponCall(res)
      })
      .catch(() => {
      })
    // 查询可用卡

    ajaxPromise(false, queryVipCard, {
      orderNo,
    })
      .then((res) => {
        this.queryCardCall(res)
      })
      .catch(() => {
      })
    this.setData({
      orderNo
    })


  },

  /**
   * @param {} 查询可用券成功回调
   */
  queryCouponCall(res) {
    //  console.log(res);
    let couponList = res.resultData;
    let usableCoupon = couponList.totalCount;
    this.setData({
      couponList,
      usableCoupon
    })
  },

  /**
   * @param {*} 查询可用卡成功回调
   */
  queryCardCall(res) {
    //  console.log(res);
    this.setData({
      usableCard: res.resultData
    })
  },

  /**
   * 影票订单成功回调
   */
  orderCall(res) {
    //  console.log(res);
    let orderDetail = res.resultData;
    let countTime = orderDetail.orderTimeOut;
    let cinemaStatus = orderDetail.cinemaStatus;
    let filmCount = orderDetail.filmCount;
    filmCount = filmCount.substring(0, filmCount.length - 1);
    this._countDown(countTime);
    orderDetail.price = orderDetail.payAmount;

    let chooseCardData = this.data.chooseCardData;
    let couponData = this.data.couponData;
    if (chooseCardData.cardName) {
      let {
        paymentAmount,
        oldPayAmount
      } = chooseCardData || 0;
      if(Number(paymentAmount) > Number(oldPayAmount)){
        showToast('此卡支付价格更高, 试试微信支付吧!')
      }
      orderDetail.price = Number(paymentAmount);
      orderDetail.ServiceCharge = Number(chooseCardData.ServiceCharge) || 0 ;
    }

    if (couponData.voucherName) {
      let {
        paymentAmount,
        oldPayAmount
      } = couponData || 0;
      if(Number(paymentAmount) > Number(oldPayAmount)){
        showToast('此券支付价格更高, 试试会员卡或微信支付吧!')
      }
      orderDetail.price = Number(paymentAmount);
      orderDetail.ServiceCharge = Number(couponData.ServiceCharge) || 0;
    }
    this.setData({
      orderDetail,
      cinemaStatus,
      filmCount
    })
  },

  /**
   * 卖品成功回调
   */
  goodsOrderCall(res) {
    let goodsDetail = res.resultData;
    let list = goodsDetail.sellRecords;
    let goods = [];

    let chooseCardData = this.data.chooseCardData;
    let couponData = this.data.couponData;
    let goodsType = wx.getStorageSync('type');
    let scene = wx.getStorageSync('scene');
    if (scene == 1011 && goodsType == 1) {
      this.setData({
        showAllot: true,
      })
    }
    this.setData({
      goodsType
    })

    let value = goodsDetail.sendAddress || this.data.value;
    value = value.replace(/,/g, ' ');

    let sendFlag = goodsDetail.sendFlag;
    // let type = goodsDetail.type;
    let takeoutFee = this.data.takeoutFee * 100;
    let checked = this.data.checked;
    list.forEach(i => {
      let data = {
        goodsName: i.sellName,
        goodsImage: i.goodsImage,
        amount: i.sellCount,
        goodsDesc: i.goodsDesc,
        goodsActualPrice: i.goodsPrice,
        storefrontPrice: i.sellPrice,
        goodsPrice: i.goodsPrice,
        isActivity: i.isActivity,
      }
      goods.push(data)
    })
    let orderDetail = {
      price: Number(goodsDetail.realPrice),
      favorPrice: 0,
      type: goodsDetail.type,
      orderMobile: goodsDetail.phone,
      goods,
      sendFlag: goodsDetail.sendFlag,
      goodsTerraceAmount: goodsDetail.totalPrice,
    };
    if (chooseCardData.cardName) {
      let {
        paymentAmount
      } = chooseCardData || 0;
      orderDetail.price = Number(paymentAmount);
    }
    if (couponData.voucherName) {
      let {
        paymentAmount
      } = couponData || 0;
      orderDetail.price = Number(paymentAmount);
    }
    let price = orderDetail.price;
    if (sendFlag == 1 && checked && goodsType != 1) { // 需支付 添加配送费
      price = Number(price) + Number(takeoutFee)
    }
    orderDetail.price = price
    this.setData({
      orderDetail,
      goodsDetail,
      value,
      remarks: goodsDetail.remarks
    })
  },

  /**
   * 选择券
   */
  chooseCoupon() {
    let {
      type,
      filmCount,
      id,
      chooseCardData
    } = this.data;
     let isCard = 0;// 是否已经选卡 0否
    if (chooseCardData != '') isCard = 1;
    wx.navigateTo({
      url: `../choose-coupon/choose-coupon?orderNo=${this.data.orderNo}&type=${type}&filmCount=${filmCount}&id=${id}&isCard=${isCard}`
    })
  },

  /**
   * 选择卡
   */
  chooseCard() {
    let price = this.data.orderDetail.price;
    if(price == 0){
      showToast('本单支付金额为0，无需选卡')
      return;
    }
    let type = this.data.type;
    let couponData = this.data.couponData;
    let isCoupon = 0; // 是否已经选券 0否
    if (couponData != '') isCoupon = 1;
    wx.navigateTo({
      url: `../choose-card/choose-card?orderNo=${this.data.orderNo}&type=${type}&isCoupon=${isCoupon}`
    })
  },


  /**
   * 退票说明
   */
  refundDes() {
    this.setData({
      showLayer: true,
      refundLayer: true,
      showMark: true
    })
  },


  /**
   * 同意协议
   */
  agreeTouch() {
    wx.setStorage({
      key: 'agreeMent',
      data: 'agree'
    })
    this.setData({
      showLayer: false,
      agreement: !this.data.agreement,
      refundLayer: false,
      showMark: false
    })
  },

  /**
   * 是否配送
   */
  setChecked() {
    let checked = this.data.checked;
    let takeoutFee = this.data.takeoutFee * 100;
    let price = this.data.orderDetail.price;
    if (checked) {
      price = price - takeoutFee;
    } else {
      price = price + takeoutFee;
    }
    this.setData({
      checked: !checked,
      'orderDetail.price': price
    })
  },

  /**
   *
   */

  payHint(){
    let _this = this;
    if (_this.isOK) {
      _this.isOK = false;
    } else {
      return;
    }

    let orderType = this.data.type;
    let cinemaStatus = this.data.cinemaStatus;
    if (orderType == 1 && !this.data.agreement && cinemaStatus == '1') {
      showToast("请先同意退票说明");
      _this.isOK = true;
    } else {
      let isHint = wx.getStorageSync('isHint') || '';
      if(isHint == '' && orderType == 1 && cinemaStatus != '1'){
        wx.showModal({
          content:'该影院暂不支持线上退票',
          showCancel:false,
          confirmText:'我知道了',
          success(res){
            if(res.confirm){
             wx.setStorageSync('isHint', 'true');
              _this.confirmOrder()
            }
          }
        })
      } else {
        _this.confirmOrder();
      }
    }
  },

  /**
   * 确认订单
   */
  confirmOrder() {
    let _this = this;
    let {
      sendFlag,
      price
    } = this.data.orderDetail;
    let {
      orderNo,
      value,
      checked,
      bindType,
      remarks,
      allocation
    } = this.data;
    let orderType = this.data.type;
    let goodsType = wx.getStorageSync('type');
    let scene = wx.getStorageSync('scene');

    let url = '';
    let mold = 0;
    let payUrl = '';
    let params = {
      orderNo,
      ticketDisPrice: price,
      bindType,
      orderType:0
    };
    if (sendFlag == 1 && value === '请选择 (仅显示可配送影厅)' && checked && goodsType != '1') {
      showToast('请完善配送信息');
      _this.isOK = true;
      return
    } else if (sendFlag == 1 && checked && goodsType != '1') {
      let {
        timeInfo,
        dayIndex,
        itemIndex
      } = this.data
      let val = timeInfo[dayIndex].child[itemIndex].id;
      params.sendTime = val
    }
    if (scene == 1011) {
      if (goodsType == 1) {
        allocation == 0 ? allocation = 600000 : allocation;
        params.remarks = remarks;
        params.pickupTime = allocation;
        params.orderType = 5;
        this.isSubmit = true
      }
    }
    let data = {
      orderNo,
      payType: 18
    };
    if (orderType == 1) {
      url = orderBinding;
      mold = 1;
      payUrl = payExchange;
    } else if (orderType == 2) {
      url = goodsOrderBinding;
      mold = 2;
      payUrl = payBack;
      data.payType = 7;
    }

    if (bindType != -1) {
      params.prefVoucherAccount = this.data.prefAccount;
    }

    if (bindType == 0) {
      params.cardType = this.data.chooseCardData.cardType;
    }

    if (bindType == 2){
      params.prefVoucherAccount = this.data.couponData.voucherCode;
      params.cardType = this.data.chooseCardData.cardType;
    }

    if ((bindType == 1 || bindType == 2) && price == 0) {
      let name = this.data.couponData.voucherName;
      let code = this.data.couponData.cardCode;
      code = code.split(',');
      let content = `是否使用${name}付款`;
      if (code.length > 1) {
        content = `确认使用${code.length}张券完成支付?`
      }
      wx.showModal({
        title: '',
        content,
        success(res) {
          _this.isOK = true;
          if (res.confirm) {
            ajaxPromise(true, url, params)
              .then((res) => {
                let {
                  skipFlag,
                  orderNo
                } = res.resultData;
                if (skipFlag == 1) {
                  ajaxPromise(true, payUrl, data)
                    .then((res) => {
                      wx.redirectTo({
                        url: `/pages/success/success?type=2&orderNo=${orderNo}&orderType=${orderType}`
                      })
                    })
                    .catch(() => {
                      _this.isOK = true;
                    })
                }
              })
              .catch(() => {
                _this.isOK = true;
              })
          }
        }
      })
    } else {
      ajaxPromise(true, url, params)
        .then((res) => {
          let {
            skipFlag,
            orderNo,
            cardType
          } = res.resultData;
          if (skipFlag == 0) {
            if (cardType == 1 || cardType == 10 || cardType == 11) {
              // 用卡支付
              this.setData({
                payMark: true,
                inputPsd: true
              })
            } else {
              // 微信支付
              payOrder(mold, orderNo, (res) => {
                  let wxPayPara = res.resultData;
                  wxPayment(wxPayPara, (res) => {
                    app.globalData.cardIndex = '';
                    wx.redirectTo({
                      url: `/pages/success/success?type=2&orderNo=${this.data.orderNo}&orderType=${orderType}`
                    })
                  }, (res) => {
                    let goodsType = this.data.goodsType;
                    _this.isOK = true;
                    if (goodsType == 1) {
                      wx.navigateBack({
                        delta: -1
                      })
                    } else {
                      let {
                        orderNo,
                        type
                      } = this.data;
                      wx.redirectTo({
                        url: `/pages/order/order-detail/order-detail?orderNo=${orderNo}&type=${type}`
                      })
                    }
                  })
                }, () => {
                  _this.isOK = true;
                }
              )
            }
          }
        })
        .catch(() => {
          _this.isOK = true;
        })
    }
  },


  /**
   * 付款成功
   */
  confirmPassword() {
    this.setData({
      inputPsd: false,
      payMark: false
    })
  },

  /**
   * hideMark
   */
  hideMark() {
    this.setData({
      inputPsd: false,
      showMark: false,
      showLayer: false,
      showSeat: false,
      showDate: false,
      refundLayer: false
    })
  },

  /**
   *
   */
  hidePayMark() {
    let {
      orderNo,
      type,
      goodsType
    } = this.data;
    this.setData({
      inputPsd: false,
      payMark: false
    })
    if (goodsType !== 1) {
      wx.redirectTo({
        url: `/pages/order/order-detail/order-detail?orderNo=${orderNo}&type=${type}`
      })
    }
  },

  /**
   * 选择配送位置
   */
  selectSeat() {
    this.setData({
      showMark: true,
      showSeat: true
    })
  },

  /**
   * 滚动开始
   */
  pickStart() {
    this.setData({
      isEnd: false
    })
  },

  /**
   * 确定选择
   */
  confirm() {
    let isEnd = this.data.isEnd;
    if (isEnd) {
      let {
        value,
        multiArray,
        orderNo
      } = this.data;
      if (value === '请选择 (仅显示可配送影厅)') {
        value = `${multiArray[0][0].name} ${multiArray[1][0].name} ${multiArray[2][0].name}`
      }
      ajaxPromise(false, addRemarks, {
        sendAddress: value,
        orderId: orderNo
      })
      this.setData({
        showMark: false,
        showSeat: false,
        value
      })
    } else {
      setTimeout(() => {
        this.confirm()
      }, 200)
    }
  },

  /**
   * 结束滚动选择
   */
  pickEnd() {
    this.setData({
      isEnd: true
    })
  },

  /**
   * 获取输入的备注
   */
  bindInput(e) {
    let remarks = e.detail.value;
    this.setData({
      remarks
    })
  },

  /**
   * 选择影厅
   */
  changePicker(e) {
    let val = e.detail.value;
    let hallInfo = this.data.hallInfo;
    let multiArray = [];

    let row = val[0];
    if (row > hallInfo[val[0]].child.length) {
      row = hallInfo[val[0]].child.length - 1
    }

    let col = val[1];
    if (!hallInfo[row].child[col]) {
      col = hallInfo[row].child.length - 1
    }

    multiArray.push(hallInfo);
    multiArray.push(hallInfo[row].child);
    multiArray.push(hallInfo[row].child[col].child);

    let seat = val[2]
    if (seat > multiArray[2].length - 1) {
      seat = multiArray[2].length - 1
    }

    let value = `${multiArray[0][row].name} ${multiArray[1][col].name} ${multiArray[2][seat].name}`

    this.setData({
      multiArray,
      value
    })
  },

  /**
   * 打开选择送达时间
   */
  selectDate() {
    this.setData({
      showDate: true,
      showMark: true,
      isDate: true
    })
  },

  /**
   * 选择配送日期
   */
  selectDay(e) {
    let index = e.currentTarget.dataset.index;
    let {
      items,
      timeInfo
    } = this.data;
    if (index == 1) {
      items = timeInfo[1].child
    } else {
      items = timeInfo[0].child
    }

    this.setData({
      dayIndex: index,
      items
    })
  },

  /**
   * 更新备注
   */
  bindBlur() {
    let remarks = this.data.remarks;
    ajaxPromise(false, addRemarks, {
      remarks,
      orderId: this.data.orderNo
    })
  },

  /**
   * 选择配送时间
   */
  selectItem(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      itemIndex: index
    })
  },

  /**
   * 确认配送时间
   */
  confirmDate() {
    let {
      itemIndex,
      dayIndex,
      timeInfo
    } = this.data;
    let val = timeInfo[dayIndex].child[itemIndex].name;
    let day = timeInfo[dayIndex].name;
    if (dayIndex == 1) {
      day = day.substring(0, 5)
    } else {
      day = ''
    }
    let time = `${day} ${val}`;
    this.setData({
      time,
      showDate: false,
      showMark: false
    })
  },

  /**
   * @param {*} 倒计时
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
        clearInterval(timer);
        wx.navigateBack()
      }
      this.setData({
        countTime: minute + ':' + second
      })
    }, 1000);
  },

  /**
   * 定义取货时间
   */
  getGoods() {
    let hour = [];
    let minute = [];
    let a = 5;
    for (let i = 0; i < 12; i++) {
      hour.push(i);
      a += 5;
      a >= 60 ? a = 59 : a;
      minute.push(a)
      minute = Array.from(new Set(minute))
    }
    this.setData({
      hour,
      minute
    })
  },

  /**
   * 显示选择取货时间
   */
  showGetGoodTime() {
    this.setData({
      goodsDate: true,
      showMark: true
    })
  },

  /**
   * 取货时间
   */
  pickGoods(e) {
    let value = e.detail.value;
    let allocation = 0;
    let {
      hour,
      minute
    } = this.data;
    let hour1 = hour[value[0]];
    let minute1 = minute[value[1]];
    allocation = (hour1 * 60 + minute1) * 60000;
    hour1 > 0 ? hour1 = `${hour1}小时` : hour1 = '';
    minute1 = `${minute1}分钟`;

    let getGoodsTime = hour1 + minute1;

    this.setData({
      getGoodsTime,
      allocation
    })
  },

  /**
   * 确定取货时间
   */
  confirmGetTime() {
    let isEnd = this.data.isEnd;
    if (isEnd) {
      this.setData({
        showMark: false,
        goodsDate: false
      })
    } else {
      setTimeout(() => {
        this.confirmGetTime()
      }, 200)
    }
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
    let goodsType = wx.getStorageSync('type');
    let orderNo = this.data.orderNo;
    let scene = wx.getStorageSync('scene');
    wx.removeStorageSync('hallCode');
    wx.removeStorageSync('movie');
    wx.removeStorageSync('row');
    wx.removeStorageSync('seat');
    if (goodsType == 1 && scene == 1011) {
      let isSubmit = this.isSubmit;
      if (!isSubmit) {
        ajaxPromise(true, cancelOrder, {
          orderNo
        })
      }
    }

    app.globalData.cardIndex = '';
    app.globalData.couponIndex = [];
    app.globalData.voucherName = [];
  }
})
