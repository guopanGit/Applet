import {
  ajaxPromise,
} from "../../../utils/util";

import {
  URL
} from '../../../utils/config';

const {
  merchant,
  getCoupons,
  parking
} = URL || '';


Page({

  /**
   * 页面的初始数据
   */
  data: {
    coupon: {},
    mask: false,
    showDetail: false,
    showDefault: true,
    couponData: {
      voucherType: '-1',
      pageNo: 1
    },
    list: [],
    hasNext: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: '我的优惠券'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      list: []
    })
    let couponData = this.data.couponData;
    couponData.pageNo = 1;
    ajaxPromise(true, getCoupons, couponData)
      .then((res) => {
        this.couponCall(res)
      })
      .catch(() => {
      })
  },

  ohHide() {
    this.setData({
      list: []
    })
  },

  /**
   *  获取券列表成功回调
   */
  couponCall(res) {
    //  console.log(res);
    if (res.resultCode === '0') {
      let list = this.data.list;
      let vouchers = res.resultData.vouchers;
      let hasNext = res.resultData.hasNext;
      vouchers.forEach(i => {
        let a = '';
        switch (i.voucherType) {
          case 0:
            i.type = `${i.voucherPar}元影票代金劵`;
            i.title = `￥${i.voucherPar}`;
            break;
          case 2:
            // i.voucherPar > 0 ? i.voucherPar = `${i.voucherPar}元` : i.voucherPar = '免费'
            i.type = `影票兑换券`;
            i.title = '兑';
            break;
          case 4:
            i.type = '免费影票兑换券';
            i.title = `免费`;
            break;
          case 5:
            i.spec == 0 ? a = '折' : a = '￥'
            i.voucherPar == 0 ? a = '免费' : a == '￥' ? a = `${a}${i.voucherPar}` : a = `${i.voucherPar}${a}`
            i.type = `${a}卖品券`;
            i.title = `${a}`;
            break;
          case 7:
            i.type = '商家券';
            break;
          case 8:
            if (i.spec == 0) {
              i.type = `${i.voucherPar}元停车券`;
              i.title = `￥${i.voucherPar}`;
              i.voucherPar = `￥${i.voucherPar}`
            } else if (i.spec == 1) {
              i.title = `${i.voucherPar}h(免费停车)`;
              i.type = `${i.voucherPar}h(免费停车券)`;
              i.voucherPar = `${i.voucherPar}小时`
            }
            break;
        }
        i.cityList.forEach(element => {
          element.cinemaName = element.cinemaNameList.join(',')
        });
        list.push(i)
      });
      //  console.log(list.length);
      if (list.length > 0) {
        this.selectComponent("#default").hide();
      } else {
        this.selectComponent("#default").show();
      }

      this.setData({
        list,
        hasNext
      })
    }
  },

  /**
   * 点击券面
   * */
  coupon(e) {
    let val = e.detail;
    if (val.voucherType == 7) {
      ajaxPromise(false, merchant, {
        voucherCode: val.voucherCode,
      })
        .then((res) => {
          val.storeName = res.resultData.storeName;
          val.storeAddress = res.resultData.storeAddress;
          this.setData({
            coupon: val,
            mask: true,
            showDetail: true
          })
        })
        .catch(() => {
        })
    } else {

      val.goodsId = true;
      val.goodsName = val.voucherName;
      val.goodsTypeName = val.title;
      val.useInfo = [];
      val.useInfo.push(`本券为(${val.type})`);
      val.useInfo.push(`有效期至${val.endTime}`);
      val.ruleContent = val.voucherLimitContent;
      val.codeCinemaMsg = val.cityList;
      this.setData({
        coupon: val,
        showDetail: true
      })
    }
  },


  /**
   * 点击去使用
   * */
  service(e) {
    let val = e.detail;
    ajaxPromise(true, parking, {
      voucherNo: val.voucherCode
    }).then((res) => {
      // console.log(res);
      let mid = res.resultData.mid;
      // let mid = '10658';
      wx.navigateToMiniProgram({
        appId: 'wx235c53b61e1c0397',
        path: '/pages/index/index?q=https%3a%2f%2fm.mallcoo.cn%2fa%2fcoupon%2f' + mid,
        extraData: {
          foo: 'bar'
        },
        envVersion: 'release'
      })
    })
      .catch((res) => {
        // console.log(res);
      })
  },

  /**
   * 绑定券
   */
  bindCoupon() {
    wx.navigateTo({
      url: `/pages/nav-my/binding/binding?id=1`
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    let couponData = this.data.couponData;
    couponData.pageNo = 1;
    ajaxPromise(true, getCoupons, couponData)
      .then((res) => {
        this.couponCall(res)
      })
      .catch(() => {
      })
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    let hasNext = this.data.hasNext;
    if (!hasNext) {
      return
    }
    let couponData = this.data.couponData;
    let pageNo = Number(couponData.pageNo) + 1
    couponData.pageNo = pageNo;
    this.setData({
      'couponData.pageNo': pageNo
    })
    ajaxPromise(true, getCoupons, couponData)
      .then((res) => {
        this.couponCall(res)
      })
      .catch(() => {
      })
  }
})
