// pages/orderInfoList/failureTickte.js
var url = require('../../utils/url.js'),
	URL = url.orderInfo,
  goodsUrl = url.getSellOrderDetail, //获取卖品订单信息的接口
	orderInfoPara = {},
	cinemaCode,
	member,
  bindType = -1,
	memberCode,
  getGoodsDetailPara,
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
        //关闭转发按钮
        wx.hideShareMenu();

        var that = this,
            opt = options;

        orderNo = opt.orderNo;
        member = wx.getStorageSync('member');
        memberCode = member.memberCode;
        cinemaCode = wx.getStorageSync('cinemaCode');
        movieCode = wx.getStorageSync('cinemaCode');
        token = member.token;
        CVersion = wx.getStorageSync('CVersion');
        OS = wx.getStorageSync('OS');
        orderInfoPara = {
            'cinemaCode': cinemaCode,
            'memberCode': memberCode,
            'orderNo': orderNo
        };

        that.ajaxFn();
    },
    //卖品出票失败
    getGoodsDetailFn: function () {
      var that = this,
      getGoodsDetailPara = { 'cinemaCode': cinemaCode, 'memberCode': memberCode, 'orderId': orderNo, 'token': token, 'CVersion': CVersion, 'OS': OS, 'bindType': bindType, 'prefAccount': '' };
      wx.request({
        url: goodsUrl,
        method: 'GET',
        data: getGoodsDetailPara,
        header: {
          'Content-Type': 'text/plain',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log(res);
          var datas = res.data.resultData,
            datasList = datas.sellRecords;
          that.setData({
            datas: datas,
            datasList: datasList
          });
        },
        complete: function () {

        }
      })

    },
    //影票出票失败
    ajaxFn: function (e) {
        var that = this;
        wx.request({
            url: URL,
            method: 'GET',
            data: orderInfoPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                var data = res.data;
                // console.log(data);
                if (data.resultCode == 0) {
					var msg = data.resultData;
					msg.ticketPrice = Number(msg.ticketPrice.toFixed(0)) / 100;
					msg.goodsPrice = Number(msg.goodsPrice.toFixed(0)) / 100;
					msg.actualPrice = Number(msg.actualPrice.toFixed(0)) / 100;

                    that.setData({
						msg: msg
                    });
                }
            },
            fail: function (res) { },
            complete: function (res) { }
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
})