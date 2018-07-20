// pages/confirmOrder/confirmOrder.js
var url = require('../../utils/url.js'),
    fn = require('../../utils/util.js'),
    logoutToken = fn.logoutToken,
    goodsOrdeUrl = url.getSellOrderDetail, //获取卖品订单信息的接口
    voucherUrl = url.getvouchers, //获取卡、券信息的url
    bindOrderUrl = url.sellBindOrder,
    cancelOrderUrl = url.cancelOrder, //取消订单的url
    checkOrderStateUrl = url.checkOrderState,
    payExchange = url.payExchangeGoods,  //0元对换券的支付接口
    checkCardPsw = url.checkCardPsw,  //校验卡支付密码是否正确
    checkPosCardPsw = url.checkPosCardPsw,
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
        pswFlag: false,  //输入密码弹框flag
        discounGMoney: 0, //优惠金额
        detailsflag: false,
		dbClickFlag: true,  //防止双击出现两个支付窗户
    noprice: false,
    prefVoucherName:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideShareMenu();

        var that = this,
            opt = options;
            // prefCardName = '',
        //     prefVoucherName = '';

        orderNo = opt.orderNo;
        // favorInfo = opt.favorInfo; //从卖品页进入确认订单页时（或者没有选卡券），此值为undefined
        // bindType = opt.bindType; //从卖品页进入确认订单页（或者没有选卡券）时，此值为undefined
        // if (favorInfo) {
        //     favorInfo = JSON.parse(favorInfo);
        //     preCardCode = favorInfo.preCardCode;
        //     preVoucherCode = favorInfo.preVoucherCode;
        //     prefCardName = favorInfo.prefCardName;
        //     prefVoucherName = favorInfo.prefVoucherName;

        //     console.log(favorInfo);
        // } else {
        //     preCardCode = undefined;
        //     preVoucherCode = undefined;
        // }

        // if (!bindType) { //如果bindType的值是undefind
        //     bindType = '-1'
        // }
        // that.setData({
        //     bindType: bindType,
        //     perCardName: prefCardName,
        //     prefVoucherName: prefVoucherName
        // });


        cinemaCode = wx.getStorageSync('cinemaCode');
        member = wx.getStorageSync('member');
        memberCode = member.memberCode;
        movieCode = wx.getStorageSync('movieCode');
        token = member.token;
        CVersion = wx.getStorageSync('CVersion');
        OS = wx.getStorageSync('OS');
        
        // that.ajaxFn();
    },

    //ajax fn
    ajaxFn: function () {

        var the = this,
            data, //承载
            vocherNum, //券张数
            discounGMoney; //卖品用卡券优惠的金额

        goodsOrderConfirmPara = { 'cinemaCode': cinemaCode, 'memberCode': memberCode, 'orderId': orderNo, 'token': token, 'CVersion': CVersion, 'OS': OS, 'bindType': bindType, 'prefAccount': ''}; //获取卖品订单信息需要传的参数
        vocherInfoPara = { 'cinemaCode': cinemaCode, 'memberCode': memberCode, 'orderNo': orderNo, 'pageNo': 1, 'voucherType': -1, 'token': token, 'CVersion': CVersion, 'OS': OS}; //获取券列表需要传的参数

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
            success: function (res) {
                console.log(res);
                var data = res.data.resultData,
                    goodsTotalPrice = 0, //卖品总价
                    goodsListData = data.sellRecords; //卖品信息列表

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
                    data.resultPrice = (favorInfo.paymentAmount / 100); //优惠后，实付价
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
                    success: function (res) {
                        console.log(res);
                        var vocherData = res.data.resultData;
                        vocherNum = vocherData.vouherCount;
                        
                        the.setData({
                            vocherNum: vocherNum
                        });

                    },
                    fail:function(){},
                    complete:function(){}
                });
                
                // console.log(the.data.goodsMsg);
            },
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        wx.setNavigationBarTitle({
            title: '确认订单',
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that = this;

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

            console.log(favorInfo);

            that.setData({
                bindType: bindType,
                perCardName: prefCardName,
                prefVoucherName: prefVoucherName
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

        that.ajaxFn();
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

    //click to choose card
    chooseCard: function(e){
        var that = this;
        wx.navigateTo({
            url: 'chooseCard?orderNo=' + orderNo + '&preCardCode=' + preCardCode + '&orderType=4'
        });
    },

    //click to choose coupon
    chooseCoupon:function(e){
        var that  = this,
            targets = e.currentTarget.dataset,
            voucherNum = targets.vouchernum;

        wx.navigateTo({
            url: 'chooseCoupon?orderNo=' + orderNo + '&preVoucherCode=' + preVoucherCode + '&orderType=4'
        });
    },

    //click to pay
    confirmToPay: function (e) {
        var t = this,
            msg = t.data.msg,
            bindOrderPara = { 'cinemaCode': cinemaCode, 'memberCode': memberCode, 'companyCode': movieCode },
            ticketName;
            // skipFlag; //判断是否是0元对换券
		if (t.data.dbClickFlag){
            t.setData({
                dbClickFlag: false
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
        
		// if (t.dbClickFlag){
			// t.setData({
            //     dbClickFlag: false
            // }); 
        wx.request({
            url: bindOrderUrl,
            method: 'GET',
            data: bindOrderPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                var data = res.data;
                console.log(data);
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

                    var exchangeParams = { 'companyCode': movieCode, 'cinemaCode': cinemaCode, 'memberCode': memberCode, 'token': token, 'CVersion': CVersion, 'OS': OS, 'orderNo': orderNo, 'payType': '7' };

                    if (bindType == '1') {
                        ticketName = t.data.prefVoucherName;
                    }
                    if (skipFlag == '1' && bindType == '1') { // 此时选的是0元对换券，直接
                        wx.showModal({
                            title: '提示',
                            content: '确认使用' + ticketName + '完成支付？',
                            success: function (res) {
                                if (res.confirm) { //console.log('用户点击确定')
                                    wx.request({ //调0元对换券支付接口
                                        url: payExchange,
                                        method: 'GET',
                                        data: exchangeParams,
                                        header: {
                                            'Content-Type': 'text/plain',
                                            'Accept': 'application/json'
                                        },
                                        success: function (res) {
                                            if (res.data.resultCode == 0) {
                                                wx.showToast({
                                                    title: '支付成功',
                                                    icon: 'success',
                                                    duration: 2000
                                                });
                                                t.paySuccess();
                                            } else {
                                                wx.showModal({
                                                    title: '提示',
                                                    content: res.data.resultDesc,
                                                    success: function (res) {
                                                        if (res.confirm) {
                                                            console.log('用户点击确定')
                                                        } else if (res.cancel) {
                                                            console.log('用户点击取消')
                                                        }
                                                    }
                                                })

                                                t.ajaxFn();
                                            }
                                        },
                                        fail: function () {
                                            t.ajaxFn();
                                        },
                                        complete: function () { }
                                    });
                                } else if (res.cancel) {//console.log('用户点击取消')
                                    t.setData({
                                        dbClickFlag: true
                                    });
                                    t.ajaxFn();
                                }
                            }
                        });
                    } else {
                        //调起微信支付
                        var params = { 'cinemaCode': cinemaCode, 'memberCode': memberCode, 'companyCode': movieCode };
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
                        } else {//如果选的不是储值卡或者pos卡，则直接支付
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
                                success: function (res) {
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
                                            'success': function (res) { //支付成功回调
                                                // console.log(res);
                                                t.paySuccess();
                                            },
                                            'fail': function (res) {  //支付失败
                                                t.setData({
                                                    dbClickFlag: true
                                                });
                                                t.ajaxFn();
                                            },
                                            'complete': function (res) { //支付完成
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

                                        setTimeout(function () {
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
            fail: function () {},
            complete: function () {
                // t.setData({
                //     dbClickFlag: true
                // }); 
            }
        });
		// }
			
    },

    //取消订单Fn
    cancleOrderFn: function (e) {
        var that = this;
        wx.showModal({
            title: '提示',
            content: '是否取消订单',
            showCancel: true,
            cancelText: '取消订单',
            confirmText: '继续支付',
            success: function (res) {
                if (res.confirm) {
                    that.confirmToPay(e);
                } else if (res.cancel) {
                    // var that = this;
                    var canclePara = { 'memberCode': memberCode, 'cinemaCode': cinemaCode, 'orderNo': orderNo }
                    wx.request({
                        url: cancelOrderUrl,
                        method: 'GET',
                        data: canclePara,
                        header: {
                            'Content-Type': 'text/plain',
                            'Accept': 'application/json'
                        },
                        success: function (res) {
                            if (res.data.resultCode == 1) {
                                wx.showToast({
                                    title: res.data.resultDesc,
                                });
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
    accountDetails: function(e){
        var that = this,
            animation = wx.createAnimation({
                //动画持续时间
                duration: 500,
                //定义动画效果，当前是匀速
                timingFunction: 'ease',
                delay: 0,   //动画延迟时间，单位 ms
                transformOrigin: "50% 100% 0"
            });
        // 将该变量赋值给当前动画
        that.animation = animation;
        animation.translateY(380).step();

        that.setData({
            animationData: animation.export(),
            detailsflag: true
        });

        setTimeout(function () {
            animation.translateY(0).step();
            that.setData({
                animationData: animation.export()
            });
        }.bind(this), 200);
    },

    //hide the detail window
    hideDetails:function(){
        var that = this,
            animation1 = wx.createAnimation({
                //动画持续时间
                duration: 500,
                //定义动画效果，当前是匀速
                timingFunction: 'ease',
                delay: 0,   //动画延迟时间，单位 ms
                transformOrigin: "50% 100% 0"
            });

        that.animation = animation1;
        animation1.translateY(380).step();

        that.setData({
            animationData: animation1.export()
        });

        setTimeout(function () {
            animation1.translateY(0).step();
            that.setData({
                animationData: animation1.export(),
                detailsflag: false
            });
        }.bind(this), 300);
    },

    //支付成功之后
    paySuccess: function (e) {
        var that = this;
        
        wx.request({
            url: goodsOrdeUrl,
            method: 'GET',
            data: goodsOrderConfirmPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                console.log(res);
                var data = res.data,
                    url = '',
                    movieCode = wx.getStorageSync('movieCode'),
                    failFlag = true;
                if (data.resultCode == 0) {
                    if (data.resultData.orderState == '1001') { //支付成功
                        url = '../payResult/paySuc?orderNo=' + orderNo + '&companyCode=' + movieCode + '&sellCode=goods';
                    } else if (data.resultData.orderState == '1002') { //出货失败
                        url = '../payResult/payFail?orderNo=' + orderNo + '&companyCode=' + movieCode + '&failFlag=' + failFlag + '&sellCode=goods';
                    } else if (data.resultData.orderState == '1007' || data.resultData.orderState == '1000') { //出货中
                        failFlag = false;
                        url = '../payResult/checking?orderNo=' + orderNo + '&companyCode=' + movieCode + '&failFlag=' + failFlag + '&sellCode=goods';
                    }
                    wx.redirectTo({
                        url: url,
                    });
				} 
            },
            fail:function(){},
            complete:function(){}
        })
    },

    //pop window confirm fn
    confirm: function () {
        var thus = this,
            url = path + "";

        thus.setData({
            hideWin: true
        });

        if(thus.data.theFlag){
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
                success: function (res) {
                    wx.redirectTo({
                        url: '../login/login',
                    });
                }
            });
        }
        
    },

    confirm1: function () {
        var that = this,
            url = '../home/index';
        
        wx.redirectTo({
            url: url,
        });

    },

    //输入支付密码，点击确认按钮
    setPswFn: function (e) {
        var _this = this,
            formData = e.detail.value,
            psw = formData.setnewPsw,
            reg = /^\d{6}$/,
            payPosParams = { 'companyCode': movieCode, 'cinemaCode': cinemaCode, 'memberCode': memberCode, 'token': token, 'CVersion': CVersion, 'OS': OS, 'password': '', };
        if (psw == '') {
            wx.showToast({
                title: '请输入密码',
            });
            return false;
        }
        if (precardType=='11') {
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
            success: function (res) {
                _this.checkWalletPswBack(res);
            },
            fail: function () { },
            complete: function () { }
        });

    },

    //校验卡密码
    checkWalletPswBack: function (res) {
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
            var payBackParams = { 'companyCode': movieCode, 'cinemaCode': cinemaCode, 'memberCode': memberCode, 'token': token, 'CVersion': CVersion, 'OS': OS, 'orderNo': orderNo, 'orderType': '4', 'payType': '' };

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
                success: function (res) {
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
                fail: function () { },
                complete: function () { }
            })

            that.setData({
                pswFlag: false,
                dbClickFlag: true
            });
        }

        

    },

    //关闭输入密码弹框
    hideDetailsFn: function () {
        var that = this;

        that.setData({
            pswFlag: false,
            dbClickFlag: true
        });

        that.ajaxFn();
    }

})