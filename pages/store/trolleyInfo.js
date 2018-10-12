var url = require('../../utils/url.js'),
    trolleyInfoUrl = url.trolleyList,  //接口：获取购物车里卖品信息
    modifyTrolleyUrl = url.modifyTrolleyVal, //接口： 修改购物车里卖品信息
    emptyTrolleyUrl = url.emptyTrolley, //接口：清空购物车
    creatSellsOrder = url.creatSellsOrder, //接口：创建卖品订单
    movieCode,
    member,
    cinemaCode,
    memberCode,
    token, //token 串,缓存的member对象里面有
    CVersion, //版本编号，缓存里有
    OS, //Android or IOS，缓存里也有
    trolleyId; //购物车id

Page({

  /**
   * 页面的初始数据
   */
    data: {
        toastItem: {
            text: 'sucess!',
            toast_visible: !1
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideShareMenu(); //关闭转发按钮

        var _this = this;
        movieCode = wx.getStorageSync('movieCode'); //companyCode
        cinemaCode = wx.getStorageSync('cinemaCode');
        member = wx.getStorageSync('member');
        memberCode = member.memberCode;
        token = member.token;
        CVersion = wx.getStorageSync('CVersion');
        OS = wx.getStorageSync('OS');

        _this.trolleyList();
    },
    goIndex: function(){
      wx.switchTab({
        url: 'index'
      })
    },
    //获取购物车里卖品信息
    trolleyList: function (str,  index) {
      //debugger;
        var THIS = this;

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
              //debugger;
                console.log(res);
                var resData = res.data;
                if (resData.resultCode == 0) {
                    var trolleyDetails = resData.resultData.trolleyDetails,
                        discountAmount = resData.resultData.discountAmount / 100, //卖品价格
                        typeLen = resData.resultData.typeCount, //购物车里卖品种类数
                        trolleyNum = trolleyDetails.length; //购物车里显示的卖品种类数（做活动的卖品种类，如果选中的超过活动数按照两种卖品计算）
                        // trolleyTotalNum = 0;  //购物车里的总卖品数量
                    
                    trolleyId = resData.resultData.id;

                    if (trolleyNum > 0) {
                        // if (index != null && curSell.limitOut != undefined && curSell.limitOut != ''){
                        if (typeof (index) == 'number' && str == '+1' && trolleyDetails[index]) {
                            var curSell = trolleyDetails[index],
                                limitOut = false;

                            if (curSell.limitOut != null && curSell.limitOut != undefined && curSell.limitOut != '') {
                                limitOut = curSell.limitOut;
                            }

                            if (limitOut == true) {
                                THIS.setData({
                                    toastItem: {
                                        text: '您的限享份数已用完，将以正常价格结算！',
                                        toast_visible: !0
                                    }
                                });

                                setTimeout(function () {
                                    THIS.setData({
                                        toastItem: {
                                            toast_visible: !1
                                        }
                                    });
                                }, 2000);
                            }
                                
                        }

                        // trolleyTotalNum = resData.resultData.productCount; //购物车里的总数
                        for (var i = 0, len = trolleyNum; i < len; i++) {
                            trolleyDetails[i].goodsPrice = (trolleyDetails[i].goodsPrice / 100);
                            trolleyDetails[i].price = trolleyDetails[i].price / 100;
                            discountAmount += (trolleyDetails[i].goodsPrice * trolleyDetails[i].count);
                            //discountAmount += discountAmount.toFixed(2);
                            if (trolleyDetails[i].sellEventPrice){
                                trolleyDetails[i].sellEventPrice = trolleyDetails[i].sellEventPrice / 100;
                            } else {
                                trolleyDetails[i].sellEventPrice = 0;
                            }
                        }
                    }

                    THIS.setData({
                        goodsList: trolleyDetails,
                        typeLen: typeLen,
                        discountAmount: discountAmount.toFixed(2)
                        // trolleyTotalNum: trolleyTotalNum
                    });
                }
            },
            fail: function () {},
            complete: function () {

            }
        });

    },

    //点击清空购物按钮
    clickEmptyBtn:function(){
      //debugger;
        var _this = this,
            typeLen = _this.data.typeLen;
        if (typeLen > 0){
            wx.showModal({
                title: '提示',
                content: '确定清空购物车吗?',
                success: function (res) {
                    if (res.confirm) {
                        _this.emptyTrolleyFn();
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            });
        } else {
            wx.showModal({
                title: '提示',
                content: '购物车还是空的，去把它填满吧！',
                success: function (res) {
                    if (res.confirm) {
                        wx.switchTab({
                            url: 'index'
                        })
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })
        }
            
    },

    //调清空购物车接口
    emptyTrolleyFn:function(){
        var that = this;
        wx.request({
            url: emptyTrolleyUrl,
            method: 'GET',
            data: {
                'memberCode': memberCode, 'cinemaCode': cinemaCode, 'token': token, 'CVersion': CVersion, 'OS': OS, 'companyCode': movieCode, 'id': trolleyId
            },
            header: {
                "Content-Type": "application/x-www-form-urlencoded",
                'Accept': 'application/json'
            },
            success: function (res) {
                console.log(res);

                that.setData({
                    typeLen: 0,
                    discountAmount: 0
                });
            },
            fail:function(){},
            complete:function(){}
        });
    },

    //添加商品
    addFn: function (e) {
        var that = this,
            targets = e.currentTarget.dataset,
            sellIndex = targets.index,
            curGoodsCode = targets.goodscode, //当前卖品的goodsCode
            modifyStr = '+1';  //修改

        that.modifyTrolleyNum(modifyStr, curGoodsCode, sellIndex);
    },

    //减少商品
    reduceFn: function (e) {
        var that = this,
            targets = e.currentTarget.dataset,
            sellIndex = targets.index,
            curGoodsCode = targets.goodscode, //当前卖品的goodsCode
            modifyStr = '-1';//修改       

        that.modifyTrolleyNum(modifyStr, curGoodsCode, sellIndex);
    },

    //修改购物车
    modifyTrolleyNum: function (modifyStr, goodscode, index) {
        var _this = this,
            modifyPara = { 'companyCode': movieCode, 'memberCode': memberCode, 'cinemaCode': cinemaCode, 'type': 1, 'sellId': '', 'quantity': '', 'token': token, 'CVersion': CVersion, 'OS': OS };
            // goodsList = _this.data.goodsList,
            // trolleyTotalNum = _this.data.trolleyTotalNum; //购物车里卖品总数

        modifyPara.sellId = goodscode; //商品编码
        modifyPara.quantity = modifyStr; //‘+1’， ‘-1’，增加，删减

        wx.request({
            url: modifyTrolleyUrl,
            method: 'GET',
            data: modifyPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                var resultCode = res.data.resultCode;
                if (resultCode == 0) {
                    _this.trolleyList(modifyStr, index);
                }  
            },
            fail: function () { },
            complete: function () { }
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {      
        wx.setNavigationBarTitle({
            title: '购物车'
        })
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
        // wx.setStorageSync('backToStore', true);
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
    
    goToMall:function(){
        wx.switchTab({
            url: 'index',
        });
        // wx.setStorageSync('backToStore', true);
    },

    //卖品结算  
    accountFn:function(){
        var self = this,
            goodsList = self.data.goodsList,
            goodsInfo = [],
            creatSellOrderPara = { 'companyCode': movieCode, 'memberCode': memberCode, 'cinemaCode': cinemaCode, 'goodsInfo': '', userPhoneNum: member.memberPhone, 'token': token, 'CVersion': CVersion, 'OS': OS, 'channel':'5'};

            for(var i = 0, len = goodsList.length; i < len; i++) {
                var goodsJson = { goodsCode: '', amount: '', trolleyDetailId: '',sellEventId: '', limitedSell: '' };
                goodsJson.goodsCode = goodsList[i].goodsCode;
                goodsJson.amount = goodsList[i].count;
                goodsJson.trolleyDetailId = goodsList[i].trolleyDetailId;
                goodsJson.sellEventId = goodsList[i].sellEventId;
                goodsJson.limitedSell = goodsList[i].limitedSell;
                goodsInfo.push(goodsJson)
            }

            creatSellOrderPara.goodsInfo = JSON.stringify(goodsInfo);

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
                if(res.data.resultCode == '2202'){
                  wx.navigateTo({
                    url: '../Binding/binding',
                  });
                  return false
                }
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

})