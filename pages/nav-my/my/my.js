// pages/nav-my/my/my.js

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    headImg: '/image/login-img.png',
    memberName: '请登录'
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
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#f87445'
    })
    wx.setNavigationBarTitle({
      title: '我的'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let member = wx.getStorageSync('member');
    if (member.memberCode) {
      this.setData({
        headImg: member.avatar,
        memberName: member.nickName
      })
    } else {
      this.setData({
        headImg: '/image/login-img.png',
        memberName: '请登录'
      })
    }
  },

  /**
   * 跳转页面
   * */
  destination(e) {
    let memberCode = wx.getStorageSync('member').memberCode;
    let url;
    let id = e.currentTarget.dataset.id; // 1个人信息 2 订单 3 会员卡 4 优惠券 5 账号安全 6 用户协议 7 联系影院
    if (memberCode || id == 6 || id == 7) {
      switch (id) {
        case '1':
          url = '/pages/nav-my/my-info/my-info';
          break;
        case '2':
          url = '/pages/nav-my/my-order/my-order';
          break;
        case '3':
          url = '/pages/nav-my/my-card/vip-card/vip-card';
          break;
        case '4':
          url = '/pages/nav-my/my-coupon/my-coupon';
          break;
        case '5':
          url = '/pages/nav-my/my-account/account/account';
          break;
        case '6':
          url = '/pages/nav-my/about/about';
          break;
        case '7':
          url = '/pages/nav-my/contact-cinema/contact-cinema';
          break;
      }
    } else {
      url = '/pages/sign-in/authorize/authorize'
    }
    wx.navigateTo({
      url
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },
  /**
   * 监听进入我的
   **/
  onTabItemTap(item) {
    if (item.index === 2) {
      wx.setStorageSync('type', '');
      app.globalData.page = '';
    }
  },
})
