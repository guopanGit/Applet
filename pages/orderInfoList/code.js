// pages/orderInfoList/code.js
var url = require('../../utils/url.js'),
	codeUrl = url.HOST;
Page({

    /**
     * 页面的初始数据
     */
	data: {
		qrcode: codeUrl + '/qrcode/qrcode/getQRCode', //二维码
		barcode: codeUrl + '/barCode/barCode/getBarCode' //条形码
	},

    /**
     * 生命周期函数--监听页面加载
     */
	onLoad: function (options) {
		//关闭转发按钮
		wx.hideShareMenu();
		var that = this,
			opt = options,
			flag = opt.flag,
			url = opt.url,
			codeUrl;

		if (flag == 1){
			codeUrl = that.data.qrcode + "?content=" + url;
		} else if(flag == 0) {
			codeUrl = that.data.barcode + "?content=" + url;
		}
		
		that.setData({
			codeurl: codeUrl,
			codeFlag: flag
		});
		console.log(that.data.codeurl);
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

	},

    /**
     * 生命周期函数--监听页面隐藏
     */
	onHide: function () {

	},

    /**
     * 生命周期函数--监听页面卸载
     */
	onUnload: function () {

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
});