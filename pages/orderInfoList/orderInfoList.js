// pages/orderInfoList/orderInfoList.js
var url = require('../../utils/url.js'),
  URL = url.orderInfo,//影票订单详情url
  goodsOrdeUrl = url.getSellOrderDetail, //获取卖品订单信息的接口
  refundUrl = url.refundUrl,
  codeUrl = url.HOST,
  cinemaCode,
  member,
  memberCode,
  goodsNo,
  orderNo, //从订单列表页带过来的订单号
  orderType, //从订单列表页带过来的订单类型
  orderInfoPara = { 'cinemaCode': '', 'memberCode': '', 'orderNo': '' };

Page({

  /**
   * 页面的初始数据
   */
  data: {
    qrcode: codeUrl + '/qrcode/qrcode/getQRCode', //影票二维码
    qrcode1: codeUrl + '/qrcode/qrcode/getQRCode', //卖品二维码
    barcode: codeUrl + '/barCode/barCode/getBarCode', //卖品条形码
    touchFlag: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu(); //关闭转发按钮

    var that = this,
      opt = options,
      qrcode = that.data.qrcode,
      barcode = that.data.barcode;

    orderType = options.orderType;
    orderNo = options.orderNo;

    cinemaCode = wx.getStorageSync('cinemaCode');

    member = wx.getStorageSync('member');

    memberCode = member.memberCode;

    that.setData({
        orderType: orderType
    });

    if (orderType == 1) {
        that.ajaxFn();
    } else if (orderType == 2) {
        that.getGoodsDetailFn();
    }
  },

ajaxFn: function () {
    var that = this,
        pageData = that.data,
        qrcode = pageData.qrcode,
        barcode = pageData.barcode;

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
        console.log(res);
        var data = res.data.resultData,
            seatInfo = data.seatInfo,
            ticketNo = data.ticketNo;
        goodsNo = data.goodsNo;
        // seatInfo = seatInfo.split(' ');
        ticketNo = ticketNo.split(',');

        data.filmPoster = data.filmPoster + "?x-oss-process=image/resize,m_fill,h_170,w_128,limit_0/format,jpg/quality,q_80";

        that.setData({
            qrcode: qrcode + '?content=' + ticketNo,
            qrcode1: qrcode + '?content=' + goodsNo,
            barcode: barcode + '?content=' + goodsNo
        });

        if (goodsNo != undefined && goodsNo != '') {
            if (goodsNo.indexOf(',') != -1) {
                goodsNo = goodsNo.split(',');
            } else {
                goodsNo = goodsNo.split('|');
            }

            data.refundStatus = '0';
        }

        //新加字段
        data.getTicketNum = ticketNo[0]; //取票码
        data.verificatedCode = ticketNo[1]; //取票验证码
        data.getGoodsNum = goodsNo[0]; //取货码
        data.verificatedGoodsCode = goodsNo[1]; //取货验证码

        data.ticketPrice = data.ticketPrice / 100; //票价
        data.goodsPrice = data.goodsPrice / 100; //卖品价格
        data.actualPrice = data.actualPrice / 100; //实付

        that.setData({
          orderInfoData: data
        });
      }
    });

  },
  getGoodsDetailFn: function () {
      var that = this,
        pageData = that.data,
        qrcode = pageData.qrcode,
        barcode = pageData.barcode,
        getGoodsDetailPara = { 'cinemaCode': cinemaCode, 'memberCode': memberCode, 'orderId': orderNo };
    wx.request({
      url: goodsOrdeUrl, //获取卖品订单信息的接口,
      method: 'GET',
      data: getGoodsDetailPara,
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      success: function (res) {
        console.log(res);
        if (res.data.resultCode != 0) {
            return false;
        }
        var datas = res.data.resultData,
            datasList = datas.sellRecords,
            goodsCode = datas.pickupGoodsCode;
        that.setData({
          qrcode1: qrcode + '?content=' + goodsCode,
          barcode1: barcode + '?content=' + goodsCode,
        });

        if (goodsCode != undefined && goodsCode != '') {
            if (goodsCode.indexOf(',') != -1) {
                goodsCode = goodsCode.split(',');
            } else {
                goodsCode = goodsCode.split('|');
            }

          //datas.refundStatus = '0';
        }
        datas.getGoodsNum = goodsCode[0]; //取货码
        datas.verificatedGoodsCode = goodsCode[1]; //取货验证码
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

  //退票接口
  reFundFn: function (e) {
    var _this = this,
      // refundUrl = '',
      orderInfoData = _this.data.orderInfoData,
      touchFlag = _this.data.touchFlag,
      refundpara = {
        cinemaCode: cinemaCode,
        orderNo: orderInfoData.orderNo,
        refundType: 5,
        memberCode: memberCode
      },
      orderRefundUrl = '';

    wx.showModal({
      title: '提示',
      content: '确定将此宝座拱手让人吗？',
      success: function (res) {
        if (res.confirm) {
          // console.log('用户点击确定')
          if (touchFlag) {
            _this.setData({
              touchFlag: false
            });

            wx.request({
              url: refundUrl,
              method: 'GET',
              data: refundpara,
              header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
              },
              success: function (res) {
                console.log(res);
                var queryString = refundpara.orderNo;
                orderRefundUrl = 'orderRefund?orderNo=' + queryString +'&orderType=1';

              },
              fail: function (res) {
                console.log(res);
              },
              complete: function (res) {
                console.log(res)
                _this.setData({
                  touchFlag: true
                });
                console.log(orderRefundUrl)
                wx.redirectTo({
                  url: orderRefundUrl,
                });
              }
            });
          }
        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })

    // if (goodsNo != undefined && goodsNo != '') {
    // 	refundUrl = refundUrl;
    // } else {
    // 	refundUrl = refundGoodsUrl
    // }

  },

	/**
     * 用户点击右上角分享
     */
  codeFn: function (e) {
    var target = e.currentTarget.dataset,
      codeurl = target.barcodeurl,
      codeflag = target.codeflag,
      url = 'code?url=' + codeurl + '&flag=' + codeflag;
    console.log(url);

    wx.navigateTo({
      url: url
    });
  }

})