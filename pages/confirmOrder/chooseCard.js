// pages/confirmOrder/chooseCard.js
var url = require('../../utils/url.js'),
    getCardListUrl = url.getCardList,//获取卡列表接口
    selCardUrl = url.selCard, //从影票确认订单进来，点击选用卡，预支付接口
    goodsOrderSelCard = url.goodsOrderSelCard, //从独立卖品确认订单进来，点击选用卡，预支付接口
    cardPsw = url.cardPsw, // 查看是否设置卡密码
    setCardPsw = url.setCardPsw,  //设置卡支付密码
    getCardLIstPara, //获取卡列表参数
    selCardPara,  // 点击选用卡参数    
    cardPswPara, //查询，设置卡密码传参
    setCardPswPara, //设置卡密码传参
    orderNo, //从确认订单页面进来的时候带进来的参数
    orderType, //从确认订单页面进来的时候带进来的参数，用来判断此订单是卖品订单(orderType:4)还是影票订单(orderType:0)
    selCardCode;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cardDetailFlag: false,
        pswFlag: false,
        pageNo: 1,
        cardlist: [],
        hasNext: true,
        preCardCode: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var self = this,
            movieCode = wx.getStorageSync('movieCode'),
            cinemaCode = wx.getStorageSync('cinemaCode'),
            member = wx.getStorageSync('member'),
            token = member.token,
            CVersion = wx.getStorageSync('CVersion'),
            OS = wx.getStorageSync('OS'),
            preCardCode = options.preCardCode;

            console.log(options);
    
        orderNo = options.orderNo;
        orderType = options.orderType;
        
        self.setData({
          preCardCode: preCardCode
        })
        getCardLIstPara = { 'companyCode': movieCode, 'cinemaCode': cinemaCode, 'memberCode': member.memberCode, 'orderNo': orderNo, 'pageNo': self.data.pageNo};
        selCardPara = { 'memberCode': member.memberCode, 'cinemaCode': cinemaCode, 'companyCode': movieCode, 'token': token, 'CVersion': CVersion, 'OS': OS, 'orderNo': orderNo, 'prefAccount': '', 'bindType': 0};

        cardPswPara = { 'memberCode': member.memberCode, 'cinemaCode': cinemaCode, 'companyCode': movieCode, 'token': token, 'CVersion': CVersion, 'OS': OS };
        setCardPswPara = { 'memberCode': member.memberCode, 'cinemaCode': cinemaCode, 'newPassword': '','type': 0 };

        // console.log(getCardLIstPara);

        //查看用户是否设置了支付密码
        self.payPswFn();
        //卡列表
        self.ajaxFn();

        
    },
    //渲染卡列表
    ajaxFn: function(){
      var self = this,
          preCardCode = self.data.preCardCode,
          pageNo = self.data.pageNo;
          getCardLIstPara.pageNo = pageNo;

      wx.request({
        url: getCardListUrl,
        method: 'GET',
        data: getCardLIstPara,
        header: {
          'Content-Type': 'text/plain',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log(res);
          //debugger;
          var cardInfoData = res.data.resultData,
            list = [],
            hasNext = cardInfoData.hasNext,
            cardLen = cardInfoData.orders.length;
          // balancePwd = cardInfoData.balancePwd;
          if (cardLen == 0) {
            hasNext = false;
            cardLen = 0;
          }

          for (var j = 0; j<cardInfoData.orders.length;  j++) {
            if (preCardCode == cardInfoData.orders[j].cardCode) {
              cardInfoData.orders[j].sub = 1; //sub值为1时，表示，进入卡列表时，此卡是被上次选择中的状态
            } else {
              cardInfoData.orders[j].sub = 0; //sub值为9时，表示进入卡列表时，此卡未被选中
            }
            if (cardInfoData.orders[j].limitTime == '' || cardInfoData.orders[j].limitTime == undefined) {
              cardInfoData.orders[j].limitTime = '永久有效';
            }
            cardInfoData.orders[j].thePrice = cardInfoData.orders[j].cardComments.substr(6).replace("元", ""); //卡面值
            if (cardInfoData.orders[j].cardType == '10' || cardInfoData.orders[j].cardType == '11') {
              list.push(cardInfoData.orders[j]);

            } else {
              if (cardInfoData.orders[j].expire == '0') {
                list.push(cardInfoData.orders[j]);
              }
            }
          }
        if(pageNo == 1){
          self.setData({
            cardlist: list,
            hasNext: hasNext,
            cardLen: cardLen
          });
        }
        if(pageNo >1){
          var list1 = self.data.cardlist;
          for (var i = 0; i < cardInfoData.orders.length;i++){
            list1.push(cardInfoData.orders[i]);
          }
          self.setData({
            cardlist: list1,
            hasNext: hasNext
          });
        }
          
        }
      });
    },
    //滚动到底部时触发此函数
    onReachBottom: function (e) {
     // debugger;
      var that = this;
      var pageNo = that.data.pageNo;
      if (that.data.hasNext) {
        pageNo++;
        that.setData({
          pageNo: pageNo
        });
        that.ajaxFn();
      }
    },
    //查看是否设置会员卡支付密码
    payPswFn:function(){
        var that = this;
        wx.request({
            url: cardPsw,
            method: 'GET',
            data: cardPswPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                var data = res.data,
                    resultData = data.resultData,
                    balancePwd = resultData.balancePwd, //支付密码
                    memberBalance = resultData.memberBalance,  //余额
                    memberCredit = resultData.memberCredit;  //积分

                if (data.resultCode == 0 && balancePwd == 1){
                    that.setData({
                        pswFlag: true
                    });
                }
            },
            fail:function(){},
            complete:function(){}
        });
    },

     /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        wx.setNavigationBarTitle({
            title: '会员卡',
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
		// dbClickFlag = true
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

    /*
    **弹框相关函数
    ** @cType: string,'card':会员卡；‘sell’:卖品
    ** @showflag: boolean, true:打开详情，false:关闭
    */
    DetailsFn: function (showflag) {
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
            that.setData({
                cardDetailFlag: true,
            });
        }

        setTimeout(function () {
            animation.translateY(0).step();
            that.setData({
                animationData: animation.export(),
                // detailsflag: false
            });

            if (!showflag) {
                that.setData({
                    cardDetailFlag: false,
                });
            }

        }.bind(this), 300);
    },

    //卡详情
    cardDetailsFn: function (e) {
        var self = this,
            target = e.currentTarget.dataset,
            cardIndex = target.index,
            cardList = self.data.cardlist;       

        self.setData({
            popInfo: cardList[cardIndex]
        });

        self.DetailsFn(true);
    },

    //收起弹窗
    hideDetailsFn: function () {
        var that = this,
            pageData = this.data,
            cardDetailFlag = pageData.cardDetailFlag,
            pswFlag = pageData.pswFlag;

        if (cardDetailFlag){
            that.DetailsFn(false);
        }
        
        if (pswFlag) {
            that.setData({
                pswFlag: false
            });
        }
    },

    //设置支付密码：
    setPswFn:function(e){
        var _this = this,
            formData = e.detail.value,
            newpsw = formData.setnewPsw,
            reg =/^\d{6}$/;

        setCardPswPara.newPassword = newpsw;
        if (newpsw == ''){
            wx.showToast({
                title: '请输入密码',
            });
            return false;
        } else if (newpsw.length > 6) {
            wx.showToast({
                title: '密码应为6位',
            });
            return false;
        }else if (!reg.test(newpsw)) {
            wx.showToast({
                title: '密码为6位数字',
            });
        }
        else{
          wx.request({
            url: setCardPsw,
            method: 'GET',
            data: setCardPswPara,
            header: {
              'Content-Type': 'text/plain',
              'Accept': 'application/json'
            },
            success: function (res) {
              // console.log(res)
              var data = res.data;
              if (data.resultCode == 0) {
                wx.showToast({
                  title: '设置成功！'
                });

                _this.setData({
                  pswFlag: false
                });
              }
            },
            fail: function () { },
            complete: function () { }
          });
        }
        
    },

    //点击选择卡,预支付
    selectCardFn:function(e){
        var _this = this,
            targets = e.currentTarget.dataset,
            prefAccount = targets.cardcode,
            cardType = targets.cardtype,
            prefCardName = targets.cardname,
            prePaidUrl = '';

        if(orderType == '4') {
            prePaidUrl = goodsOrderSelCard;
        } else {
            prePaidUrl = selCardUrl;
        }

        selCardPara.prefAccount = prefAccount;
        selCardPara.cardType = cardType;
        
        wx.request({
            url: prePaidUrl,
            method: 'GET',
            data: selCardPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            
            success: function (res){
                var resultCode = res.data.resultCode,
                    favorInfo = res.data.resultData;
                if (resultCode == 0 ){
                    favorInfo.preCardCode = _this.data.preCardCode;
                    favorInfo.prefCardName = prefCardName;
                    favorInfo.cardType = cardType;

                    console.log(favorInfo);

                    favorInfo = JSON.stringify(favorInfo);

                    wx.setStorageSync('favorInfo', favorInfo);
                    wx.setStorageSync('bindType', 0);

                    // wx.redirectTo({
                    //     url: 'confirmOrder?orderNo=' + orderNo  //  + '&favorInfo=' + favorInfo + '&bindType=0' 
                    // });
                    wx.navigateBack({
                        delta: 1
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.data.resultDesc,
                        success:function(res){
                            if(res.confirm){} //用户点击了确定
                            if(res.cancel){}  //用户点击了取消                 
                        }
                    });
                }
            },
            fail: function(res){},
            complete:function(res){}
        });
    },

    //不使用会员卡
    noCardFn:function(){
         wx.setStorageSync('favorInfo', );
         wx.setStorageSync('bindType', -1);
        wx.navigateBack({
            delta: 1
        });
    },

    //立即购卡
    bayCardLink:function(){
        var storeUrl = '../store/index';
        wx.switchTab({
            url: storeUrl
        })
    }
})