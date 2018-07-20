// pages/goodsList/goodsList.js
var url = require('../../utils/url.js'),
    URL = url.goodsList,
    addUrl = url.addGoods,
    cancelUrl = url.cancelOrder,
    member,
    cinemaCode, 
    movieCode, 
    token, //token 串,缓存的member对象里面有
    CVersion, //版本编号，缓存里有
    OS, //Android or IOS，缓存里也有
    goodslistPara,
    cancelOrderPara = {};

Page({
    /**
     * 页面的初始数据
     */
    data: {
        winFlag: true, //详情页弹出flag值
        goodsInfo: [], //所选卖品的信息列表
        totalSum: 0, //所选卖品的总金额 
        nSum: 0,  // 所选卖品的总数
        hidden: false,  //用于页面头部overflow的样式值
        listLength: 0,
        // nocancel: true, //取消订单弹框用
        // hideWin: true //本意是要为返回设置取消订单弹框用，目前看来，暂时没用
        toastItem: {
            text: 'sucess!',
            toast_visible: !1
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //关闭转发按钮
        wx.hideShareMenu();
        var that = this,
            opt = options,
            showCode = opt.showCode, //
            orderNo = opt.orderNo; //订单号

        member = wx.getStorageSync('member')
        cinemaCode = wx.getStorageSync('cinemaCode');
        movieCode = wx.getStorageSync('movieCode');
        CVersion = wx.getStorageSync('CVersion');
        OS = wx.getStorageSync('OS');
        
        token = member.token;

        // cinemaCode = '23112131';
        var memberCode = member.memberCode,
        // var memberCode = '00a949966f6a4b8596e312d118e0436f',
            addGoodsPara = {
                'orderNo': orderNo,
                'showCode': showCode,
                'cinemaCode': cinemaCode,
                'memberCode': memberCode,
                'version': '2.6'
            };

        goodslistPara = { 'companyCode': movieCode, 'cinemaCode': cinemaCode, 'memberCode': memberCode, 'token': token, 'CVersion': CVersion, 'OS': OS,  'type': 1, 'orderNo': orderNo};
        that.setData({
            addGoodsPara: addGoodsPara
        });

        cancelOrderPara.cinemaCode = cinemaCode;
        cancelOrderPara.memberCode = memberCode;
        cancelOrderPara.orderNo = orderNo;

        that.ajaxFn();
    },

    //ajax function
    ajaxFn: function () {
        var that = this;
        wx.request({
            url: URL,
            method: 'GET',
            data: goodslistPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                var data = res.data.resultData,
                    resultCode = res.data.resultCode,
                    dataLen = 0;

                if (data != undefined && data != ''){
                    dataLen = data.length;
                }

                    console.log(data);
                    that.setData({
                        listLength: dataLen
                    });

                if (data != undefined && data.length > 0)
                    for (var i = 0; i < data.length; i++) {
                        data[i].goodsPrice = data[i].goodsPrice / 100;
                        data[i].price = data[i].price / 100;
                        data[i].num = 0;
                    }

                if (resultCode == 0) {
                    // console.log(data);
                    that.setData({
                        goods: data
                    });
                }
            },
            complete: function () {
            }
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
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
        // var pages = getCurrentPages();
        // var prevPage = pages[pages.length - 2];
        // prevPage.onLoad()
        // this.cancelOrder();
        // wx.showToast({
        //     title: '返回会取消当前订单，返回到首页！',
        // });
        // this.setData({
        //     hideWin: false
        // });
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        // this.setData({
        //     goods: []
        // });
        this.ajaxFn();
        wx.stopPullDownRefresh();
    },

    //把卖品放进购物车
    putInCart: function (e) {
        var that = this,
            target = e.currentTarget.dataset,
            // index = target.index,
            // info = target.info,
            curGoodsCode = target.goodscode,
            goodsList = that.data.goods, 
            goodsInfo = that.data.goodsInfo,
            totalSum = Number(that.data.totalSum),
            nSum = that.data.nSum,
            curGood;
            // curGood = goodsList[index],
        for (var m = 0; m < goodsList.length; m++){
            if (goodsList[m].goodsCode == curGoodsCode){
                curGood = goodsList[m];
            }
        }
        // console.log(curGood);
        (curGood.num)++;
        // console.log(curGood.num);

        if (goodsInfo != undefined && goodsInfo.length > 0) {
            var flag = false, m = 0;
            for (var i = 0; i < goodsInfo.length; i++) {
                if (goodsInfo[i].goodsCode == curGood.goodsCode){
                    flag = true;
                    m = i;
                    totalSum += Number(curGood.goodsPrice);
                    nSum += 1;
                    // console.log(m);
                }
            }
            if(flag){
                goodsInfo[m].amount = curGood.num;
                goodsInfo[m].goodSum += curGood.goodsPrice;
            } else {
                var good = {};
                good.goodsName = curGood.goodsName;
                good.goodsPrice = curGood.goodsPrice;
                good.goodSum = curGood.goodsPrice * curGood.num;
                good.goodsCode = curGood.goodsCode;
                good.amount = curGood.num;

                totalSum += Number(good.amount*good.goodsPrice);
                nSum += good.amount;
            }
        } else {
            var good = {};
            good.goodsName = curGood.goodsName;
            good.goodsPrice = curGood.goodsPrice;
            good.goodSum = curGood.goodsPrice * curGood.num;
            good.goodsCode = curGood.goodsCode;
            good.amount = curGood.num;

            totalSum += Number(good.amount * good.goodsPrice);
            nSum += good.amount;
        }
        
        if(good){
            goodsInfo.push(good);
        }
        that.setData({
            goods: goodsList,
            goodsInfo: goodsInfo,
            totalSum: Number(totalSum).toFixed(2),
            nSum: nSum
        });
        // console.log(goodsInfo);
    },

    //减少购物车中卖品数量
    cutGoodFn: function (e) {
        var that = this,
            target = e.currentTarget.dataset,
            curGoodsCode = target.goodscode,
            goodsInfo = that.data.goodsInfo,
            totalSum = Number(that.data.totalSum),
            nSum = that.data.nSum,
            goodsList = that.data.goods;
        
        for (var i = 0; i < goodsInfo.length; i++){
            if (goodsInfo[i].goodsCode == curGoodsCode){
                var amount = goodsInfo[i].amount;
                amount--; //当前卖品数量减一
                nSum--; //卖品总数减一

                goodsInfo[i].amount = amount < 0 ? 0 : amount;
                goodsInfo[i].goodSum -= goodsInfo[i].goodsPrice; //当前卖品总金额减单价
                totalSum -= Number(goodsInfo[i].goodsPrice); //所有卖品总数减单价
            }
        }

        for (var k = 0; k < goodsList.length; k++) {
            if (goodsList[k].goodsCode == curGoodsCode) {
                goodsList[k].num--;
            }
        }

        if (nSum <= 0) {
            var winFlag = that.data.winFlag;
            winFlag = true;
        }
        that.setData({
            goods: goodsList,
            goodsInfo: goodsInfo,
            totalSum: Number(totalSum).toFixed(2),
            nSum: nSum,
            winFlag: winFlag
        });
        // console.log(goodsInfo);
    },

    //点击展开购物车
    showShopList: function () {
        var that = this,
            nSum = that.data.nSum;
        
        if (nSum > 0) {
            that.setData({
                winFlag: false,
                hidden: true
            });
        }       
    },

    //empty Cart
    delGoodInfo: function () {
        var that = this,
            goods = that.data.goods;

        for (var i = 0, len = goods.length; i < len; i++) {
            goods[i].num = 0;
        }
        
        that.setData({
            goodsInfo: [],
            nSum: 0,
            totalSum: 0,
            goods: goods
        });
        that.closeWin();
    },

    //close the window
    closeWin: function () {
        var that = this;
        that.setData({
            winFlag: true,
            hidden: false
        });
    },

    //the next step
    nextFn: function () {
        var the = this,
            addGoodsPara = the.data.addGoodsPara,
            goodsInfo = the.data.goodsInfo,
            para_goods = []; //用来传参

        if (goodsInfo.length > 0) {
            for (var k = 0; k < goodsInfo.length; k++) {
                if (goodsInfo[k].amount > 0){
                    var good = { 'amount': '', 'goodsCode': '' };
                    good.amount = goodsInfo[k].amount + '';
                    good.goodsCode = goodsInfo[k].goodsCode;

                    para_goods.push(good);
                }

            }
        }  

        addGoodsPara.goodsInfo = JSON.stringify(para_goods);
        // console.log(addGoodsPara);
        
        wx.request({
            url: addUrl,
            method: 'GET',
            data: addGoodsPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                var data = res.data;
                if (data.resultCode == 1) {
                    the.setData({
                        toastItem: {
                            text: data.resultDesc,
                            toast_visible: !0
                        }
                    });

                    setTimeout(function () {
                        the.setData({
                            toastItem: {
                                toast_visible: !1
                            }
                        });
                    }, 2000);

                    return false;
                } 
                var url = "../confirmOrder/confirmOrder?orderNo=" + addGoodsPara.orderNo;
                wx.redirectTo({
                    url: url,
                });
            }
        });
    },

    cancelOrder: function () {
        var that = this;
        that.setData({
            toastItem: {
                text: '订单已取消',
                toast_visible: !0
            }
        });

        setTimeout(function () {
            that.setData({
                toastItem: {
                    toast_visible: !1
                }
            });
        }, 2000);

        var that = this;

        wx.request({
            url: cancelUrl, 
            method: 'GET',
            data: addGoodsPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                var data = res.data;
                if (data.resultCode == "1") {
                    that.setData({
                        toastItem: {
                            text: data.resultDesc,
                            toast_visible: !0
                        }
                    });

                    setTimeout(function () {
                        that.setData({
                            toastItem: {
                                toast_visible: !1
                            }
                        });
                    }, 2000);
                    return false;
                } else {
                    wx.removeStorageSync('goodsInfo');
                    var url = '../index/home';
                    wx.redirectTo({
                        url: url
                    });
                }
            },
            fail: function () {},
            complete: function () {}
        });
    },

    goToPay: function () {

    }

});