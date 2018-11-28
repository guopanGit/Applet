// pages/orderInfoList/goodsOrders.js
var url = require('../../utils/url.js'),
  goodsOrdeUrl = url.getSellOrderDetail, //获取卖品订单信息的接口
  cinemaCode,
  member,
  memberCode,
  orderNo, //从订单列表页带过来的订单号
  orderType; //从订单列表页带过来的订单类型
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods:{
      servicePrice:'',
      goodsPrice:''
    },
    orderNo:'',
		remarks: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 关闭转发按钮
		wx.hideShareMenu();
		let cinemaCode = wx.getStorageSync('cinemaCode');
		let memberCode = wx.getStorageSync('memberCode');
		let orderNo = options.orderNo;
		this.setData({
			orderNo,
			memberCode,
			cinemaCode
		})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '订单详情',
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getGoodsDetailFn();
  },
  getGoodsDetailFn () {
    var that = this,
      pageData = that.data,
      qrcode = pageData.qrcode,
      barcode = pageData.barcode,
			getGoodsDetailPara = { 'cinemaCode': that.data.cinemaCode, 'memberCode': that.data.memberCode, 'orderId': that.data.orderNo };
			console.log(getGoodsDetailPara)
    wx.request({
      url: goodsOrdeUrl, //获取卖品订单信息的接口,
      method: 'GET',
      data: getGoodsDetailPara,
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      success: function (res) {
        // console.log(res);
        var goods = res.data.resultData,
          sellRecords = goods.sellRecords;
				let remarks = goods.remarks;
				if (remarks == null) {
					that.setData({
						remarks: ''
					});
				} else {
					if (remarks.length > 20){
						remarks = `${remarks.substring(0, 20)}...`
					}
					that.setData({
						remarks
					});				
				}
        for (let i = 0; i < sellRecords.length; i++){
          let strategyPrice = sellRecords[i].strategyPrice;
          strategyPrice = strategyPrice / 100;
          if (strategyPrice) {
            strategyPrice = strategyPrice / 100;
          } else {
            strategyPrice = 0;
          }
       };
        that.setData({
          goods
        });
      }
    })

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
   
  }
})