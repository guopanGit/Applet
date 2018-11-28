// pages/confirmOrder/confirmOrder.js
import {
  $showToast
} from '../../utils/packaging.js';
var url = require('../../utils/url.js'),
  fn = require('../../utils/util.js'),
  logoutToken = fn.logoutToken,
  goodsOrdeUrl = url.getSellOrderDetail, //获取卖品订单信息的接口
  voucherUrl = url.getvouchers, //获取卡、券信息的url
  bindOrderUrl = url.sellBindOrder,
  cancelOrderUrl = url.cancelOrder, //取消订单的url
  checkOrderStateUrl = url.checkOrderState,
  payExchange = url.payExchangeGoods, //0元对换券的支付接口
  checkCardPsw = url.checkCardPsw, //校验卡支付密码是否正确
  checkPosCardPsw = url.checkPosCardPsw,
  addRemarks = url.addRemarks, // 配送订单添加备注
  getTakeOutInfo = url.getTakeOutInfo, // 获取影厅列表及配送时间
  MillisecondToDate = fn.MillisecondToDate, //把ms单位的数据改为'mm:ss'
  goodsOrderConfirmPara,
  vocherInfoPara,
  initPay = url.initPay,
  orderNo,
  member,
  memberCode,
  cinemaCode,
  movieCode,
  token, //token 串,缓存的member对象里面有
  CVersion, //版本编号，缓存里有
  OS, //Android or IOS，缓存里也有
  favorInfo, //从卡券页回到确认订单页缓存的优惠信息，取到信息之后，清缓存
  orderType, //订单类型：独产卖品订单、影票订单1:影票；2、商品；3：购卡；4、充值
  bindType = '-1', //绑定类型：0，卡； 1，券
  prefCardName = '',
  prefVoucherName = '',
  preCardCode, //上一次选择的卡code
  precardType, //上一次选择的卡type
  preVoucherCode, //上一次选择的券code
  dbClickFlag = true, //防止双击出现两个支付窗户
  cardPayBack = url.cardPayBack, //校验完卡支付密码，用卡支付
  skipFlag; //判断是否是0元对换券


Page({

  /**
   * 页面的初始数据
   */
  data: {
    hideWin: true,
    // hideWin1: true,
    nocancel: true,
    buttonClicked: false,
    toastItem: {
      text: 'sucess!',
      toast_visible: !1
    },
    pswFlag: false, //输入密码弹框flag
    discounGMoney: 0, //优惠金额
    detailsflag: false,
    detailsflags: false,
    detailsflags1: false,
    dbClickFlag: true, //防止双击出现两个支付窗户
    noprice: false,
    prefVoucherName: '',
    isChecked: true,
    movW: 400,
    rowW: 200,
    sendFlag: '0', // 是否显示配送
    remarks: '',
    location: '尽快送达',
    takeoutFee: 0, // 配送费
    goodsDisPrice: 0,
    payment: '',
    orderid: '',
    movie: '',
    row: '',
    seat: '',
    movies: Array,
    rows: ["1排", "2排", "3排", "4排", "5排"],
    seats: ["1座", "2座", "3座", "4座", "5座"],
    days: Array,
    times: Array,
    time: Array,
    screening: Array,
    timeInfo: Array,
    goodsDisPrice: 0,
    isend: true,
    takeoutFlag: 'true',
    isShow: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
    var that = this,
      opt = options;
    orderNo = opt.orderNo;
    let takeoutFlag = opt.takeoutFlag;
    cinemaCode = wx.getStorageSync('cinemaCode');
    member = wx.getStorageSync('member');
    memberCode = member.memberCode;
    movieCode = wx.getStorageSync('movieCode');
    token = member.token;
    if (!token) {
      token = ''
    }
    CVersion = wx.getStorageSync('CVersion');
    OS = wx.getStorageSync('OS');
    var movie = wx.getStorageSync('movie'),
      row = wx.getStorageSync('row'),
      seat = wx.getStorageSync('seat');
    that.setData({
      takeoutFlag,
      movie,
      row,
      seat
    });
    setTimeout(() => {
      if (that.data.sendFlag == 0 && takeoutFlag == 'false') {
        $showToast('有不可配送商品，本单不支持配送')
      }
    }, 2000)
    // that.ajaxFn();
  },

  //ajax fn
  ajaxFn: function() {

    var the = this,
      data, //承载
      vocherNum, //券张数
      discounGMoney = 0; //卖品用卡券优惠的金额

    goodsOrderConfirmPara = {
      'cinemaCode': cinemaCode,
      'memberCode': memberCode,
      'orderId': orderNo,
      'token': token,
      'CVersion': CVersion,
      'OS': OS,
      'bindType': bindType,
      'prefAccount': ''
    }; //获取卖品订单信息需要传的参数
    vocherInfoPara = {
      'cinemaCode': cinemaCode,
      'memberCode': memberCode,
      'orderNo': orderNo,
      'pageNo': 1,
      'voucherType': -1,
      'token': token,
      'CVersion': CVersion,
      'OS': OS
    }; //获取券列表需要传的参数

    if (favorInfo) {
      goodsOrderConfirmPara.prefAccount = favorInfo.preCardCode;
      // prefType = favorInfo.
    }

    wx.request({
      url: goodsOrdeUrl,
      method: 'GET',
      data: goodsOrderConfirmPara,
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      success: function(res) {
        // console.log(res, '订单', res.data.resultData.sendFlag);
        var data = res.data.resultData,
          sendFlag = data.sendFlag,
          orderid = data.orderId, // 订单号
          goodsTotalPrice = 0, //卖品总价
          goodsListData = data.sellRecords; //卖品信息列表
        let goodsDisPrice = data.goodsDisPrice / 100;
        if (sendFlag == 0) {
          the.setData({
            isShow: false
          })
        }
        the.setData({
          orderid,
          sendFlag,
          goodsDisPrice
        });
        if (the.data.isChecked && the.data.sendFlag == '1') {
          setTimeout(() => {
            the.setData({
              payment: (goodsDisPrice + the.data.takeoutFee).toFixed(2)
            })
          }, 800)
        } else {
          the.setData({
            payment: goodsDisPrice
          })
        }
        data.goodsDisPrice = data.goodsDisPrice / 100;
        data.goodsPrice = data.goodsPrice / 100;
        for (var i = 0, len = goodsListData.length; i < len; i++) {
          goodsListData[i].sellCurPrice = (goodsListData[i].sellCount * goodsListData[i].strategyPrice / 100).toFixed(2);
          if (goodsListData[i].sellUnit == null || goodsListData[i].sellUnit == undefined) {
            goodsListData[i].sellUnit = ''; //卖品的单位
          }
          goodsListData[i].strategyPrice = (goodsListData[i].strategyPrice / 100).toFixed(2);
          goodsListData[i].sellPrice = (goodsListData[i].sellPrice / 100).toFixed(2);

          // goodsTotalPrice += parseInt(goodsListData[i].sellPrice) * goodsListData[i].sellCount;
          goodsTotalPrice += goodsListData[i].strategyPrice * goodsListData[i].sellCount;
        }

        var money = 0,
          // ticketActual = data.ticketActual,
          goodsActual = goodsTotalPrice.toFixed(2);

        if (favorInfo) {
          //优惠后，实付价
          data.resultPrice = (favorInfo.paymentAmount / 100);
          discounGMoney = (favorInfo.covGdiscount / 100);
          data.goodsActual = (goodsTotalPrice - discounGMoney).toFixed(2);

          if (discounGMoney == '' || discounGMoney == undefined || discounGMoney == null || discounGMoney == 0) {
            discounGMoney = 0;
          }

          goodsActual = data.goodsActual;
        }

        the.setData({
          discounGMoney: discounGMoney,
          // favorInfo: favorInfo
        });

        // if (ticketActual != null && ticketActual != undefined) {
        //     money += Number(ticketActual);
        // }
        if (goodsActual != null && goodsActual != undefined) {
          money += Number(goodsActual);
        }

        data.resultPrice = money.toFixed(2);

        data.sellRecords = goodsListData;
        data.totalPrice = (data.totalPrice / 100).toFixed(2);

        if (data.confirmFlag == '1') {
          data.goodsActual = (data.realPrice / 100).toFixed(2);
          // precardType = data.prefType;

          if (data.prefType == 0) {
            bindType = '-1';
          } else if (data.prefType == 1) {
            bindType = '0';
          } else if (data.prefType == 2) {
            bindType = '1';
          }

          if (data.payType == 102) {
            skipFlag = '1'
          } else {
            if (data.payType == 100) {
              precardType = '1';
            } else if (data.payType == '10' || data.payType == '11') {
              precardType = data.dataType;

            }
          }
          the.setData({
            prefVoucherName: data.prefName
          })
        }

        the.setData({
          goodsMsg: data
        });

        //处理好订单信息以后，获取会员卡、券信息
        wx.request({
          url: voucherUrl,
          method: 'GET',
          data: vocherInfoPara,
          header: {
            'Content-Type': 'text/plain',
            'Accept': 'application/json'
          },
          success: function(res) {
            // console.log(res);
            var vocherData = res.data.resultData;
            vocherNum = vocherData.vouherCount;

            the.setData({
              vocherNum: vocherNum
            });

          },
          fail: function() {},
          complete: function() {}
        });

        // console.log(the.data.goodsMsg);
      },
      fail: (res) => {
        setTimeout(() => {
          wx.hideLoading();
        }, 1000)
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.setNavigationBarTitle({
      title: '确认订单',
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    setTimeout(() => {
      if (that.data.discounGMoney != 0 && that.data.discounGMoney != undefined) {
        that.setData({
          payment: (that.data.payment - that.data.discounGMoney).toFixed(2)
        })
      }
    }, 1000)

    favorInfo = wx.getStorageSync('favorInfo'); //从卖品页进入确认订单页时（或者没有选卡券），此值为undefined
    bindType = wx.getStorageSync('bindType'); //从卖品页进入确认订单页（或者没有选卡券）时，此值为undefined
    // favorInfo = JSON.parse(favorInfo);
    if (favorInfo && bindType != undefined) {
      favorInfo = JSON.parse(favorInfo);

      if (bindType == '0') {
        preCardCode = favorInfo.preCardCode;
        precardType = favorInfo.cardType;
        prefCardName = favorInfo.prefCardName;
      } else if (bindType == '1') {
        preVoucherCode = favorInfo.preVoucherCode;
        prefVoucherName = favorInfo.prefVoucherName;
      } else {
        bindType = '-1';
      }
      // console.log(favorInfo);
      that.setData({
        bindType: bindType,
        perCardName: prefCardName,
        prefVoucherName: prefVoucherName,
      });

      //数据取出来之后把缓存清空
      wx.removeStorageSync('bindType');
      wx.removeStorageSync('favorInfo');

    } else {
      preCardCode = undefined;
      preVoucherCode = undefined;
      bindType = '-1'
      that.setData({
        bindType: bindType
      });
    }
    that.getTakeOutInfo();
    that.ajaxFn();
  },


  onHide() {
    wx.setStorageSync('scenc', '1001');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    /*
    卸载页面取消订单
    var canclePara = {
    	'memberCode': memberCode,
    	'cinemaCode': cinemaCode,
    	'orderNo': orderNo
    }
    wx.request({
    	url: cancelOrderUrl,
    	method: 'GET',
    	data: canclePara,
    	header: {
    		'Content-Type': 'text/plain',
    		'Accept': 'application/json'
    	},
    	success: (res) => {}
    })
    */
  },

  //click to choose card
  chooseCard: function(e) {
    var that = this;
    wx.navigateTo({
      url: 'chooseCard?orderNo=' + orderNo + '&preCardCode=' + preCardCode + '&orderType=4'
    });
  },

  //click to choose coupon
  chooseCoupon: function(e) {
    var that = this,
      targets = e.currentTarget.dataset,
      voucherNum = targets.vouchernum;

    wx.navigateTo({
      url: 'chooseCoupon?orderNo=' + orderNo + '&preVoucherCode=' + preVoucherCode + '&orderType=4'
    });
  },

  //click to pay
  confirmToPay: function(e) {

    var t = this,
      msg = t.data.msg,
      sendFlag = t.data.sendFlag,
      movie = t.data.movie,
      row = t.data.row,
      seat = t.data.seat,
      days = t.data.days,
      times = t.data.times,
      remarks = t.data.remarks,
      location = t.data.location,
      sendAddress = `${movie}${row}${seat}`,
      bindOrderPara = {
        'cinemaCode': cinemaCode,
        'memberCode': memberCode,
        'companyCode': movieCode,
        'address': sendAddress,
        'sendTime': location,
        'remarks': remarks
      },
      ticketName;
    if (bindOrderPara.sendTime == "尽快送达") {
      let date = new Date();
      let myDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
      bindOrderPara.sendTime = myDate;
    }
    if (sendAddress == '请选择座位信息' && t.data.isChecked == true && sendFlag == 1) {
      $showToast('请选择座位信息')
      return false
    }
    if (t.data.isChecked == false) {
      bindOrderPara.address = '',
        bindOrderPara.remarks = '',
        bindOrderPara.sendTime = ''
    }
    // skipFlag; //判断是否是0元对换券
    if (t.data.dbClickFlag) {
      t.setData({
        dbClickFlag: false,
      });
    } else {
      return false;
    }

    bindOrderPara.orderNo = orderNo;
    bindOrderPara.prefAccount = ''; //卡或券的编号
    bindOrderPara.bindType = ''; //绑定类型
    bindOrderPara.version = CVersion;
    bindOrderPara.CVersion = CVersion;
    bindOrderPara.token = member.token;
    bindOrderPara.OS = OS;
    bindOrderPara.orderType = 2;
    if (sendFlag != '1') {
      bindOrderPara.address = '',
        bindOrderPara.remarks = '',
        bindOrderPara.sendTime = ''
    } else {
      bindOrderPara.orderType = 4;
    }

    if (favorInfo) {
      // bindOrderPara.prefAccount = favorInfo.preCardCode;
      if (bindType == '0') {
        bindOrderPara.prefAccount = favorInfo.preCardCode;
        bindOrderPara.cardType = precardType;
      } else if (bindType == '1') {
        bindOrderPara.prefAccount = favorInfo.preVoucherCode;
      } else {
        bindType = '-1';
      }
      bindOrderPara.bindType = bindType;
    }

    // console.log(bindOrderPara);   

    wx.request({
      url: bindOrderUrl,
      method: 'GET',
      data: bindOrderPara,
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      success: function(res) {
        var data = res.data;
        // console.log(data);
        if (data.resultCode == 1) {
          t.setData({
            theFlag: true
          });
          if (data.resultDesc == 'TOKEN_INVALID') {
            logoutToken();
            t.setData({
              hideWin: false,
            });

          } else {
            if (data.resultDesc.indexOf("取消")) {
              wx.redirectTo({
                url: '../home/index',
              });
            }
          }
          return false;
        } else {
          t.setData({
            theFlag: false
          });

          skipFlag = data.resultData.skipFlag;

          var exchangeParams = {
            'companyCode': movieCode,
            'cinemaCode': cinemaCode,
            'memberCode': memberCode,
            'token': token,
            'CVersion': CVersion,
            'OS': OS,
            'orderNo': orderNo,
            'payType': '7'
          };

          if (bindType == '1') {
            ticketName = t.data.prefVoucherName;
          }
          if (skipFlag == '1' && bindType == '1') { // 此时选的是0元对换券，直接
            wx.showModal({
              title: '提示',
              content: '确认使用' + ticketName + '完成支付？',
              success: function(res) {
                if (res.confirm) { // console.log('用户点击确定')
                  wx.request({ //调0元对换券支付接口
                    url: payExchange,
                    method: 'GET',
                    data: exchangeParams,
                    header: {
                      'Content-Type': 'text/plain',
                      'Accept': 'application/json'
                    },
                    success: function(res) {
                      if (res.data.resultCode == 0) {
                        $showToast('支付成功')
                        t.paySuccess();
                      } else {
                        wx.showModal({
                          title: '提示',
                          content: res.data.resultDesc,
                          success: function(res) {
                            if (res.confirm) {
                              // console.log('用户点击确定')
                            } else if (res.cancel) {
                              // console.log('用户点击取消')
                            }
                          }
                        })

                        t.ajaxFn();
                      }
                    },
                    fail: function() {
                      t.ajaxFn();
                    },
                    complete: function() {}
                  });
                } else if (res.cancel) { // console.log('用户点击取消')
                  t.setData({
                    dbClickFlag: true
                  });
                  t.ajaxFn();
                }
              }
            });
          } else {
            //调起微信支付
            var params = {
              'cinemaCode': cinemaCode,
              'memberCode': memberCode,
              'companyCode': movieCode
            };
            // console.log(userInfo)
            params.openId = member.openid;
            params.CVersion = CVersion;
            params.OS = OS;
            params.token = token;
            params.orderNo = orderNo;
            params.orderType = 2;
            params.payType = 1;

            if (bindType == '0' && precardType != '2') {
              t.setData({
                pswFlag: true
              });
            } else { //如果选的不是储值卡或者pos卡，则直接支付
              // t.paySuccess();
              // url: 'https://api.mplus.net.cn:443/mplus/app/pay/initPay',
              wx.request({
                url: initPay,
                method: 'GET',
                data: params,
                header: {
                  'Content-Type': 'text/plain',
                  'Accept': 'application/json'
                },
                success: function(res) {
                  var data = res.data,
                    url;
                  if (data.resultCode == 0) {
                    // 微信支付

                    // console.log(data);
                    wx.requestPayment({
                      'timeStamp': data.resultData.timeStamp,
                      'nonceStr': data.resultData.nonceStr,
                      'package': data.resultData.package,
                      'signType': data.resultData.signType,
                      'paySign': data.resultData.paySign,
                      'success': function(res) { //支付成功回调
                        // console.log(res);
                        t.paySuccess();
                      },
                      'fail': function(res) { //支付失败
                        t.setData({
                          dbClickFlag: true
                        });
                        t.ajaxFn();
                      },
                      'complete': function(res) { //支付完成
                        // console.log(res);
                      }
                    });
                  } else {
                    t.ajaxFn();

                    t.setData({
                      toastItem: {
                        text: data.resultDesc,
                        toast_visible: !0
                      }
                    });

                    setTimeout(function() {
                      t.setData({
                        toastItem: {
                          toast_visible: !1
                        }
                      });
                    }, 2000);

                  }
                },
              });
            }
          }
        }
      },
      fail: function() {},
      complete: function() {
        // t.setData({
        //     dbClickFlag: true
        // }); 
      }
    });
    // }

  },

  //取消订单Fn
  cancleOrderFn: function(e) {
    // console.log(e)
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否取消订单',
      showCancel: true,
      cancelText: '取消订单',
      confirmText: '继续支付',
      success: function(res) {
        if (res.confirm) {
          that.confirmToPay(e);
        } else if (res.cancel) {
          // var that = this;
          var canclePara = {
            'memberCode': memberCode,
            'cinemaCode': cinemaCode,
            'orderNo': orderNo
          }
          wx.request({
            url: cancelOrderUrl,
            method: 'GET',
            data: canclePara,
            header: {
              'Content-Type': 'text/plain',
              'Accept': 'application/json'
            },
            success: function(res) {
              if (res.data.resultCode == 1) {
                $showToast(res.data.resultDesc)
              } else {
                wx.switchTab({
                  url: '../my/index',
                })
              }
            }
          })
        }
      }
    })

  },

  //account details
  accountDetails: function(e) {
    var that = this,
      animation = wx.createAnimation({
        //动画持续时间
        duration: 500,
        //定义动画效果，当前是匀速
        timingFunction: 'ease',
        delay: 0, //动画延迟时间，单位 ms
        transformOrigin: "50% 100% 0"
      });
    // 将该变量赋值给当前动画
    that.animation = animation;
    animation.translateY(380).step();

    that.setData({
      animationData: animation.export(),
      detailsflag: true
    });

    setTimeout(function() {
      animation.translateY(0).step();
      that.setData({
        animationData: animation.export()
      });
    }.bind(this), 200);
  },

  //hide the detail window
  hideDetails: function() {
    var that = this,
      animation1 = wx.createAnimation({
        //动画持续时间
        duration: 500,
        //定义动画效果，当前是匀速
        timingFunction: 'ease',
        delay: 0, //动画延迟时间，单位 ms
        transformOrigin: "50% 100% 0"
      });

    that.animation = animation1;
    animation1.translateY(380).step();

    that.setData({
      animationData: animation1.export()
    });

    setTimeout(function() {
      animation1.translateY(0).step();
      that.setData({
        animationData: animation1.export(),
        detailsflag: false
      });
    }.bind(this), 300);
  },

  //支付成功之后
  paySuccess: function(e) {
    var that = this;

    wx.request({
      url: goodsOrdeUrl,
      method: 'GET',
      data: goodsOrderConfirmPara,
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      success: function(res) {
        // console.log(res);
        var data = res.data,
          url = '',
          movieCode = wx.getStorageSync('movieCode'),
          sendFlag = that.data.sendFlag,
          isChecked = that.data.isChecked,
          failFlag = true;
        // console.log(sendFlag)
        if (data.resultCode == 0) {
          if (data.resultData.orderState == '1001') { //支付成功
            url = '../payResult/paySuc?orderNo=' + orderNo + '&companyCode=' + movieCode + '&sellCode=goods&sendFlag=' + sendFlag + '&isChecked=' + isChecked;
          } else if (data.resultData.orderState == '1002') { //出货失败
            url = '../payResult/payFail?orderNo=' + orderNo + '&companyCode=' + movieCode + '&failFlag=' + failFlag + '&sellCode=goods&sendFlag=' + sendFlag + '&isChecked=' + isChecked;
          } else if (data.resultData.orderState == '1007' || data.resultData.orderState == '1000') { //出货中
            failFlag = false;
            url = '../payResult/checking?orderNo=' + orderNo + '&companyCode=' + movieCode + '&failFlag=' + failFlag + '&sellCode=goods&sendFlag=' + sendFlag + '&isChecked=' + isChecked;
          }
          wx.redirectTo({
            url: url,
          });
        }
      },
      fail: function() {},
      complete: function() {}
    })
  },

  //pop window confirm fn
  confirm: function() {
    var thus = this,
      url = path + "";

    thus.setData({
      hideWin: true
    });

    if (thus.data.theFlag) {
      var data = {
        orderNo: orderNo,
        cinemaCode: cinemaCode,
        memberCode: memberCode
      };
      wx.request({
        url: cancelOrderUrl,
        method: 'GET',
        data: data,
        header: {
          'Content-Type': 'text/plain',
          'Accept': 'application/json'
        },
        success: function(res) {
          wx.redirectTo({
            url: '../login/login',
          });
        }
      });
    }

  },

  confirm1: function() {
    var that = this,
      url = '../home/index';

    wx.redirectTo({
      url: url,
    });

  },

  //输入支付密码，点击确认按钮
  setPswFn: function(e) {
    var _this = this,
      formData = e.detail.value,
      psw = formData.setnewPsw,
      reg = /^\d{6}$/,
      payPosParams = {
        'companyCode': movieCode,
        'cinemaCode': cinemaCode,
        'memberCode': memberCode,
        'token': token,
        'CVersion': CVersion,
        'OS': OS,
        'password': '',
      };
    if (psw == '') {
      $showToast('请输入密码')
      return false;
    }
    if (precardType == '11') {
      checkCardPsw = checkPosCardPsw;
      payPosParams.prefAccount = preCardCode;
      payPosParams.orderNo = orderNo;
    }
    payPosParams.password = psw;
    // 补：防双击
    fn.buttonClicked(_this);

    wx.request({
      url: checkCardPsw,
      method: 'GET',
      data: payPosParams,
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      success: function(res) {
        _this.checkWalletPswBack(res);
      },
      fail: function() {},
      complete: function() {}
    });

  },

  //校验卡密码
  checkWalletPswBack: function(res) {
    var that = this,
      data = res.data;

    if (data.resultCode != "0") { //卡密码输入错误
      that.setData({
        psw: ''
      });
      wx.showModal({
        title: '提示',
        content: data.resultDesc,
      })
    } else {
      var payBackParams = {
        'companyCode': movieCode,
        'cinemaCode': cinemaCode,
        'memberCode': memberCode,
        'token': token,
        'CVersion': CVersion,
        'OS': OS,
        'orderNo': orderNo,
        'orderType': '4',
        'payType': ''
      };

      if (precardType == "10" || precardType == "11") {
        payBackParams.payType = precardType;
      } else {
        payBackParams.payType = 3; //小程序：3
      }
      wx.request({
        url: cardPayBack,
        method: 'GET',
        data: payBackParams,
        header: {
          'Content-Type': 'text/plain',
          'Accept': 'application/json'
        },
        success: function(res) {
          var data = res.data;
          if (data.resultCode != 0) {
            wx.showModal({
              title: '提示',
              content: data.resultDesc,
            });

            return false;
          } else {
            that.paySuccess();
          }
        },
        fail: function() {},
        complete: function() {}
      })

      that.setData({
        pswFlag: false,
        dbClickFlag: true
      });
    }



  },

  //关闭输入密码弹框
  hideDetailsFn: function() {
    var that = this;

    that.setData({
      pswFlag: false,
      dbClickFlag: true
    });

    that.ajaxFn();
  },
  // 是否配送
  changeSwitch() {
    const t = this;
    let takeoutFee = t.data.takeoutFee;
    let goodsDisPrice = t.data.goodsDisPrice;
    let discounGMoney = t.data.discounGMoney;
    let remarks = t.data.remarks;
    if (!discounGMoney) {
      discounGMoney = 0
    }
    if (!t.data.isChecked) {
      t.setData({
        payment: (takeoutFee + goodsDisPrice - discounGMoney).toFixed(2)
      })
    } else {
      t.setData({
        payment: (goodsDisPrice - discounGMoney).toFixed(2)
      })
    }
    t.setData({
      isChecked: !t.data.isChecked
    })
  },

  //  订单备注
  focusFn(e) {
    var that = this,
      remarks = e.detail.value;
    that.setData({
      remarks
    });
  },
  //  配送位置
  distribution: function() {
    var thit = this;
    wx.showModal({
      title: '',
      content: '仅显示提供配送服务的影厅',
      showCancel: false,
      confirmText: '我知道了',
      confirmColor: '#f6553c',
      success: function() {
        thit.setData({
          detailsflags1: true
        });
      }
    });
  },
  // 配送位置
  bindChange(e) {
    // console.log(e)
    const val = e.detail.value;
    const screening = this.data.screening;
    let rows = [];
    let seats = [];
    for (let i = 0; i < screening[val[0]].child.length; i++) {
      rows.push(screening[val[0]].child[i].name)
    }
    this.setData({
      rows
    })
    for (let i = 0; i < screening[val[0]].child[val[1]].child.length; i++) {
      seats.push(screening[val[0]].child[val[1]].child[i].name)
    }
    this.setData({
      seats,
      movie: this.data.movies[val[0]],
      row: this.data.rows[val[1]],
      seat: this.data.seats[val[2]]
    });
  },
  // 配送时间
  bindChanges(e) {

    const val = e.detail.value;
    const timeInfo = this.data.timeInfo;
    // console.log(timeInfo)
    let times = [];
    for (let i = 0; i < timeInfo[val[0]].child.length; i++) {
      times.push(timeInfo[val[0]].child[i].name)
    }
    this.setData({
      times,
    })
    this.setData({
      day: this.data.days[val[0]],
      time: this.data.times[val[1]]
    });
    let time1 = this.data.time;
    if (time1 == undefined) {
      time1 = '';
      return false
    }
    let location = `${this.data.day} ${time1}`;
    this.setData({
      location
    })
  },
  // 关闭配送位置
  confirm1(e) {
    let isend = this.data.isend;
    if (isend) {
      this.setData({
        detailsflags: false,
        detailsflags1: false
      })
    }
  },

  startFn() {
    this.setData({
      isend: false
    })
  },

  endFn(e) {
    console.log(e)
    this.setData({
      isend: true
    })
  },
  // 配送位置
  changes(e) {
    this.setData({
      detailsflags: true
    });
  },

  // 获取影厅列表及配送时间
  getTakeOutInfo() {
    let t = this;
    let cinemaCode = wx.getStorageSync("cinemaCode");
    let date = {
      'cinemaCode': cinemaCode
    }
    wx.request({
      url: getTakeOutInfo,
      method: 'GET',
      data: date,
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      success: (res) => {
        // console.log(res)
        let data = res.data.resultData;
        if (data == null) {
          return false;
        }
        if (data.hallInfo.length < 1) {
          this.setData({
            isShow: false
          })
        }
        let movies = [];
        let screening = data.hallInfo;
        let timeInfo = data.timeInfo;
        let takeoutFee = data.takeoutFee;
        // console.log(takeoutFee)
        for (let i = 0; i < screening.length; i++) {
          if (screening[i].name.length > 10) {
            this.setData({
              movW: 500,
              rowW: 100
            })
          }
          movies.push(screening[i].name)
        }
        let days = [];
        let times = [];
        for (let i = 0; i < timeInfo.length; i++) {
          days.push(timeInfo[i].id)
        }
        for (let i = 0; i < timeInfo[0].child.length; i++) {
          times.push(timeInfo[0].child[i].name)
        }
        if (times.length < 1) {
          days.shift()
          times = [];
          for (let i = 0; i < timeInfo[1].child.length; i++) {
            times.push(timeInfo[1].child[i].name)
          }
        }
        this.setData({
          movies,
          days,
          times,
          screening,
          timeInfo,
          takeoutFee
        })
      },
    });
  }
})