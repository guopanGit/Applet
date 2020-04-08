// 我的活动
Page({
  // 页面的初始数据
  data: {
    list: []
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {

  },

  // 生命周期函数--监听页面初次渲染完成
  onReady() {
    wx.hideShareMenu();
    wx.setNavigationBarTitle({
      title: "我的活动",
    });
  },

  // 生命周期函数--监听页面显示
  onShow() {
    let list = [
      {
        state: 1,
        showTime: true,
        name: '免费兑换券',
        date: '2020-3-27 11:16',
      },
      {
        state: 2,
        showTime: false,
        name: '固定金额通兑券',
        date: '2020-3-26 11:16',
      },
      {
        state: 3,
        showTime: false,
        name: '影片代金券',
        date: '2020-3-25 11:16',
      }
    ];
    this.setData({
      list
    })
  },

  // 清空列表
  anewStart() {
    this.setData({
      list: []
    })
  },

  // 发起活动
  startActivity(){
    this.onShow()
  }

})
