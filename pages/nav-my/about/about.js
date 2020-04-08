// pages/nav-my/about/about.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

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
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '关于'
    });
  },

  /**
   * 页面跳转
   */
  destination(e){
    let id = e.currentTarget.dataset.id;
    let url = '';
    if(id == 0){
      url = '/pages/agreement/agreement?type=0'
    } else {
      url = '/pages/agreement/agreement?type=2'
    }

    wx.navigateTo({
      url
    })
  }
})
