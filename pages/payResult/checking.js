// pages/payResult/checking.js
var url = require('../../utils/url.js'),
  orderInfoUrl = url.orderInfo,
  getStateUrl = url.getState, //获取订单状态
  member,
  cinemaCode,
  getStatePara,
  memberCode,
  movieCode,
  token,
  CVersion,
  OS,
  bindType = '-1',
  orderNo;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    failFlag: true, //failFlag,为true时出票失败；为false时出票中
    sendFlag: '0',
    isChecked: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
		console.log(options)
    // debugger;
    var that = this,
      opt = options,
      sellCode = opt.sellCode,
      goodsFlag = false;
    if (opt.isChecked) {
      var sendFlag = opt.sendFlag,
        isChecked = opt.isChecked;
    } else {
      var sendFlag = '',
        isChecked = '';
    }
    if (sellCode == 'goods') {
      goodsFlag = true;
    }else{
			goodsFlag = false;
		}

    that.setData({
      goodsFlag: goodsFlag,
      sendFlag,
      isChecked
    });

    member = wx.getStorageSync('member');
    cinemaCode = wx.getStorageSync('cinemaCode');
    orderNo = opt.orderNo;
    memberCode = member.memberCode;
    movieCode = wx.getStorageSync('movieCode');
    token = member.token;
    CVersion = wx.getStorageSync('CVersion');
    OS = wx.getStorageSync('OS');
    getStatePara = {
      'movieCode': movieCode,
      'cinemaCode': cinemaCode,
      'memberCode': memberCode,
      'orderId': orderNo,
      'token': token,
      'CVersion': CVersion,
      'OS': OS
    }; //获取卖品订单信息需要传的参数

    wx.hideShareMenu();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.setNavigationBarTitle({
      title: '出票中',
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},


  refresh: function() {
		let t = this;
    wx.request({
      url: orderInfoUrl,
      method: 'GET',
      data: {
        'cinemaCode': cinemaCode,
        'memberCode': member.memberCode,
        'orderNo': orderNo,
        'randomTime': new Date().getTime(),
        'token': member.token
      },
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      success: function(res) {
				console.log(res, t.data.sendFlag)
        var data = res.data,
          url = '',
          movieCode = wx.getStorageSync('movieCode'),
          failFlag = true;
				let sendFlag = t.data.sendFlag;
				let isChecked = t.data.isChecked;
				let goodsFlag = t.data.goodsFlag
				if (goodsFlag){
					if (data.resultCode == 0) {
						if (data.resultData.orderState == '1001') { //支付成功
							url = '../payResult/paySuc?orderNo=' + orderNo + '&companyCode=' + movieCode + '&sendFlag=' + sendFlag + '&isChecked=' + isChecked;
						} else if (data.resultData.orderState == '1002') { //出票失败
							url = '../payResult/checking?orderNo=' + orderNo + '&companyCode=' + movieCode + 'failFlag=' + failFlag + '&sendFlag=' + sendFlag + '&isChecked=' + isChecked;
						} else if (data.resultData.orderState == '1007' || data.resultData.orderState == '1000') { //出票中
							failFlag = false;
							url = '../payResult/checking?orderNo=' + orderNo + '&companyCode=' + movieCode + '&failFlag=' + failFlag + '&sendFlag=' + sendFlag + '&isChecked=' + isChecked;
						}
						wx.redirectTo({
							url: url,
						});
					}
				}else{
					if (data.resultCode == 0) {
						if (data.resultData.orderState == '1001') { //支付成功
							url = '../payResult/paySuc?orderNo=' + orderNo + '&companyCode=' + movieCode;
						} else if (data.resultData.orderState == '1002') { //出票失败
							url = '../payResult/checking?orderNo=' + orderNo + '&companyCode=' + movieCode + 'failFlag=' + failFlag;
						} else if (data.resultData.orderState == '1007' || data.resultData.orderState == '1000') { //出票中
							failFlag = false;
							url = '../payResult/checking?orderNo=' + orderNo + '&companyCode=' + movieCode + '&failFlag=' + failFlag;
						}
						wx.redirectTo({
							url: url,
						});
					}
				}
       
      },
      fail: function() {},
      complete: function() {}
    })
  },

  goodsRrefresh: function() {
    var that = this;
    wx.request({
      url: getStateUrl,
      method: 'GET',
      data: getStatePara,
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      success: function(res) {
        console.log(res);
        var data = res.data,
          url = '',
          movieCode = wx.getStorageSync('movieCode'),
          failFlag = true;
        if (data == '1001') {
					url = '../payResult/paySuc?orderNo=' + orderNo + '&companyCode=' + movieCode + '&sellCode=goods' + '&sendFlag=' + that.data.sendFlag + '&isChecked=' + that.data.isChecked;
        } else if (data == '1002') {
					url = '../payResult/payFail?orderNo=' + orderNo + '&companyCode=' + movieCode + '&failFlag=' + failFlag + '&sellCode=goods' + '&sendFlag=' + that.data.sendFlag + '&isChecked=' + that.data.isChecked;
        } else {
          failFlag = false;
					url = '../payResult/checking?orderNo=' + orderNo + '&companyCode=' + movieCode + '&failFlag=' + failFlag + '&sellCode=goods' + '&sendFlag=' + that.data.sendFlag + '&isChecked=' + that.data.isChecked;
        }
        wx.redirectTo({
          url: url
        });

      },
      fail: function() {},
      complete: function() {}
    })
  }

});