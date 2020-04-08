// pages/nav-my/my-order/my-order.js

import {
  URL
} from '../../../utils/config';

import {
  ajaxPromise,
  formatTime,
  formatNumber
} from '../../../utils/util';

let {
  ordersList,
  cardOderList
} = URL || '';

let timer;
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: '1',
    orderData: {
      pageNo: 1
    },
    list: [],
    listIndex: '',
    type: '3'
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
      title: '我的订单'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      list: []
    })
    this.getorderList(1)
  },

  /**
   * 获取影票与卖品订单成功回调
   */

  orderCall(res) {
    let orders = res.resultData.orders;
    let hasNext = res.resultData.hasNext;
    let page = this.data.page;
    let list = this.data.list;
    let listIndex = 'i';
    if (page == 1) {
      orders.forEach((i, index) => {
        if (i.orderTimeOut > 0 && i.orderState == '1000' && (i.orderType == '1' || i.orderType == '3' || !i.orderType)) {
          listIndex = index;
        }
        list.push(i)
      });
    } else {
      // 假数据
      /* if (this.data.page == 2) {
         list.push({
           payTime: '2020-2-27 15:59:07',
           orderS: '已退款',
           cardName: '卖品立减5元券',
           payAmount: 7650,
           cardType: '14',
           orderType: 12
         })
         list.push({
           payTime: '2020-2-27 15:59:07',
           orderS: '已付款',
           cardName: '影票立减5元券',
           payAmount: 7250,
           cardType: '15',
           orderType: 12
         })
         list.push({
           payTime: '2020-2-27 15:59:07',
           orderS: '已退款',
           cardName: '特惠礼包',
           payAmount: 7450,
           cardType: '16',
           orderState: 1000,
           orderType: 13
         })
       }*/
      orders.forEach((element, index) => {
        if (element.orderTimeOut > 0 && element.orderS == '待付款') {
          listIndex = index;
        }
        list.push(element)
      })
    }
    if (list.length > 0) {
      this.selectComponent("#default").hide();
    } else {
      this.selectComponent("#default").show();
    }
    this.setData({
      list,
      listIndex,
      hasNext
    })
    if (listIndex != 'i') {
      this.countDown(orders[listIndex].orderTimeOut, listIndex)
    }
  },
  /**
   * 自定义事件 点击去购票
   */
  clickBtn() {
    let type = this.data.type
    if (type == '3') {
      wx.switchTab({
        url: '/pages/nav-home/index/index'
      })
    } else if (type == '10') {
      app.globalData.page = 1;
      wx.switchTab({
        url: '/pages/nav-goods/goods'
      })
    }
  },

  /**
   * 切换tap
   * */
  switcher(e) {
    let tap = e.currentTarget.dataset.page;
    let page = this.data.page;
    let type;
    if (tap == page) {
      return
    } else if (tap == 1) {
      type = '3'
    } else if (tap == 2) {
      type = '10'
    }
    this.setData({
      page: tap,
      list: [],
      type
    })
    clearInterval(timer);
    this.getorderList(1)
  },

  /**
   * 请求列表
   * pageNo 页码
   */

  getorderList(pageNo) {
    let url;
    let {
      page,
      orderData
    } = this.data;
    orderData.pageNo = pageNo;
    if (page == '1') {
      url = ordersList;
    } else {
      url = cardOderList;
    }
    ajaxPromise(true, url, orderData, 'POST')
      .then((res) => {
        this.orderCall(res)
      })
      .catch(() => {
      })
  },

  /**
   * 去订单详情
   */
  orderDetail(e) {
    let orderNo = e.currentTarget.dataset.id;
    let orderType = e.currentTarget.dataset.type;
    let confirmFlag = e.currentTarget.dataset.tag;
    let orderS = e.currentTarget.dataset.orders;
    if (confirmFlag == '0') {
      orderS = orderS == '已观影' ? orderS = 1 : orderS = 0;
      if (orderType == '2' || orderType == '4' || orderType == '5') {
        wx.navigateTo({
          url: `/pages/order/submit-order/submit-order?orderNo=${orderNo}&type=2`
        })
      } else {
        wx.navigateTo({
          url: `/pages/order/submit-order/submit-order?orderNo=${orderNo}`
        })
      }
    } else if(confirmFlag == '1'){
      let type = '';
      switch (orderType) {
        case 1:
          type = '1';
          break;
        case 2:
          type = '2';
          break;
        case 3:
          type = '1';
          break;
        case 4:
          type = '2';
          break;
        case 5:
          type = '2';
          break;
      }
      wx.navigateTo({
        url: `/pages/order/order-detail/order-detail?orderNo=${orderNo}&type=${type}&orderS=${orderS}&orderType=${orderType}`
      })
    }else if (confirmFlag == '3'){ // 商品订单
      wx.navigateTo({
        url: `/pages/order/order-detail/order-detail?orderNo=${orderNo}&type=3`
      })
    }
  },

  /**
   * 倒计时
   */
  countDown(countTime, index) {
    let list = this.data.list;
    let formatCount = formatTime(new Date(countTime), 2);
    let minute = formatCount.split(":")[0];
    let second = formatCount.split(":")[1];
    let key = `list[${index}].countTime`;
    this.setData({
      [key]: minute + ':' + second
    })
    timer = setInterval(() => {
      if (second >= 0) {
        second--;
        second = formatNumber(second);
      }
      if (second < 0 && minute > 0) {
        minute--;
        minute = formatNumber(minute);
        second = 59;
      }
      if (second == 0 && minute == 0) {
        clearInterval(timer);
        wx.showModal({
          title: '',
          content: '支付超时，请重新选择',
          success: res => {
            if (res.confirm) {
              list.splice(index, 1);
              this.setData({
                list
              })
              if (list.length > 0) {
                this.selectComponent("#default").hide();
              } else {
                this.selectComponent("#default").show();
              }
            }
          }
        })
      }
      this.setData({
        [key]: minute + ':' + second
      })
    }, 1000);
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getorderList(1)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let hasNext = this.data.hasNext;
    if (!hasNext) {
      return
    }
    let pageNo = this.data.orderData.pageNo
    pageNo = pageNo + 1;
    this.setData({
      'orderData.pageNo': pageNo
    })
    this.getorderList(pageNo)
  }
})
