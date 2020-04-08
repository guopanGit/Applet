/**
 * 导入封装函数
 */

import {
  ajaxPromise,
  showToast
} from '../../../utils/util.js';

import {
  URL,
} from '../../../utils/config.js';

// 赋值
const {
  getFriendFilmInfo,
  getFriendSellProduct,
  createFriendActivity,
  getActivityDesc,
  getFriendPowerWin,
  getPowerMemberJoinList,
} = URL || '';

const barrageList = [
  {
    userIcon: 'http://img1.imgtn.bdimg.com/it/u=1844931321,2482666670&fm=26&gp=0.jpg',
    userName: '用户04121...'
  },

]
const filmList = [
  {
    imgUrl: 'https://bkimg.cdn.bcebos.com/pic/d058ccbf6c81800a3319ce77be3533fa838b47ce?x-bce-process=image/watermark,g_7,image_d2F0ZXIvYmFpa2UxODA=,xp_5,yp_5',
    filmName: '半个喜剧'
  },
  {
    imgUrl: 'https://bkimg.cdn.bcebos.com/pic/d058ccbf6c81800a3319ce77be3533fa838b47ce?x-bce-process=image/watermark,g_7,image_d2F0ZXIvYmFpa2UxODA=,xp_5,yp_5',
    filmName: '囧妈'
  },
  {
    imgUrl: 'https://bkimg.cdn.bcebos.com/pic/d058ccbf6c81800a3319ce77be3533fa838b47ce?x-bce-process=image/watermark,g_7,image_d2F0ZXIvYmFpa2UxODA=,xp_5,yp_5',
    filmName: '少年的你'
  },
  {
    imgUrl: 'https://bkimg.cdn.bcebos.com/pic/d058ccbf6c81800a3319ce77be3533fa838b47ce?x-bce-process=image/watermark,g_7,image_d2F0ZXIvYmFpa2UxODA=,xp_5,yp_5',
    filmName: '小丑Joker'
  },
]
const goodsList = [
  {
    imgUrl: 'http://tupian.mplus.net.cn/goods_picture/2019/06/2019061691560663850885G.jpg',
    goodsName: '单人套餐',
    price: '11.00'
  },
  {
    imgUrl: 'http://tupian.mplus.net.cn/goods_picture/2019/06/2019061691560663850885G.jpg',
    goodsName: '超值双人餐',
    price: '11.00'
  },
  {
    imgUrl: 'http://tupian.mplus.net.cn/goods_picture/2019/06/2019061691560663850885G.jpg',
    goodsName: '特惠双人套餐',
    price: '11.00'
  },
  {
    imgUrl: 'http://tupian.mplus.net.cn/goods_picture/2019/06/2019061691560663850885G.jpg',
    goodsName: '美味餐',
    price: '11.00'
  },
]
const stepList = ['发起助力', '邀请好友帮忙', '凑齐人数', '免费拿走']

const isDev = true

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tit: '',
    bannerImg: '',
    countDownTime: '01:03:25:19',
    stepList,
    filmList,
    goodsList,
    barrageList,
    positionStyle: 'fixed',
    showRuleModal: false,
    activityDesc: null,
    currentTime: null,
    powerWinList: [],
    sellProductList:[],
    filmInfoList:[],
  },
  windowHeight: 0,
  hasPassBottom: false,

  // 生命周期函数--监听页面加载
  onLoad(options) {
    console.log(options, 'options')
    this.windowHeight = wx.getSystemInfoSync().windowHeight
  },

  // 生命周期函数--监听页面初次渲染完成
  onReady() {
    wx.setNavigationBarTitle({
      title: "助力详情",
    });
    this.fetchData()
  },

  // 生命周期函数--监听页面显示
  onShow() {

  },

  // 监听页面滚动
  onPageScroll(e) {
    this.getFixedTop()
    const { hasPassBottom } = this
    const isFxied = this.data.positionStyle === 'fixed'

    if (isFxied && (!hasPassBottom)) {
      this.changeFixedPosition('absolute')
    } else if (!isFxied && (hasPassBottom)) {
      this.changeFixedPosition('fixed')
    }
  },

  //请求初始化数据
  fetchData() {
    this.getActivityDescFn()
    this.getFriendPowerWinFn()
    this.getFriendSellProductFn()
  },

  //获取活动详情接口信息
  getActivityDescFn() {
    const
      isLoading = false,
      url = getActivityDesc,
      data = {
        activityId: 1
      },
      method = false,
      modal = true,
      isMock = isDev;

    ajaxPromise(isLoading, url, data, method, modal, isMock)
      .then(res => {
        const { resultCode, resultData: { friendActivity, currentTime } } = res
        console.log(res, '获取活动详情接口信息')
        if (Number(resultCode) === 0) {
          this.setData({
            activityDesc: friendActivity,
            currentTime
          }, () => {
            console.log(this.data.activityDesc)
          })
        }
      })
      .catch(e => {
        console.log(e, 'e')
      })
  },

  //获取热销卖品接口
  getFriendSellProductFn() {
    const
      isLoading = false,
      url = getFriendSellProduct,
      data = {
        cinemaCode: 1,
        memberCode: 1,
      },
      method = false,
      modal = true,
      isMock = isDev;


    ajaxPromise(isLoading, url, data, method, modal, isMock)
      .then(res => {
        const { resultCode, resultData: { sellProductList } } = res
        console.log(res, 'getFriendSellProductFn')
        if (Number(resultCode) === 0) {
          this.setData({
            sellProductList
          })
        }
      })
  },

  //助力活动中奖记录接口
  getFriendPowerWinFn() {
    const
      isLoading = false,
      url = getFriendPowerWin,
      data = {
        cinemaCode: 1,
        memberCode: 1,
      },
      method = false,
      modal = true,
      isMock = isDev;

    ajaxPromise(isLoading, url, data, method, modal, isMock)
      .then(res => {
        const { resultCode, resultData: { powerWinList } } = res
        console.log(res, 'getFriendPowerWin')
        if (Number(resultCode) === 0) {
          this.setData({
            powerWinList
          })
        }
      })
  },

  //获取倒计时模块的固定位置
  getFixedTop() {
    const query = wx.createSelectorQuery()
    query.select('.positon-box').boundingClientRect()
    query.exec((res) => {
      this.hasPassBottom = res[0].bottom > this.windowHeight
    })
  },

  //改变定位方式
  changeFixedPosition(position) {
    this.setData({
      positionStyle: position
    })
  },

  // 去我的活动页
  goHelpList() {
    wx.navigateTo({
      url: '/pages/friend-help/help-list/help-list'
    })
  },

  // 免费拿好礼
  getGift() {
    wx.navigateTo({
      url: '/pages/friend-help/help-active/help-active'
    })
  },

  // 打开模态层
  openModal() {
    this.setData({
      showRuleModal: true
    })
  },

  //关闭模态层
  closeModal() {
    console.log('closeModal')
    this.setData({
      showRuleModal: false
    })
  },

  // 穿透
  stopIncident() {
    return
  },

  // 分享
  onShareAppMessage(res) {
    return {
      title: '选家影院看电影吧',
      path: 'pages/cinema/cinema'
    }
  }

})
