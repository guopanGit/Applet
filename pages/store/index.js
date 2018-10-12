var url = require('../../utils/url.js'),
    fn = require('../../utils/util.js'),
    getStoreCardListUrl = url.storeCardList, //接口：获取商城卡列表信息
    storeGoodsTypeListUrl = url.storeGoodsTypeList, //接口：获取商城卖品类别
    storeGoodsListUrl = url.storeGoodsList, //接口：获取商城卖品列表信息
    byeCardUrl = url.byeCard, //接口：生成购卡订单
    creatSellsOrder = url.creatSellsOrder, //接口：创建卖品订单
    initPay = url.initPay,  //初始化支付
    modifyTrolleyUrl = url.modifyTrolleyVal, //接口： 修改购物车里卖品信息
    trolleyInfoUrl = url.trolleyList, //接口：获取购物车里卖品信息
    movieCode,
    member,
    cinemaCode,
    memberCode,
    userPhone,
    dbClickFlag = true,//点击购卡防止重复点击
    cardOrderInfo, //点击购卡的时候，调起byeCard接口之后，拿到的关于些卡订单的信息
    cardListPara, //获取卡列表参数对象
    goodsListPara, //获取卖品列表参数对象
    byeCardPara, //立即购卡参数
    token, //token 串,缓存的member对象里面有
    CVersion, //版本编号，缓存里有
    OS; //Android or IOS，缓存里也有

Page({

  /**
   * 页面的初始数据
   */
    data: {
        page: 1,
        cinemaName: '',
        cardDetailFlag: false,
        sellDetailFlag: false,
        buttonClicked:false,
        checkflag: true,
        dbClickFlag : true,//点击购卡防止重复点击
        toastItem: {
            text: 'sucess!',
            toast_visible: !1
        }
        // cardNum: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var _this = this;
        _this.reloadFn();
        var page = options.page;
        if (page == 0) {
          page = 0;
        }else{
          page = 1;
        }
        this.setData({
          page: page
        });
        _this.setData({
          cardDetailFlag: false,
          sellDetailFlag: false,
          page: page
        });
        if(_this.data.page == 1){
         // _this.getGoodsListFn();
          wx.setNavigationBarTitle({
            title: '卖品'
          }); 
        } else if (_this.data.page == 0){
          //_this.getCardListFn();
          wx.setNavigationBarTitle({
            title: '会员卡'
          }); 
        }
    },

    reloadFn:function(){
        // var self = this,
        //     cinemaname = wx.getStorageSync('cinemaName');

        // movieCode = wx.getStorageSync('movieCode'); //companyCode
        // cinemaCode = wx.getStorageSync('cinemaCode');
        // member = wx.getStorageSync('member');
        // memberCode = member.memberCode;
        // userPhone = member.memberPhone;
        // token = member.token;
        // CVersion = wx.getStorageSync('CVersion');
        // OS = wx.getStorageSync('OS');

        // if (member == '' || member == undefined || member == null) {
        //     memberCode = '';
        // }

        // cardListPara = { 'companyCode': movieCode, 'memberCode': memberCode, 'cinemaCode': cinemaCode, 'token': token, 'CVersion': CVersion, 'OS': OS };

        // self.setData({
        //     cinemaName: cinemaname,
        // });

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
      var _this = this;
      if (_this.data.page == 1) {
        wx.setNavigationBarTitle({
          title: '卖品'
        });
      } else if (_this.data.page == 0) {
        wx.setNavigationBarTitle({
          title: '会员卡'
        });
      } 
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
      var _this = this,

     // var self = this,
      cinemaname = wx.getStorageSync('cinemaName');

      if (cinemaname.length > 6) {
          cinemaname = cinemaname.slice(0, 6) + '...';
      }

      movieCode = wx.getStorageSync('movieCode'); //companyCode
      cinemaCode = wx.getStorageSync('cinemaCode');
      member = wx.getStorageSync('member');
      memberCode = member.memberCode;
      userPhone = member.memberPhone;
      token = member.token;
      CVersion = wx.getStorageSync('CVersion');
      OS = wx.getStorageSync('OS');

      if (member == '' || member == undefined || member == null) {
        memberCode = '';
      }

      cardListPara = { 'companyCode': movieCode, 'memberCode': memberCode, 'cinemaCode': cinemaCode, 'token': token, 'CVersion': CVersion, 'OS': OS };
      goodsListPara = { 'companyCode': movieCode, 'cinemaCode': cinemaCode, 'memberCode': memberCode,
          'type': 2, 'presetId': -1, 'pageSize': '200', 'currentPageNumber': '1', 'token': token, 'CVersion': CVersion, 'OS': OS};

      _this.setData({
        cinemaName: cinemaname,
      });
      if (_this.data.page == 1) {
        _this.getGoodsListFn();
       
      } else if (_this.data.page == 0) {
        _this.getCardListFn();
      }
      //debugger;
        // var _this = this;
        // _this.setData({
        //     cardDetailFlag: false,
        //     sellDetailFlag: false,
        //     page: 1
        // });
        
        // _this.reloadFn();

        // this.getGoodsListFn();
        // var back = wx.getStorageSync('backToStore');

        // if (back){
        //     _this.getCardListFn();
        //     wx.setStorageSync('backToStore', false);
        // }
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
    },

    //获取卡列表
    getCardListFn:function(e){
        var _this = this,
            cardData,
            cardNum;
        wx.request({
            url: getStoreCardListUrl,
            method: 'GET',
            data: cardListPara,
            header: {
                "Content-Type": "application/x-www-form-urlencoded",
                'Accept': 'application/json'
            },
            success: function (res) {
                console.log(res);
                cardData = res.data.resultData;
                cardNum = cardData.length;

                for(var i=0; i<cardData.length; i++) {
                    cardData[i].cardPrice = cardData[i].cardPrice/100;
                    cardData[i].cardFee = cardData[i].cardFee/100;
                    cardData[i].value = cardData[i].cardPrice - cardData[i].cardFee;
                }

                _this.setData({
                    cardNum: cardNum,
                    cardList: cardData
                });
            },
            fail: function (res) {},
            complete: function (res) {}
        });
    },

    //获取商品列表
    getGoodsListFn: function () {
        var that = this,
            goodsData,
            goodsNum;

        wx.request({
            url: storeGoodsListUrl,
            method: 'GET',
            data: goodsListPara,
            header: {
                "Content-Type": "application/x-www-form-urlencoded",
                'Accept': 'application/json'
            },
            success: function (res) {
                console.log(res);

                var resData = res.data;
                if (resData != '' && resData != undefined && resData != null) {
                    goodsData = resData.resultData.productList;
                    goodsNum = goodsData.length;
                } else {
                    goodsData = [];
                    goodsNum = 0;
                }

                for (var j = 0; j < goodsNum; j++) {
                    goodsData[j].selNum = 0; //当前卖品，用户已选入购物车的的数量
                    goodsData[j].goodsImgNew = goodsData[j].goodsImgNew + "?x-oss-process=image/resize,m_fill,h_160,w_160,limit_0";
                    goodsData[j].goodsPrice = goodsData[j].goodsPrice / 100;
                    goodsData[j].price = goodsData[j].price / 100;
                    if (goodsData[j].sellEventPrice) {
                        goodsData[j].sellEventPrice = goodsData[j].sellEventPrice / 100;
                    } else {
                        goodsData[j].sellEventPrice = 0;
                    }
                }

                that.setData({
                    goodsNum: goodsNum,
                });

                that.getTrolleyList(goodsData, ''); //第二个参数是回调函数
               
            },
            fail: function (res) { },
            complete: function (res) { }
        });
    },

    /*
    **弹框相关函数
    ** @cType: string,'card':会员卡；‘sell’:卖品
    ** @showflag: boolean, true:打开详情，false:关闭
    */
    DetailsFn:function(cType, showflag){
        var that = this,
            animation = wx.createAnimation({
                //动画持续时间
                duration: 500,
                //定义动画效果，当前是匀速
                timingFunction: 'ease',
                delay: 0,   //动画延迟时间，单位 ms
                transformOrigin: "50% 100% 0"
            }),
            cardflag,
            sellflag;
            
        that.animation = animation;
        animation.translateY(380).step();

        that.setData({ 
            animationData: animation.export(),
            // detailsflag: true
        });

        if (showflag) {
            if (cType == 'card') {
                that.setData({
                    cardDetailFlag: true,
                });
            } else if (cType == 'sell') {
                that.setData({
                    sellDetailFlag: true,
                });
            }
        }

        setTimeout(function () {
            animation.translateY(0).step();
            that.setData({
                animationData: animation.export(),
                // detailsflag: false
            });

            if (!showflag) {
                if (cType == 'card') {
                    that.setData({
                        cardDetailFlag: false,
                    });
                } else if (cType == 'sell') {
                    that.setData({
                        sellDetailFlag: false,
                    });
                }
            }

        }.bind(this), 300);
    },

    //点击购卡，弹出卡详情
    byCardFn:function(e){
    //  debugger;
        var self = this,
            target = e.currentTarget.dataset,
            cardIndex = target.index,
            cardList = self.data.cardList;

        // if ((userPhone == undefined || userPhone == '' || userPhone == null) || (memberCode == undefined || memberCode == '' || memberCode == null)){
        //     wx.navigateTo({
        //         url: '../getUserInfo/login'
        //     });
        //     return false;
        // }

        self.setData({
            popInfo: cardList[cardIndex]
        });

        self.DetailsFn('card', true);
    },
    
    //在卡详情弹框里,  点击立即购卡
    byeCardAtOnce: function (e) {
      // console.log(e)
        var self = this,
            checkflag = self.data.checkflag,
            targets = e.currentTarget.dataset,
            cardCode = targets.cardcode,
            applyId = targets.applyid,
            promotionId = targets.promotionid;

        byeCardPara = { 'companyCode': movieCode, 'memberCode': memberCode, 'cinemaCode': cinemaCode, 'cardCode': cardCode, 'applyId': applyId, 'promotionId': promotionId, 'channel': "5", 'token': token, 'CVersion': CVersion, 'OS': OS };
        
        if (!checkflag) {
            wx.showToast({
                title: '请同意购卡协议',
            });
            // self.setData({
            //     toastItem: {
            //         text: '请同意购卡协议',
            //         toast_visible: !0
            //     }
            // });

            // setTimeout(function () {
            //     self.setData({
            //         toastItem: {
            //             toast_visible: !1
            //         }
            //     });
            // }, 2000);
        } else {
            //商城购卡接口
            //fn.buttonClicked(self);
          if (self.data.dbClickFlag) {
            self.setData({
              dbClickFlag: false
            });
          } else {
            return false;
          }
            wx.request({
                url: byeCardUrl,
                method: 'GET',
                data: byeCardPara,
                header: {
                    'Content-Type': 'text/plain',
                    'Accept': 'application/json'
                },
                success: function (res) {
                  console.log(res)
                    var resultCode = res.data.resultCode;
                    // console.log(res.data);
                    if(resultCode == '2202'){
                      wx.navigateTo({
                        url: '../Binding/binding',
                      });
                      return false
                    }
                    if (resultCode == 0){
                        cardOrderInfo = res.data.resultData;
                        self.initPayFn(cardOrderInfo);
                        
                    }
                },
                fail:function(res){},
                complete:function(res){}
            });
        }
    },

    //initpay，卖品支付与商品支付都可以用
    initPayFn: function (orderInfo){
        var t = this,
            params = { 'cinemaCode': cinemaCode, 'memberCode': memberCode };
        // console.log(userInfo)
        params.openId = member.openid;
        params.CVersion = CVersion;
        params.OS = OS;
        params.token = member.token;
        params.orderNo = orderInfo.orderNo;
        //orderType 订单类型 1： 影票（包含影票和卖品组合）  2：单独卖品 3:购卡订单 4 充值订单
        params.orderType = 3;
        //payType 0 支付宝 1 微信
        params.payType = 1;
        
        wx.request({
            url: initPay,
            method: 'GET',
            data: params,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                var data = res.data,
                  error = data.resultDesc;
                    // url;
                    console.log(data);
              
                if (data.resultCode == 0) {
                    // 微信支付
                    
                    wx.requestPayment({
                        'timeStamp': data.resultData.timeStamp,
                        'nonceStr': data.resultData.nonceStr,
                        'package': data.resultData.package,
                        'signType': data.resultData.signType,
                        'paySign': data.resultData.paySign,
                        'success': function (res) { //支付成功回调
                            console.log(res);
                            wx.switchTab({
                              url: '../my/index',
                            });
                            t.setData({
                              cardDetailFlag:false
                            })
                        },
                        'fail': function (res) {  //支付失败
                            // t.setData({
                            //     dbClickFlag: true
                            // }); 
                        },
                        'complete':function(){
                            t.setData({
                                dbClickFlag: true
                            }); 
                        }
                    });
                } else if(data.resultCode == 1) {
                  wx.showToast({
                    title: data.resultDesc,
                    icon: "none",
                    duration: 1000,
                  })

                }
            }
        });
    },

    //勾选已阅读并同意《购卡协议》
    checkFn:function(){
        var _this = this,
            checkflag = _this.data.checkflag;
        
        _this.setData({
            checkflag: !checkflag
        });

    },

    //卖品详情
    sellDetailFn:function(e){
        var self = this,
            target = e.currentTarget.dataset,
            sellIndex = target.index,
            sellList = self.data.goodsList;

        // if ((userPhone == undefined || userPhone == '' || userPhone == null) || (memberCode == undefined || memberCode == '' || memberCode == null)) {
        //     wx.navigateTo({
        //         url: '../getUserInfo/login'
        //     });
        //     return false;
        // }

        self.setData({
            sellPopInfo: sellList[sellIndex]
        });

        self.DetailsFn('sell', true);
    },

    //收起弹窗
    hideDetailsFn:function(){
        var that = this,
            pageData = this.data,
            cardDetailFlag = pageData.cardDetailFlag,
            sellDetailFlag = pageData.sellDetailFlag;

        if (cardDetailFlag){
            that.DetailsFn('card', false);
        }

        if (sellDetailFlag) {
            that.DetailsFn('sell', false);
        }

    },


    changeCinema: function(e){
        wx.redirectTo({
            url: '../cinema/cinema',
        });
    },

    //切换分类导航
    changeNav:function(e){
        var that = this,
            targets = e.currentTarget.dataset,
            n = targets.index;
            
        that.setData({
            page: n
        });
            
        if(n == 0) {
            that.getCardListFn();
            wx.setNavigationBarTitle({
              title: '会员卡'
            });  
        } else if(n == 1){
            that.getGoodsListFn();
            wx.setNavigationBarTitle({
              title: '卖品'
            });  
        }
    },

    //添加商品
    addFn:function(e){
        var that = this,
            targets = e.currentTarget.dataset,
            sellIndex = targets.index,
            curGoodsCode = targets.goodscode, //当前卖品的goodsCode
            modifyStr = '+1',  //修改
            goodsList = that.data.goodsList;

        if ((userPhone == undefined || userPhone == '' || userPhone == null) || (memberCode == undefined || memberCode == '' || memberCode == null)) {
            wx.navigateTo({
                url: '../getUserInfo/login'
            });
            return false;
        }

        if (!sellIndex){
            for(var i = 0; i<goodsList.length; i++) {
                if(goodsList[i].goodsCode == curGoodsCode) {
                    sellIndex = i;
                }
            }
        }

        that.modifyTrolleyNum(modifyStr, curGoodsCode, sellIndex);
    },

    //减少商品
    reduceFn:function(e){
        var that = this,
            targets = e.currentTarget.dataset,
            sellIndex = targets.index,
            curGoodsCode = targets.goodscode, //当前卖品的goodsCode
            modifyStr = '-1', //修改
            goodsList = that.data.goodsList;

        if (!sellIndex) {
            for (var i = 0; i < goodsList.length; i++) {
                if (goodsList[i].goodsCode == curGoodsCode) {
                    sellIndex = i;
                }
            }
        }

        that.modifyTrolleyNum(modifyStr, curGoodsCode, sellIndex);
    },

    //修改购物车
    modifyTrolleyNum:function(modifyStr, goodscode, index){
        var _this = this,
            modifyPara = { 'companyCode': movieCode, 'memberCode': memberCode, 'cinemaCode': cinemaCode, 'type': 1, 'sellId': '', 'quantity': '', 'token': token, 'CVersion': CVersion, 'OS': OS},
            goodsList = _this.data.goodsList,
            trolleyTotalNum = _this.data.trolleyTotalNum; //购物车里卖品总数
        
        modifyPara.sellId = goodscode; //商品编码
        modifyPara.quantity = modifyStr; //‘+1’， ‘-1’，增加，删减
        if (goodsList[index].selNum <= 0 && modifyStr == -1) {
          return false;
        }
        wx.request({
            url: modifyTrolleyUrl,
            method: 'GET',
            data: modifyPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                console.log(res);
                var resultCode = res.data.resultCode;
                if (resultCode == 0){
                    // for (var j = 0; j < goodsList.length; j++){
                    //     if(goodsList[j].goodsCode == goodscode){
                    //         goodsList[j].selNum += Number(modifyStr);
                    //     }
                    // }
                    // var curIndexGoods = goodsList[index];
                    goodsList[index].selNum += Number(modifyStr);
                    trolleyTotalNum += Number(modifyStr);
                    var limitOut = false;

                    //选购活动商品数量超过活动数量，给出提示
                    if ((goodsList[index].limitedSell != null && goodsList[index].limitedSell != undefined && goodsList[index].limitedSell != '') && (goodsList[index].selNum > goodsList[index].limitedSell && modifyStr == '+1')) {
                        _this.setData({
                            toastItem: {
                                text: '您的限享份数已用完，将以正常价格结算！',
                                toast_visible: !0
                            }
                        });

                        setTimeout(function () {
                            _this.setData({
                                toastItem: {
                                    toast_visible: !1
                                }
                            });
                        }, 2000);
                    }                                
                    
                    _this.setData({
                        goodsList: goodsList,
                        sellPopInfo: goodsList[index],
                        trolleyTotalNum: trolleyTotalNum
                    });
                }
            },
            fail:function(){},
            complete:function(){}
        });
    },

    //进入购物车
    goToTrolley:function(){
        if ((userPhone == undefined || userPhone == '' || userPhone == null) || (memberCode == undefined || memberCode == '' || memberCode == null)) {
            // wx.navigateTo({
            //     url: '../getUserInfo/login'
            // });
            // return false;
        }
        wx.navigateTo({
            url: 'trolleyInfo',
        });
    },

    //获取购物车里卖品数据
    getTrolleyList: function(goodsData, callback){
      //debugger;
        var that = this;
        wx.request({
            url: trolleyInfoUrl,
            method: 'GET',
            data: {
                'memberCode': memberCode, 'cinemaCode': cinemaCode, 'token': token, 'CVersion': CVersion, 'OS': OS, 'companyCode': movieCode
            },
            header: {
                "Content-Type": "application/x-www-form-urlencoded",
                'Accept': 'application/json'
            },
            success: function (res) {
                // console.log(res);
                var resData = res.data;
                if (resData.resultCode == 0) {
                    var trolleyDetails = resData.resultData.trolleyDetails,
                        typeLen = resData.resultData.typeCount,
                        trolleyTotalNum = 0;  //购物车里的总卖品数量

                    if (goodsData.length){
                        if (typeLen > 0){
                            trolleyTotalNum = resData.resultData.productCount; //购物车里的总数
                            for (var i = 0, len = typeLen; i < len; i++) {
                                for (var j = 0, len1 = goodsData.length; j < len1; j++) {
                                    if (trolleyDetails[i].goodsCode == goodsData[j].goodsCode) {
                                        goodsData[j].selNum = trolleyDetails[i].count; //把购物车里的数量值传给卖品的selNum字段
                                    }
                                }
                            }
                        }

                        that.setData({
                            goodsList: goodsData,
                            trolleyTotalNum: trolleyTotalNum
                        });
                    } else {
                        that.setData({
                            trolleyList: trolleyDetails
                        });
                    }
                    
                }
            },
            fail: function () { },
            complete: function () {
                if(callback){
                    callback();
                }
            }
        });
    },

    //点击确认选择进行卖品结算  
    chooseFn: function (e) {
      //debugger;
        var self = this,
            curNum = e.currentTarget.dataset.number;
        self.getTrolleyList('',function(){
            var goodsList = self.data.trolleyList,  //购物车里卖品列表信息
                goodsInfo = [],
                creatSellOrderPara = { 'companyCode': movieCode, 'memberCode': memberCode, 'cinemaCode': cinemaCode, 'goodsInfo': '', userPhoneNum: member.memberPhone, 'token': token, 'CVersion': CVersion, 'OS': OS, 'channel': '5'};
            console.log(goodsList.length)

            for (var i = 0, len = goodsList.length; i < len; i++) {
                var goodsJson = { goodsCode: '', amount: '', trolleyDetailId: '', sellEventId: '', limitedSell: '' };
                goodsJson.goodsCode = goodsList[i].goodsCode;
                goodsJson.amount = goodsList[i].count;
                goodsJson.trolleyDetailId = goodsList[i].trolleyDetailId;
                goodsJson.sellEventId = goodsList[i].sellEventId;
                goodsJson.limitedSell = goodsList[i].limitedSell;
                goodsInfo.push(goodsJson);
            }

            creatSellOrderPara.goodsInfo = JSON.stringify(goodsInfo);

            if (curNum == 0) {
                wx.showToast({
                    title: '请选择购买数量',
                    icon: 'none'
                });
            } else {
                wx.request({
                    url: creatSellsOrder,
                    method: 'GET',
                    data: creatSellOrderPara,
                    header: {
                        'Content-Type': 'text/plain',
                        'Accept': 'application/json'
                    },
                    success: function (res) {
                        console.log(res)
                        var resultCode = res.data.resultCode;
                        if (resultCode == 0) {
                            wx.navigateTo({
                                url: '../confirmOrder/goodsConfirmOrder?orderNo=' + res.data.resultData.orderId,
                            });
                        }
                    },
                    fail: function () {},
                    complete: function () {}
                });

            }
        });
        
    },

})