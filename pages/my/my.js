//my.js
//获取应用实例
var api = require('../../utils/url.js'),
  fn = require('../../utils/util.js'),
  orderListUrl = api.orderList,
  getSellOrderListUrl = api.getSellOrderList,
  cinemaCode,
  memberCode,
  member,
  userData,
  movieCode,
  userName, //memberName
  MillisecondToDate = fn.MillisecondToDate,
  orderListPara;

var app = getApp();

Page({
  data: {
    userName: '',
    hasNext: false,
    filmHasNext: true,
    goodsHasNext: true,
    goodsDataList: [],
    orders: [],
    pageNo: 1,
    noOrder: false,
    toastItem: {
      text: 'sucess!',
      toast_visible: !1
    },
    page: 1,
    orderTimeOut: '',
    orderTimeOut1: '',
    hide: null,
    show: null,
    setTime1: null,
    on: 1,
    flag:1
  },

  onLoad: function() {
    wx.hideShareMenu(); //关闭转发按钮

    var that = this;
    member = wx.getStorageSync('member');
    cinemaCode = wx.getStorageSync('cinemaCode');
    movieCode = wx.getStorageSync('movieCode');
    memberCode = member.memberCode;


    if (member.memberName == '') {
      userName = member.nickname;
    } else {
      userName = member.memberName;
    }

    that.setData({
      userName: userName
    });
    orderListPara = {
      'cinemaCode': cinemaCode,
      'memberCode': memberCode,
      'companyCode': movieCode,
      'pageNo': that.data.pageNo
    };

  },

  onReady: function() {
    wx.setNavigationBarTitle({
      title: '我的订单'
    });
    if (this.data.page == 1) {
      this.ajaxFn();
    } else if (this.data.page == 0) {
      this.getGoodsListFn()
    };
  },
  //切换分类导航
  changeNav: function(e) {
    var that = this,
      targets = e.currentTarget.dataset,
      n = targets.index;

    that.setData({
      page: n,
      noOrder: false
    });

    if (n == 0) {
      that.setData({
        goodsDataList: ''
      })
      that.getGoodsListFn();
    } else if (n == 1) {
      that.setData({
        orders: ''
      })

      that.ajaxFn();
    }
  },
  //获取影票订单列表 
  ajaxFn: function() {
    var that = this,
      pageNo = that.data.pageNo;
    orderListPara.pageNo = pageNo;
    wx.request({
      url: orderListUrl,
      method: 'GET',
      data: orderListPara,
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      success: function(res) {
         console.log(res);
        // console.log(that.data.orders);
        if (res.data.resultCode != 0) {
          return false;
        }
        var data = res.data.resultData,
          refundStatus = data.refundStatus,
          hasNext = data.hasNext,
          times;
        if (data == null) {
          return false;
        }
        if (data.orders == undefined || data.orders.length != 0) {
          // console.log(data)
         var times1 = MillisecondToDate(data.orders[0].orderTimeOut);
        that.setData({
          orderTimeOut1: times1
        });
        }
        // if (data.orders == undefined || data.orders.length == 0) {
        //     that.setData({
        //       noOrder: true
        //     });
        //   } else {
        //     that.setData({
        //       toastItem: {
        //         text: '订单已加载完毕！',
        //         toast_visible: !0
        //       }
        //     });

        //     setTimeout(function () {
        //       that.setData({
        //         toastItem: {
        //           toast_visible: !1
        //         }
        //       });
        //     }, 2000);
        //   }
        for (var i = 0, len = data.orders.length; i < len; i++) {
          data.orders[i].filmName = data.orders[i].filmName.slice(0, 12) + '...';
        }
        for (var i = 0, len = data.orders.length; i < len; i++) {
          data.orders[i].filmPosterNew = data.orders[i].filmPosterNew.replace("?x-oss-process=image/format,jpg", "");
          data.orders[i].filmPosterNew = data.orders[i].filmPosterNew + "?x-oss-process=image/resize,m_fill,h_170,w_128,limit_0/format,jpg/quality,q_80";

          // 
          if (data.orders[i].orderState == '1000') { //未支付订单
            data.orders[i].detailsUrl = '../confirmOrder/confirmOrder?orderNo=' + data.orders[i].orderNo + '&orderType=1';

          } else if (data.orders[i].orderState == '1002') { //出票失败
            data.orders[i].detailsUrl = '../orderInfoList/failureTickte?orderNo=' + data.orders[i].orderNo + '&orderType=1';
          } else if (data.orders[i].orderState == '1302' || data.orders[i].orderState == '1305') { //退款订单
            data.orders[i].detailsUrl = '../orderInfoList/orderRefund?orderNo=' + data.orders[i].orderNo + '&orderType=1';

          } else if (data.orders[i].orderState == '1001') { //正常完成订单
            data.orders[i].detailsUrl = '../orderInfoList/orderInfoList?orderNo=' + data.orders[i].orderNo + '&orderType=1';
          }

          if (data.orders[i].orderTimeOut > 0) {
            times = MillisecondToDate(data.orders[i].orderTimeOut);
            data.orders[i].orderTimeOut = times;
          } else {
            data.orders[i].orderTimeOut = '0分0秒';
          }
        }
        if (pageNo == 1) {
          if (data.orders == undefined || data.orders.length == 0) {
            that.setData({
              noOrder: true
            });
          }
          that.setData({
            hasNext: data.hasNext,
            refundStatus: refundStatus,
            orders: data.orders,
          });
        }
        if (pageNo > 1) {
          var list = that.data.orders;
          for (var i = 0; i < data.orders.length; i++) {
            list.push(data.orders[i])
          }

          that.setData({
            hasNext: hasNext,
            refundStatus: refundStatus,
            orders: list
          });
        }
        for (var k = 0; k < data.orders.length; k++) {
          that.countDownFn(data.orders[k].orderTimeOut, k);
        }

      },
      complete: function() {

      }
    });
  },
  getGoodsListFn: function() {
    var that = this,
      pageNo = that.data.pageNo;
    orderListPara.pageNo = pageNo;
    wx.request({
      url: getSellOrderListUrl,
      method: 'GET',
      data: orderListPara,
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      success: function(res) {
        var goodsData = res.data.resultData,
          hasNext = goodsData.hasNext;
        if (pageNo == 1) {
          if (goodsData.sellOrders == undefined || goodsData.sellOrders.length == 0) {

            that.setData({
              noOrder: true
            });
          }

        }
        for (var i = 0; i < goodsData.sellOrders.length; i++) {
          //卖品名称和卖品数量处理
          var goodName = "";
          var goodCount = 0;
          if (goodsData.sellOrders[i].sellRecords.length == 1) {
            if (goodsData.sellOrders[i].sellRecords[0].sellName.length >= 12) {
              goodsData.sellOrders[i].sellRecords[0].sellName = goodsData.sellOrders[i].sellRecords[0].sellName.slice(0, 12) + '...';
            }
            goodName = goodName + goodsData.sellOrders[i].sellRecords[0].sellName;
            goodCount = goodCount + goodsData.sellOrders[i].sellRecords[0].sellCount;
          } else {
            for (var j = 0; j < goodsData.sellOrders[i].sellRecords.length; j++) {
              if (j == 0) {
                goodName = goodName + goodsData.sellOrders[i].sellRecords[j].sellName;
                //console.log(goodsData.sellOrders[i].sellRecords[j].sellName);
              } else {
                goodName = goodName + ' + ' + goodsData.sellOrders[i].sellRecords[j].sellName;
              }
              goodCount = goodCount + goodsData.sellOrders[i].sellRecords[j].sellCount;
            }
            if (goodName.length >= 12) {
              goodName = goodName.slice(0, 12) + '...';
            }
          }
          goodsData.sellOrders[i].goodName = goodName;
          goodsData.sellOrders[i].goodCount = goodCount;
          //卖品图片处理
          if (goodsData.sellOrders[i].sellRecords[0].goodImg == '2016061391465maipinmorenG.jpg') {
            goodsData.sellOrders[i].sellRecords[0].goodImg = host + goodsData.sellOrders[i].sellRecords[0].goodImg;
          } else {
            goodsData.sellOrders[i].sellRecords[0].goodImg = goodsData.sellOrders[i].sellRecords[0].goodImgNew + "?x-oss-process=image/resize,m_fill,h_140,w_140,limit_0";
          };
          //订单状态处理
          if (goodsData.sellOrders[i].orderState == '1000') {
            goodsData.sellOrders[i].detailsUrl = '../confirmOrder/goodsConfirmOrder?orderNo=' + goodsData.sellOrders[i].orderCode;
          } else if (goodsData.sellOrders[i].orderState == '1002') { //出票失败
            goodsData.sellOrders[i].detailsUrl = '../orderInfoList/failureTickte?orderNo=' + goodsData.sellOrders[i].orderCode + '&orderType= 2'; // + goodsData.sellOrders[i].orderType;
          } else if (goodsData.sellOrders[i].orderState == '1302' || goodsData.sellOrders[i].orderState == '1305') { //退款订单
            goodsData.sellOrders[i].detailsUrl = '../orderInfoList/orderRefund?orderNo=' + goodsData.sellOrders[i].orderCode + '&orderType= 2'; // + goodsData.sellOrders[i].orderType;

          } else { //正常完成订单
            goodsData.sellOrders[i].detailsUrl = '../orderInfoList/orderInfoList?orderNo=' + goodsData.sellOrders[i].orderCode + '&orderType= 2'; // + goodsOrders[i].orderType;
          }
        }
        if (pageNo == 1) {
          that.setData({
            goodsDataList: goodsData.sellOrders,
            hasNext: hasNext
          });
        }
        if (pageNo != 1) {
          var list = that.data.goodsDataList;
          for (var i = 0; i < goodsData.sellOrders.length; i++) {
            list.push(goodsData.sellOrders[i]);
          }
          that.setData({
            goodsDataList: list,
            hasNext: hasNext
          });
        }
      }
    })

  },
  goToOrderInfo: function(e) {
    var target = e.currentTarget.dataset,
      url = target.detailurl;


    this.go(e, url);
    // console.log("1234567894564156156")
    // console.log(target)
    // console.log(url)
  },

  //剩余支付时间，倒计时
  countDownFn: function(time, index) {
    var t1 = time.substring(0, time.length - 1).split('分'),
      minute = t1[0],
      second = t1[1];

    var that = this,
      orders = that.data.orders,
      order = orders[0],
      setTime,
      downFlag = false;
    // console.log(order.orderTimeOut)
    setTime = setInterval(function() {
      second--;
      if (second == -1) {
        minute--;

        if (minute == -1) {
          clearInterval(setTime);
          minute = 0;
          second = 0;
        } else {
          second = 59;
        }
      }
      if (second < 0) {
        second = 0;
      }
      if (minute <= 0 && second <= 0) {
        downFlag = true;
        // leftTime = "00:00";
        clearInterval(setTime);
        if (downFlag) {
          downFlag = false
          that.setData({
            hideWin1: false
          });
        } else {
          hideWin1: true
        }

      }
      // console.log(order)
     var orderTimeOut = minute + '分' + second + '秒';
      // $("#countDown").text(minute + '分' + second + '秒');

      that.setData({
        orderTimeOut
      });
    }, 1000);
    that.setData({
      setTime
    })
    // setTimeout(function() {
    //   that.setData({
    //     orderTimeOut1: that.data.orderTimeOut
    //   })
    // }, 1000)
    // console.log(that.data.orderTimeOut1)
  },


  //退出登录
  // logoutFn:function() {
  //     var url = '../home/index';
  //     try{
  //         wx.removeStorageSync('member');
  //         wx.removeStorageSync('userData');
  //         wx.showToast({
  //             title: '退出成功',
  //         });
  //         wx.redirectTo({
  //             url: url,
  //         });
  //     } catch(e) {
  //         wx.showToast({
  //             title: '退出失败！',
  //         });
  //     }

  //     // wx.setStorageSync('member', '');

  // },

  //回到首页
  // goHome: function(e){
  //     var url = '../home/index';
  //     // wx.redirectTo({
  //     //     url: url,
  //     // })
  //     wx.switchTab({
  //         url: url
  //     })
  // },
  refundRule: function(e) {
    var url = 'rule';
    wx.navigateTo({
      url: url,
    })
  },

  //页面跳转函数
  go: function(e, url) {
    wx.navigateTo({
      url: url
    });
  },
  //下拉刷新
  onPullDownRefresh: function() {
    // this.ajaxFn();
    // this.setData({
    //     orders: []
    //   // });
    //   var _this = this;

    //   setTimeout(function(){
    //     clearInterval(_this.data.setTime1);
    //     _this.onShow();
    //   },2000)
    //   wx.stopPullDownRefresh();
  },
  // 页面上拉触底事件的处理函数
  onReachBottom: function() {
    var pageNo = this.data.pageNo;
    if (this.data.hasNext) {
      pageNo++;
      this.setData({
        pageNo: pageNo
      });
      if (this.data.page == 1) {
        this.ajaxFn();
      } else if (this.data.page == 0) {
        this.getGoodsListFn()
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function (res) {
  //     var that = this;

  //     return {
  //         title: '订单列表',
  //         path: 'pages/my/my',
  //         success: function (res) {
  //             // 转发成功
  //         },
  //         fail: function (res) {
  //             // 转发失败
  //         }
  //     }

  // },
flag:function(e){
  this.setData({
    on:2
  })
},
  onShow: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true,
      success: function(res) {}
    })
    var thah = this,
    flag = thah.data.flag;
    thah.setData({
      orderTimeOut1:''
    })
    if(flag == 1){
      thah.setData({
        flag: 2
      })
      if (thah.data.page == 1) {
        thah.ajaxFn();
      } else if (thah.data.page == 0) {
        thah.getGoodsListFn()
      };
      setTimeout(function () {
        // 页面显示计时结束 并读取计时开始的时间
        var show = new Date().getTime(),
          hide = thah.data.hide,
          on = thah.data.on;
        // console.log(on)
        if (hide == null) {
          show = 0
        }
        if (on == 2) {
          show = 0;
          hide = 0;
        }
        // console.log(show)
        var Millisecond = show - hide;
        //  格式化时间
        var minutes = parseInt((Millisecond % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = (Millisecond % (1000 * 60)) / 1000;
        seconds = Math.floor(seconds);
        var orderTimeOut2 = thah.data.orderTimeOut1;
        // console.log(Millisecond, minutes, seconds)
        var t1 = orderTimeOut2.substring(0, orderTimeOut2.length - 1).split('分'),
          minute = t1[0],
          second = t1[1];
        minute = minute - minutes;
        if (minute < 0) {
          minute = 0
        }
        second = second - seconds;
        second = Math.abs(second);
        if (second < 0) {
          second = 0
        }

        var setTime1 = setInterval(function () {
          second--;
          if (second == -1) {
            minute--;

            if (minute == -1) {
              clearInterval(setTime1);
              minute = 0;
              second = 0;
            } else {
              second = 59;
            }
            if (minute <= 0 && second <= 0) {
              clearInterval(setTime1);
            }
          }
          var orderTimeOut = minute + '分' + second + '秒';
          thah.setData({
            orderTimeOut1: orderTimeOut,
            setTime1
          });

        }, 1000);
        wx.hideLoading();
        thah.countDownFn(orderTimeOut2);

      }, 2000);
      setTimeout(function () {
        thah.setData({
          on: 1
        });
        // console.log(thah.data.orderTimeOut1)
      }, 3000)
    } else{
      if (thah.data.page == 1) {
        thah.ajaxFn();
      } else if (thah.data.page == 0) {
        thah.getGoodsListFn()
      };
      return false
    }
    
  },
  onHide: function() {
    clearInterval(this.data.setTime1);
    // 页面隐藏开始计时 并保存
    var hide = new Date().getTime();
    this.setData({
      hide,
      flag: 1
    })
  }
});