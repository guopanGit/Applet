// pages/payResult/checking.js
var url = require('../../utils/url.js'),
	orderInfoUrl = url.orderInfo,
	member,
	cinemaCode,
	orderNo;

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
        var that = this,
            opt = options,
            sellCode = opt.sellCode,
            goodsFlag = false;

        if (sellCode == 'goods'){
            goodsFlag = true;
        }

        that.setData({
            goodsFlag: goodsFlag
        });

		member = wx.getStorageSync('member');
		cinemaCode = wx.getStorageSync('cinemaCode');
		orderNo = opt.orderNo;

        wx.hideShareMenu();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        wx.setNavigationBarTitle({
			title: '出票失败',
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

    //出票失败-查看订单详情
    viewOrderDetails: function (){
        var url = '../my/my';
        
        wx.reLaunch({
            url: url,
        });
    },
    
});