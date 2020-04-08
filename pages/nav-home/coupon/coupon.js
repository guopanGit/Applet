const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponData: {},
    source: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    wx.hideShareMenu();
    let couponData = app.globalData.counponData;
     // console.log(couponData);
    this.setData({
      couponData: couponData
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: '抢红包',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },
})
