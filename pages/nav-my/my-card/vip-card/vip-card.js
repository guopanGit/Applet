// pages/nav-my/my-card/my-card.js

import {
  showToast,
  ajaxPromise
} from '../../../../utils/util.js';

import {
  URL
} from '../../../../utils/config';

const {
  cardsList,
  checkPassword
} = URL || '';


Page({

  /**
   * 页面的初始数据
   */
  data: {
    source: 3,
    sourceType: 0,
    cardNo: "",
    inputPsd: false,
    cardDetail: false,
    // 输入框参数设置
    inputData: {
      input_value: "", //输入框的初始内容
      value_length: 0, //输入框密码位数
      isNext: false, //是否有下一步的按钮
      get_focus: true, //输入框的聚焦状态
      focus_class: true, //输入框聚焦样式
      value_num: [1, 2, 3, 4, 5, 6], //输入框格子数
      height: "70rpx", //输入框高度
      interval: false, //是否显示间隔格子
    },
    hasNext: true,
    list: [],
    pageNo: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: '我的会员卡'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    ajaxPromise(true, cardsList, {
      pageNo: 1
    })
      .then((res) => {
        this.cardsListCall(res)
        let orders = res.resultData.orders;
        if (orders.length) {
          ajaxPromise(false, checkPassword, {})
            .then((res) => {
              let balancePwd = res.resultData.balancePwd;
              let cardDetail = this.data.cardDetail;
              if (balancePwd == 1 && !cardDetail) {
                this.setData({
                  inputPsd: true
                })
              } else if (balancePwd == 0) {
                this.setData({
                  inputPsd: false
                })
              }
            })
            .catch(() => {
            })
        }
      })
      .catch(() => {
      })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.setData({
      list: []
    })
  },

  /**
   * 获取会员卡成功回调
   */
  cardsListCall(res) {
    if (!res.resultData) {
      this.selectComponent("#default").show();
      return
    }
    let {
      hasNext,
      orders
    } = res.resultData || '';
    let {
      list
    } = this.data;

    if (orders.length == 0) {
      this.selectComponent("#default").show();
    } else {
      this.selectComponent("#default").hide();
      orders.forEach(i => {
        list.push(i)
      });

      //  console.log(list);
      this.setData({
        hasNext,
        list: orders
      })
    }
  },


  /**
   * 确认密码
   */
  confirmPassword() {
    showToast("会员卡密码设置成功")
    this.setData({
      inputPsd: false,
    })
  },

  updatePassword() {
    this.onShow()
  },

  /**
   * 显示卡详情
   */
  showDetail(e) {
    let renderDetail = e.detail;
    let useInfo = [];
    if (renderDetail.cardType == 2) {
      useInfo.push('本卡为权益卡，不支持储值')
      useInfo.push('本卡在原价基础上优惠')
      useInfo.push(`有效期至${renderDetail.limitTime}`)
    } else {
      useInfo.push('本卡为储值卡，可以储值')
      useInfo.push('本卡在原价基础上优惠')
      useInfo.push('在适用影院使用此卡消费时可享受相应优惠，在其余影院使用仅做支付用')
      useInfo.push(`有效期至${renderDetail.limitTime}`)
    }
    renderDetail.goodsId = true;
    renderDetail.goodsName = renderDetail.cardName;
    renderDetail.cardAmount = renderDetail.balance;
    renderDetail.useInfo = useInfo;
    renderDetail.ruleContent = renderDetail.cardDesc;
    renderDetail.codeCinemaMsg = renderDetail.cardCodeCinemaMsg;
    this.setData({
      cardDetail: true,
      renderDetail
    })
  },

  /**
   * 关闭卡详情
   */
  closeLayer() {
    this.setData({
      cardDetail: false
    })
  },

  /**
   * 关闭输入框
   */
  closeInput() {
    this.setData({
      inputPsd: false
    })
  },


  /**
   * 去绑卡
   */
  bindCard() {
    wx.navigateTo({
      url: `/pages/nav-my/binding/binding?id=2`
    })
  },

  refresh() {
    this.onShow()
  }
})
