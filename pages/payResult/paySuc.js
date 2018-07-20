// pages/payResult/paySuc.js
var url = require('../../utils/url.js'),
  URL = url.orderInfo,
  goodsOrdeUrl = url.getSellOrderDetail, //获取卖品订单信息的接口
    orderInfoPara = {},
    cinemaCode,
    member,
    memberCode,
    orderNo,
    movieCode,
    token,
    CVersion,
    OS,
    bindType = -1,
    getGoodsDetailPara;
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
            opt = options,
            sellCode = opt.sellCode,
            goodsFlag = false;
        orderNo = opt.orderNo;
        if (sellCode == 'goods') {
            goodsFlag = true;
        }

        

        
        
        member = wx.getStorageSync('member');
        memberCode = member.memberCode;
        cinemaCode = wx.getStorageSync('cinemaCode');
        movieCode = wx.getStorageSync('cinemaCode');
        token = member.token;
        CVersion = wx.getStorageSync('CVersion');
        OS = wx.getStorageSync('OS');
        that.setData({
          goodsFlag: goodsFlag,
          orderNo: orderNo,
          movieCode: movieCode
        });
        orderInfoPara = {
            'cinemaCode': cinemaCode,
            'memberCode': memberCode,
            'orderNo': orderNo
        };
        getGoodsDetailPara = { 'cinemaCode': cinemaCode, 'memberCode': memberCode, 'orderId': orderNo, 'token': token, 'CVersion': CVersion, 'OS': OS, 'bindType': bindType, 'prefAccount': '' };
        if (goodsFlag){
            that.getGoodsDetailFn();
        } else {
            that.ajaxFn();
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        wx.setNavigationBarTitle({
            title: '支付成功',
        })
    },

    //ajax function
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
                if (data.resultCode == '0') {
                    that.setData({
                        msg: data.resultData
                    });
                }
            },
            fail: function (res) {},
            complete: function (res) {}
        })

    },

    getGoodsDetailFn: function () {
      //debugger;
        var that = this;
        wx.request({
            url: goodsOrdeUrl, //获取卖品订单信息的接口,
            method: 'GET',
            data: getGoodsDetailPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                console.log(res.data);
                if (res.data.resultCode != 0) {
                    return false;
                }
                var datas = res.data.resultData,
                    datasList = datas.sellRecords;
                
                that.setData({
                    goods: datasList
                });
            },
            fail:function(){},
            complete: function () {}
        })
    },
    goTopage: function(){
      var that = this,
          orderNo = this.data.orderNo,
          url='';
      if (!that.data.goodsFlag) {
        url = '../orderInfoList/orderInfoList?orderNo=' + orderNo + '&orderType=1'
      } else {
        url = '../orderInfoList/orderInfoList?orderNo=' + orderNo + '&orderType=2'
      }
      
      wx.navigateTo({
        url: url
      });
    }  
})