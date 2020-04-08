/**
 * 导入封装函数
 */

import {
  URL
} from '../../../utils/config.js';

import {
  ajaxPromise,
  layerAnimate,
  showToast,
  formatTime,
  formatNumber
} from '../../../utils/util.js';

const chooseGoods = URL.chooseGoods;
const submitGoods = URL.submitGoods;
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartTotal: 0,
    totalPrice: 0,
    cartList: [],
    goodsList: [],
    countTime: "",
    preferential: {},
    showCart: false,
    prefLayer: false,
    showLayer: false,
    isCartList: false,
    iPhoneX: app.globalData.iPhoneX
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
    this.setData({
      orderNo: options.orderNo
    })
    this._countDown(Number(options.orderTime));
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: '选择卖品',
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    ajaxPromise(true, chooseGoods, {
      orderNo: this.data.orderNo
    })
      .then((res) => {
        this.chooseGoodsCall(res)
      })
      .catch(() => {
      })
  },

  /**
   *
   * @param {res} 选择卖品成功回调
   */
  chooseGoodsCall(res) {
    let goodsList = res.resultData;
    let cartList = this.data.cartList || [];
    goodsList.forEach(element => {
      element.amount = 0;
      if (cartList.length) {
        cartList.forEach(ele => {
          if (ele.goodsCode == element.goodsCode) {
            element.amount = ele.amount;
            element.cardPrice = Number(element.cardPrice);
            element.goodsPrice = Number(element.goodsPrice);
          }
        })
      }
    })
    this.setData({
      goodsList,
    })
  },

  /**
   * 加卖品
   */
  bindAdd(e) {
    let symbol = "+";
    this._calcTotal(e, symbol);
    // this._calcTotalPrice();
    if (e.target.dataset.sign == 'favour') {
      this.hideLayer();
    }
  },

  /**
   * 减卖品
   */
  bindSub(e) {
    let symbol = "-";
    this._calcTotal(e, symbol);
    // this._calcTotalPrice();
  },

  /**
   * 显示购物车
   */
  showCartList() {
    if (this.data.cartList.length) {
      layerAnimate(this);
      this.setData({
        showLayer: !this.data.showLayer,
        isCartList: !this.data.isCartList
      })
    }
  },

  /**
   * 清空购物车
   */
  clearCart() {
    this.onShow();
    this.setData({
      cartList: [],
      cartTotal: 0,
      totalPrice: 0
    })
    this.hideLayer();
  },

  /**
   *
   * @param {*} 查看特惠商品
   */
  checkPref(e) {
    let preferential = e.target.dataset.key;
    preferential.index = e.target.dataset.index;
    this.setData({
      preferential,
      prefLayer: true,
      showLayer: true
    })
  },

  /**
   * 关闭弹出层
   */
  hideLayer() {
    this.setData({
      showLayer: false,
      prefLayer: false,
      isCartList: false,
    })
  },

  /**
   * 下一步
   */
  nextStep(e) {
    let orderNo = this.data.orderNo;
    if (e.currentTarget.dataset.type == "step") { // 提交卖品
      // 提交卖品参数
      let cartList = this.data.cartList;
      let submitArr = [];
      cartList.forEach(element => {
        let submitParams = {
          amount: String(element.amount),
          goodsCode: element.goodsCode
        }
        submitArr.push(submitParams)
      });
      ajaxPromise(true, submitGoods, {
        orderNo: this.data.orderNo,
        goodsInfo: JSON.stringify(submitArr)
      },)
        .then((res) => {
          wx.redirectTo({
            url: `../submit-order/submit-order?orderNo=${orderNo}`
          })
        })
        .catch(() => {
        })
    } else { // 无卖品
      wx.redirectTo({
        url: `../submit-order/submit-order?orderNo=${orderNo}`
      })
    }
  },

  /**
   *
   * @param {*} 获取当前索引
   * @param {*} 标识
   */
  _calcTotal(e, symbol) {
    let cartList = this.data.cartList;
    let index = e.target.dataset.index;
    let cartTotal = this.data.cartTotal;
    let totalPrice = 0;

    // 获取当前卖品数量
    let currentGoods = this.data.goodsList[index];
    currentGoods.index = index;
    let amount = currentGoods.amount;

    let limit = currentGoods.limit;
    let isActivity = currentGoods.isActivity;
    let activityLimit = currentGoods.activityLimit;
    let memberLimit = currentGoods.memberLimit;


    if (symbol === "+") {
      amount++; // 卖品自加
      cartTotal++; // 购物车总数自加
      if (cartTotal >= 99) {
        showToast('添加总数不能超过99件');
      }
      // 限购提示
      if(isActivity == 1){

        if(memberLimit <= activityLimit){
         if(amount == limit + 1){
           showToast('您的限享份数已用完，将以正常价格结算')
         }
        } else {
          if(amount == limit + 1){
            showToast("已超出特惠份额, 将以非活动价计算")
          }
        }

        // if(amount >= limit){
        //   if(amount == activityLimit + 1){
        //     showToast("已超出特惠份额, 将以非活动价计算")
        //   } else {
        //     showToast(`您的限享份数已用完，将以正常价格结算`)
        //   }
        // }
      }

      this.data.goodsList[index].amount = amount; // 赋值
      // 添加购物车
      if (cartList.length == 0) {
        cartList.push(currentGoods);
      } else {
        let sameCode;
        cartList.forEach(element => {
          if (element.goodsCode == currentGoods.goodsCode) {
            sameCode = true
            element.amount = amount
          }
        })
        if (!sameCode) {
          cartList.push(currentGoods);
        }
      }
    } else if (symbol === "-") {
      amount--; // 卖品自减
      cartTotal--; // 购物车总数自减
      if (amount <= 0) amount = 0;
      if (cartTotal <= 0) amount = 0;
      this.data.goodsList[index].amount = amount; // 赋值
      // 删除购物车
      cartList.forEach((element, index) => {
        if (element.goodsCode == currentGoods.goodsCode) {
          element.amount = amount
        }
        if (element.amount == 0) {
          cartList.splice(index, 1)
        }
      });
      if (cartList.length == 0) {
        this.hideLayer();
      }
    }
    cartList.forEach(element => {
      // 计算 单个卖品总价
      let limit = element.limit || 0;
      let num = element.amount - limit;
      let activityPrice = 0;
      let pristine;

      if (num > 0) {
        num = limit;
        pristine = (element.amount - num) * element.goodsPrice;
        activityPrice = num * element.activityPrice || 0;
      } else {
        num = element.amount;
        pristine = 0;
        activityPrice = num * element.activityPrice;
      }
      element.total = activityPrice + pristine;
      // 计算所有卖品总价
      totalPrice += element.total
    })

    // 更新数据
    this.setData({
      cartList,
      cartTotal,
      totalPrice,
      goodsList: this.data.goodsList
    })
  },

  /**
   * 计算卖品总价
   */
  _calcTotalPrice() {

    let totalPrice = this.data.totalPrice;
    let goodsList = this.data.goodsList
    let cartTotalPrice = 0;
    // 计算总价
    for (let i = 0; i < goodsList.length; i++) {
      if (goodsList[i].amount > 0) {
        if (goodsList[i].isActivity == 1) {
          if (goodsList[i].amount > goodsList[i].limit) {
            totalPrice = goodsList[i].amount * goodsList[i].goodsPrice;
            if (goodsList[i].amount == goodsList[i].activityLimit) {
              showToast("已超出特惠份额，将以非活动价格结算")
            } else {
              showToast("您的限享份数已用完，将以正常价格结算")
            }
          } else {
            totalPrice = goodsList[i].amount * goodsList[i].activityPrice;
          }
        } else {
          totalPrice = goodsList[i].amount * goodsList[i].goodsPrice;
        }
        cartTotalPrice += totalPrice
      }
    }
    // 赋值
    this.setData({
      goodsList,
      totalPrice: cartTotalPrice / 100,
    });
  },

  /**
   *
   * @param {*} 倒计时
   */
  _countDown(countTime) {
    let formatCount = formatTime(new Date(countTime), 2);
    let minute = formatCount.split(":")[0];
    let second = formatCount.split(":")[1];
    this.setData({
      countTime: minute + ':' + second
    })
    let timer = setInterval(() => {
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
      }
      this.setData({
        countTime: minute + ':' + second
      })
    }, 1000);
  }

})
