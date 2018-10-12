// pages/orderInfoList/orderRefund.js
var url = require('../../utils/url.js'),
    URL = url.orderInfo,//影票订单详情的url
    goodsUrl = url.orderGoodsInfo,//卖品订单详情的url
    member,
    cinemaCode,
    memberCode,
    orderNo,
    orderInfoPara = { 'cinemaCode': '', 'memberCode': '', 'orderNo': '' };
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
            orderType = opt.orderType;

        orderNo = options.orderNo;
        that.setData({
          orderType: orderType
        });

        cinemaCode = wx.getStorageSync('cinemaCode');            
        member = wx.getStorageSync('member');            
        memberCode = member.memberCode;
        
        if (orderType == 1) {
          that.ajaxFn();
        } else if (orderType == 2) {
          that.getGoodsDetailFn()
        }
       
    },
    ajaxFn: function(){
        var that = this;
        
      orderInfoPara.orderNo = orderNo;
      orderInfoPara.cinemaCode = cinemaCode;
      orderInfoPara.memberCode = memberCode;
      wx.request({
        url: URL,
        method: 'GET',
        data: orderInfoPara,
        header: {
          'Content-Type': 'text/plain',
          'Accept': 'application/json'
        },
        success: function (res) {
          var data = res.data.resultData,
            seatInfo = data.seatInfo;

          seatInfo = seatInfo.split(' ');

          data.actualPrice = data.actualPrice / 100; //实付
          data.ticketNum = seatInfo.length; //票数
          data.filmPoster = data.filmPoster.replace("?x-oss-process=image/format,jpg", "");
          data.filmPoster = data.filmPoster + "?x-oss-process=image/resize,m_fill,h_170,w_128,limit_0/format,jpg/quality,q_80";

          // var payType = data.payType;
          // if (data.payType == '2') {
          //   data.payType = '支付宝';
          // } else if (data.payType == '3') {
          //   data.payType = '微信';
          // } else if (data.payType == '5') {
          //   data.payType = '储值卡';
          // } else if (data.payType == '10') {
          //   data.payType = '渠道卡';
          //   } 
          //else {
          //   data.payType = '其他';
          // }

          that.setData({
            info: data
          });

        }
      });
    },
    getGoodsDetailFn: function () {
      var that = this,
        getGoodsDetailPara = { 'cinemaCode': cinemaCode, 'memberCode': memberCode, 'orderNo': orderNo };
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
          if (datas.payType == '1') {
            datas.payType = '支付宝';
          } else if (datas.payType == '2') {
            datas.payType = '微信';
          } else if (datas.payType == '3') {
            datas.payType = '储值卡';
          } else if (datas.payType == '4') {
            datas.payType = '渠道卡';
          } else if (datas.payType == '5') {
            datas.payType = '0元兑换券';
          }
          // else {
          //   datas.payType = '其他';
          // }
          that.setData({
            datas: datas,
            datasList: datasList
          });
        },
        complete: function () {

        }
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
})