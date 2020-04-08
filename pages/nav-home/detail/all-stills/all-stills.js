// pages/nav-home/detail/all-stills.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stillsArr: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
    let stillsArr = JSON.parse(options.stillsArr);
    let filmName = options.filmName;
    wx.setNavigationBarTitle({
      title: filmName,
    })
    this.setData({
      stillsArr: stillsArr
    })
  },

  /**
   * 预览剧照
   */
  previewImg(e) {
    let src = e.currentTarget.dataset.src;
    wx.previewImage({
      current: src,
      urls: this.data.stillsArr
    });
  },
})
