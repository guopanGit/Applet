// pages/recharge/Card-Order/Card-Order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSucceed: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    let isSucceed = options.isSucceed;
    if (isSucceed == 'succeed') {
      isSucceed == true;
    } else if (isSucceed == 'defeated') {
      isSucceed == false;
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.setNavigationBarTitle({
      title: '订单详情',
    })
  },

/*
去卡列表
*/
	cardList(){
		wx.navigateTo({
			url:'../../cardVoucher/cardList'
		})
	}

})