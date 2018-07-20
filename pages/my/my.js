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

Page( {
    data: {
        userName: '',
        hasNext: false,
        filmHasNext:  true,
        goodsHasNext: true,
        goodsDataList: [],
        orders: [],
        pageNo: 1,
        noOrder: false,
        toastItem: {
            text: 'sucess!',
            toast_visible: !1
        },
        page: 1
    },

    onLoad: function() {
        wx.hideShareMenu(); //关闭转发按钮
        
        var that = this;
        member = wx.getStorageSync('member');
        cinemaCode = wx.getStorageSync('cinemaCode');
        movieCode = wx.getStorageSync('movieCode');
        memberCode = member.memberCode;


		if (member.memberName == '' ){
			userName = member.nickname;
        } else {
			userName = member.memberName;
        }

        that.setData({
            userName: userName
        });
        orderListPara = { 'cinemaCode': cinemaCode, 'memberCode': memberCode, 'companyCode': movieCode, 'pageNo': that.data.pageNo};
        that.ajaxFn();
    },

    onReady: function () {
        wx.setNavigationBarTitle({
            title: '我的订单'
        });
    },
    //切换分类导航
    changeNav: function (e) {
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
    ajaxFn:function(){
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
            success: function (res) {
				console.log(res);
                if(res.data.resultCode != 0){
                    return false;
                }
                var data = res.data.resultData,
                    refundStatus = data.refundStatus,
                    hasNext = data.hasNext,
                    times; 
                if (data == null){return false;}           
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
                for(var i = 0, len = data.orders.length; i < len; i++) {
                    data.orders[i].filmName = data.orders[i].filmName.slice(0, 12) + '...';
                }
                for (var i = 0, len = data.orders.length; i < len; i++) {
                    data.orders[i].filmPosterNew = data.orders[i].filmPosterNew + "?x-oss-process=image/resize,m_fill,h_170,w_128,limit_0/format,jpg/quality,q_80";

                  // 
                  if (data.orders[i].orderState == '1000') { //未支付订单
                    data.orders[i].detailsUrl = '../confirmOrder/confirmOrder?orderNo=' + data.orders[i].orderNo + '&orderType=1';

                  } else if (data.orders[i].orderState == '1002') { //出票失败
                    data.orders[i].detailsUrl = '../orderInfoList/failureTickte?orderNo=' + data.orders[i].orderNo + '&orderType=1';
                  } else if (data.orders[i].orderState == '1302' || data.orders[i].orderState == '1305') { //退款订单
                    data.orders[i].detailsUrl = '../orderInfoList/orderRefund?orderNo=' + data.orders[i].orderNo + '&orderType=1';

                  } else { //正常完成订单
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
                    orders: data.orders
                  });
                }
                if(pageNo >1){
                  var list = that.data.orders;
                  for (var i = 0; i < data.orders.length;i++){
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
            complete: function () {
                
            }
        });
    },
    getGoodsListFn: function () {
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
        success: function (res) {
          console.log(res)
          if(res.data.resultCode != 0){
              return false;
          }
          
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
              goodsData.sellOrders[i].detailsUrl = '../orderInfoList/failureTickte?orderNo=' + goodsData.sellOrders[i].orderCode + '&orderType= 2';// + goodsData.sellOrders[i].orderType;
            } else if (goodsData.sellOrders[i].orderState == '1302' || goodsData.sellOrders[i].orderState == '1305') { //退款订单
              goodsData.sellOrders[i].detailsUrl = '../orderInfoList/orderRefund?orderNo=' + goodsData.sellOrders[i].orderCode + '&orderType= 2'; // + goodsData.sellOrders[i].orderType;

            } else { //正常完成订单
              goodsData.sellOrders[i].detailsUrl = '../orderInfoList/orderInfoList?orderNo=' + goodsData.sellOrders[i].orderCode + '&orderType= 2'; // + goodsOrders[i].orderType;
            }
          }
          if(pageNo == 1){
            that.setData({
              goodsDataList: goodsData.sellOrders,
              hasNext: hasNext
            });
          }
          if(pageNo >1){
            var list = that.data.goodsDataList;
            for (var i = 0; i < goodsData.sellOrders.length;i++){
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
    goToOrderInfo:function(e){
        var target = e.currentTarget.dataset,
            url = target.detailurl;
            
        
        this.go(e, url);
        // console.log("1234567894564156156")
        // console.log(target)
        // console.log(url)
    },

    //剩余支付时间，倒计时
    countDownFn: function (time, index) {
        var t1 = time.substring(0, time.length - 1).split('分'),
            minute = t1[0],
            second = t1[1];

        var that = this,
            orders = that.data.orders,
            order = orders[index],
            downFlag = false;


            var setTime = setInterval(function () {
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
                if (minute <= 0 && second <= 0) {
                  downFlag = true;
                    // leftTime = "00:00";
                    clearInterval(setTime);
                    if(downFlag){
                      downFlag = false
                      that.setData({
                        hideWin1: false
                      });
                    }else{
                      hideWin1: true
                    }
                    
                }
                order.orderTimeOut = minute + '分' + second + '秒';
                // $("#countDown").text(minute + '分' + second + '秒');

                that.setData({
                    orders: orders
                });

            }, 1000);

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
    refundRule:function(e){
        var url = 'rule';
        wx.navigateTo({
          url: url,
        })
    },

    //页面跳转函数
    go: function (e, url) {
        wx.navigateTo({
            url: url
        });
    },
    //下拉刷新
    onPullDownRefresh: function () {
        // this.ajaxFn();
        // this.setData({
        //     orders: []
        // });

        this.ajaxFn();
        wx.stopPullDownRefresh();
    },

    onReachBottom: function () {
        var pageNo = this.data.pageNo;
        if (this.data.hasNext) {
          pageNo++;
          this.setData({
            pageNo: pageNo
          });
          if (this.data.page == 1) {
            this.ajaxFn();
          } else if (this.data.page == 0){
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



});
