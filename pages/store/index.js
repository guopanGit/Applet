import {
  $showToast
} from '../../utils/packaging.js';

var url = require('../../utils/url.js'),
  fn = require('../../utils/util.js'),
  getStoreCardListUrl = url.storeCardList, //接口：获取商城卡列表信息
  storeGoodsTypeListUrl = url.storeGoodsTypeList, //接口：获取商城卖品类别
  storeGoodsListUrl = url.storeGoodsList, //接口：获取商城卖品列表信息
  byeCardUrl = url.byeCard, //接口：生成购卡订单
  creatSellsOrder = url.creatSellsOrder, //接口：创建卖品订单
  initPay = url.initPay, //初始化支付
  modifyTrolleyUrl = url.modifyTrolleyVal, //接口： 修改购物车里卖品信息
  trolleyInfoUrl = url.trolleyList, //接口：获取购物车里卖品信息
  emptyTrolleyUrl = url.emptyTrolley, //接口：清空购物车
  getHallInfoByTakeout = url.getHallInfoByTakeout, // 是否可配送
  movieCode,
  member,
  cinemaCode,
  memberCode,
  userPhone,
  dbClickFlag = true, //点击购卡防止重复点击
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
    buttonClicked: false,
    checkflag: true,
    dbClickFlag: true, //点击购卡防止重复点击
    toastItem: {
      text: 'sucess!',
      toast_visible: !1
    },
    cinemaName: '',
    hallCode: '',
    isTakeout: '0',
    classifys: Array,
    isshow: false,
    catHighLightIndex: 0,
    trolleyDetails: Array,
    id: '-1',
    flag: true,
    trolleyTotalNum: 0,
    winFlag: true,
    trolleyId: ''
    // cardNum: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let _this = this;
    let cinemaCode = wx.getStorageSync('cinemaCode');
    let cinemaName = wx.getStorageSync('cinemaName');
    let companyCode = wx.getStorageSync('companyCode');
    let hallCode = wx.getStorageSync('hallCode');
    let movie = wx.getStorageSync('movie');
    let row = wx.getStorageSync('row');
    let seat = wx.getStorageSync('seat');

    if (cinemaCode == undefined) {
      cinemaCode = ''
    }
    if (cinemaName == undefined) {
      cinemaName = ''
    }
    if (companyCode == undefined) {
      companyCode = ''
    }
    var page = options.page;
    if (page == 0) {
      page = 0;
    } else {
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
    // if (_this.data.page == 1) {
    //   _this.getGoodsListFn()
    //   wx.setNavigationBarTitle({
    //     title: '卖品'
    //   });
    // } else if (_this.data.page == 0) {
    //   wx.setNavigationBarTitle({
    //     title: '会员卡'
    //   });
    // }

    var token = options.token,
      CVersion = options.CVersion,
      OS = options.OS;
    if (hallCode == undefined) {
      hallCode = '';
      wx.setStorageSync('hallCode', hallCode)
    }
    if (movie == undefined) {
      movie = '请选择座位信息';
      wx.setStorageSync('movie', movie)
    }
    goodsListPara = {
      'companyCode': companyCode,
      'cinemaCode': cinemaCode,
      'memberCode': memberCode,
      'type': 2,
      'presetId': -1,
      'pageSize': '200',
      'currentPageNumber': '1',
      'token': token,
      'CVersion': CVersion,
      'OS': OS
    };
    // console.log(goodsListPara)
    _this.setData({
      cinemaName,
      hallCode
    });
    _this.storeGoodsTypeList();
    _this.distribution();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
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
    wx.getSystemInfo({ //  获取页面的有关信息
      success: function(res) {
        const height = 92
        var windowHeight = (res.windowHeight * (750 / res.windowWidth) - 192);

        _this.setData({
          height: windowHeight
        })
      }
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(options) {
    let scenc = wx.getStorageSync('scenc');
    if (scenc == 1011) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
    }
    var _this = this,
      cinemaname = wx.getStorageSync('cinemaName');
    if (cinemaname.length > 6) {
      cinemaname = cinemaname.slice(0, 6)
    }
    if (!cinemaCode) {
      cinemaCode = wx.getStorageSync("cinemaCode");
    }

    movieCode = wx.getStorageSync('movieCode'); //companyCode
    cinemaCode = wx.getStorageSync('cinemaCode');
    member = wx.getStorageSync('member');
    memberCode = member.memberCode;
    userPhone = member.memberPhone;
    token = member.token;
    CVersion = wx.getStorageSync('CVersion');
    OS = wx.getStorageSync('OS');

    setTimeout(() => {
      if (scenc != 1011 || _this.data.isTakeout == 0) {
        // console.log('1001')
        let movie = '请选择座位信息';
        let row = '';
        let seat = '';
        wx.setStorageSync('movie', movie);
        wx.setStorageSync('row', row);
        wx.setStorageSync('seat', seat)
      }
      wx.hideLoading();
    }, 2500)
    // console.log(member)
    if (member == '' || member == undefined || member == null) {
      memberCode = '';
    }
    // console.log(movieCode, cinemaCode)
    cardListPara = {
      'companyCode': movieCode,
      'memberCode': memberCode,
      'cinemaCode': cinemaCode,
      'token': token,
      'CVersion': CVersion,
      'OS': OS
    };

    let goodsListPara = {
      'companyCode': movieCode,
      'cinemaCode': cinemaCode,
      'memberCode': memberCode,
      'type': 2,
      'presetId': -1,
      'pageSize': '200',
      'currentPageNumber': '1',
      'token': token,
      'CVersion': CVersion,
      'OS': OS
    }
    _this.setData({
      cinemaName: cinemaname,
    });
    if (_this.data.page == 1) {
      _this.getGoodsListFn();
      _this.storeGoodsTypeList();
    } else if (_this.data.page == 0) {
      _this.getCardListFn();
    }
    if (scenc == 1011) {
      setTimeout(function() {
        let isTakeout = _this.data.isTakeout;
        if (isTakeout == '0') {
          wx.showModal({
            title: '',
            content: '前台小姐姐太忙啦，暂时无法为您送餐。请您下单后移步前台取餐',
            showCancel: false,
            confirmText: '我知道了',
            confirmColor: '#f35643'
          });
        }
      }, 2000)

    }
  },

  /*
   *生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.setData({
      catHighLightIndex: 0,
      id: '-1',
      isTakeout: 1
    })
    wx.setStorageSync('scenc', '1001');
  },

  //获取卡列表
  getCardListFn: function(e) {
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
      success: function(res) {
        // console.log(res);
        cardData = res.data.resultData;
        cardNum = cardData.length;
        for (var i = 0; i < cardData.length; i++) {
          cardData[i].cardPrice = cardData[i].cardPrice / 100;
          cardData[i].cardFee = cardData[i].cardFee / 100;
          cardData[i].value = cardData[i].cardPrice - cardData[i].cardFee;
        }
        _this.setData({
          cardNum: cardNum,
          cardList: cardData
        });
      },
      fail: function(res) {},
      complete: function(res) {}
    });
  },

  //获取商品列表
  getGoodsListFn() {
    wx.showLoading({
      title: '',
      mask: true
    })
    var that = this,
      goodsData,
      goodsNum;

    wx.request({
      url: storeGoodsListUrl,
      method: 'POST',
      data: goodsListPara,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        'Accept': 'application/json'
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.resultData.productList.length == 0) {
          that.setData({
            isshow: false
          });
        } else {
          that.setData({
            isshow: true
          });
        }
        let resData = res.data;
        if (resData != '' && resData != undefined && resData != null) {
          goodsData = resData.resultData.productList;
          goodsNum = goodsData.length;
        } else {
          goodsData = [];
          goodsNum = 0;
        }
        // console.log(resData)
        for (var j = 0; j < goodsNum; j++) {
          goodsData[j].selNum = 0; //当前卖品，用户已选入购物车的的数量
          // console.log(goodsData[j].goodsImgNew)
          goodsData[j].goodsImgNew = goodsData[j].goodsImgNew + "?x-oss-process=image/resize,m_fill,h_160,w_160,limit_0";
          goodsData[j].goodsPrice = goodsData[j].goodsPrice / 100;
          goodsData[j].price = goodsData[j].price / 100;
          if (goodsData[j].sellEventPrice) {
            goodsData[j].sellEventPrice = goodsData[j].sellEventPrice / 100;
          } else {
            goodsData[j].sellEventPrice = 0;
          }
          that.setData({
            goodsNum: goodsNum,
            goodsList: resData.resultData.productList
          });
        }
        that.getTrolleyList(goodsData, ''); //第二个参数是回调函数
      },
      fail: (res) => {
        wx.hideLoading();
      }
    });
  },

  /*
   **弹框相关函数
   ** @cType: string,'card':会员卡；‘sell’:卖品
   ** @showflag: boolean, true:打开详情，false:关闭
   */
  DetailsFn: function(cType, showflag) {
    var that = this,
      animation = wx.createAnimation({
        //动画持续时间
        duration: 500,
        //定义动画效果，当前是匀速
        timingFunction: 'ease',
        delay: 0, //动画延迟时间，单位 ms
        transformOrigin: "50% 100% 0"
      }),
      cardflag,
      sellflag;
    that.animation = animation;
    animation.translateY(380).step();
    that.setData({
      animationData: animation.export(),
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
    setTimeout(function() {
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
  byCardFn: function(e) {
    //  debugger;
    var self = this,
      target = e.currentTarget.dataset,
      cardIndex = target.index,
      cardList = self.data.cardList;

    if ((userPhone == undefined || userPhone == '' || userPhone == null) || (memberCode == undefined || memberCode == '' || memberCode == null)) {
      wx.navigateTo({
        url: '../getUserInfo/login'
      });
      return false;
    }

    self.setData({
      popInfo: cardList[cardIndex]
    });

    self.DetailsFn('card', true);
  },

  //在卡详情弹框里,  点击立即购卡
  byeCardAtOnce: function(e) {
    // // console.log(e)
    var self = this,
      checkflag = self.data.checkflag,
      targets = e.currentTarget.dataset,
      cardCode = targets.cardcode,
      applyId = targets.applyid,
      promotionId = targets.promotionid;

    byeCardPara = {
      'companyCode': movieCode,
      'memberCode': memberCode,
      'cinemaCode': cinemaCode,
      'cardCode': cardCode,
      'applyId': applyId,
      'promotionId': promotionId,
      'channel': "5",
      'token': token,
      'CVersion': CVersion,
      'OS': OS
    };

    if (!checkflag) {
			$showToast('请同意购卡协议')
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
        success: function(res) {
          // console.log(res)
          var resultCode = res.data.resultCode;
          // // console.log(res.data);
          if (resultCode == '2202') {
            self.DetailsFn('card', true);
            wx.navigateTo({
              url: '../Binding/binding',
            });
            return false
          }
          if (resultCode == 0) {
            cardOrderInfo = res.data.resultData;
            self.initPayFn(cardOrderInfo);
          }
        },
        fail: function(res) {},
        complete: function(res) {}
      });
    }
  },

  //initpay，卖品支付与商品支付都可以用
  initPayFn: function(orderInfo) {
    var t = this,
      params = {
        'cinemaCode': cinemaCode,
        'memberCode': memberCode
      };
    // console.log(orderInfo)
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
      success: function(res) {
        var data = res.data,
          error = data.resultDesc;
        if (data.resultCode == 0) {
          // 微信支付
          wx.requestPayment({
            'timeStamp': data.resultData.timeStamp,
            'nonceStr': data.resultData.nonceStr,
            'package': data.resultData.package,
            'signType': data.resultData.signType,
            'paySign': data.resultData.paySign,
            'success': function(res) { //支付成功回调
              // console.log(res);
              wx.navigateTo({
                url: '../cardVoucher/cardList',
              });
              t.setData({
                cardDetailFlag: false
              })
            },
            'fail': function(res) { //支付失败
              // t.setData({
              //     dbClickFlag: true
              // }); 
            },
            'complete': function() {
              t.setData({
                dbClickFlag: true
              });
            }
          });
        } else if (data.resultCode == 1) {
					$showToast(data.resultDesc)
        }
      }
    });

  },

  //勾选已阅读并同意《购卡协议》
  checkFn: function() {
    var _this = this,
      checkflag = _this.data.checkflag;

    _this.setData({
      checkflag: !checkflag
    });

  },

  //卖品详情
  sellDetailFn: function(e) {
    // console.log(e)
    var self = this,
      target = e.currentTarget.dataset,
      sellIndex = target.index,
      sellList = self.data.goodsList;
    self.setData({
      sellPopInfo: sellList[sellIndex]
    });

    self.DetailsFn('sell', true);
  },

  //收起弹窗
  hideDetailsFn: function() {
    var that = this,
      pageData = this.data,
      cardDetailFlag = pageData.cardDetailFlag,
      sellDetailFlag = pageData.sellDetailFlag;

    if (cardDetailFlag) {
      that.DetailsFn('card', false);
    }

    if (sellDetailFlag) {
      that.DetailsFn('sell', false);
    }
  },


  changeCinema: function(e) {
    wx.redirectTo({
      url: '../cinema/cinema',
    });
  },

  //切换分类导航
  changeNav: function(e) {
    var that = this,
      targets = e.currentTarget.dataset,
      n = targets.index;

    let goodsListPara = {
      'companyCode': movieCode,
      'cinemaCode': cinemaCode,
      'memberCode': memberCode,
      'type': 2,
      'presetId': -1,
      'pageSize': '200',
      'currentPageNumber': '1',
      'token': token,
      'CVersion': CVersion,
      'OS': OS
    }

    that.setData({
      page: n
    });

    if (n == 0) {
      that.getCardListFn();
      wx.setNavigationBarTitle({
        title: '会员卡'
      });
    } else if (n == 1) {
      that.getGoodsListFn();
      that.setData({
        catHighLightIndex: 0
      })
      wx.setNavigationBarTitle({
        title: '卖品'
      });
    }
  },

  //添加商品
  addFn: function(e) {
    // console.log(e)
    var that = this,
      targets = e.currentTarget.dataset,
      sellIndex = targets.index,
      curGoodsCode = targets.goodscode, //当前卖品的goodsCode
      modifyStr = '+1', //修改
      goodsList = that.data.goodsList;

    if ((userPhone == undefined || userPhone == '' || userPhone == null) || (memberCode == undefined || memberCode == '' || memberCode == null)) {
      wx.navigateTo({
        url: '../getUserInfo/login'
      });
      return false;
    }

    if (!sellIndex) {
      for (var i = 0; i < goodsList.length; i++) {
        if (goodsList[i].goodsCode == curGoodsCode) {
          sellIndex = i;
        }
      }
    }
    that.modifyTrolleyNum(modifyStr, curGoodsCode, sellIndex);
  },

  //减少商品
  reduceFn: function(e) {
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
  modifyTrolleyNum: function(modifyStr, goodscode, index) {
    var _this = this,
      modifyPara = {
        'companyCode': movieCode,
        'memberCode': memberCode,
        'cinemaCode': cinemaCode,
        'type': 1,
        'sellId': '',
        'quantity': '',
        'token': token,
        'CVersion': CVersion,
        'OS': OS
      },
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
      success: function(res) {
        // console.log(res);
        var resultCode = res.data.resultCode;
        if (resultCode == 0) {

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

            setTimeout(function() {
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
      fail: function() {},
      complete: function() {}
    });
  },

  // //进入购物车
  // goToTrolley: function() {
  //   if ((userPhone == undefined || userPhone == '' || userPhone == null) || (memberCode == undefined || memberCode == '' || memberCode == null)) {
  //     wx.navigateTo({
  //       url: '../getUserInfo/login'
  //     });
  //     return false;
  //   }
  //   wx.navigateTo({
  //     url: 'trolleyInfo',
  //   });
  // },

  //获取购物车里卖品数据
  getTrolleyList: function(goodsData, callback) {
    var that = this;
    wx.request({
      url: trolleyInfoUrl,
      method: 'GET',
      data: {
        'memberCode': memberCode,
        'cinemaCode': cinemaCode,
        'token': token,
        'CVersion': CVersion,
        'OS': OS,
        'companyCode': movieCode
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        'Accept': 'application/json'
      },
      success: function(res) {
        // console.log(res);
        var resData = res.data;
        let trolleyId = resData.resultData.id;
        // console.log(trolleyId)
        let goodsInfo = resData.resultData.trolleyDetails;
        if (resData.resultCode == 0) {
          var trolleyDetails = resData.resultData.trolleyDetails,
            typeLen = resData.resultData.typeCount,
            trolleyTotalNum = 0; //购物车里的总卖品数量

          if (goodsData.length) {
            if (typeLen > 0) {
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
              trolleyTotalNum: trolleyTotalNum,
              goodsInfo,
              trolleyId
            });
          } else {
            that.setData({
              trolleyList: trolleyDetails
            });
          }
        }
      },
      fail: function() {},
      complete: function() {
        if (callback) {
          callback();
        }
      }
    });
  },

  // 获取商品类型
  storeGoodsTypeList() {
    let t = this;
    let cinemaData = {
      "cinemaCode": cinemaCode
    };
    wx.request({
      url: storeGoodsTypeListUrl,
      method: 'POST',
      data: cinemaData,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        'Accept': 'application/json'
      },
      success: (res) => {
        // console.log(res)
        let data = res.data.resultData;
        if (data.length != 1) {
          t.setData({
            goodsNum1: true
          })
        }
        t.setData({
          classifys: data
        })
      }
    })
  },

  //左侧列表点击事件
  catClickFn(e) {
    // console.log(e)
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    let movieCode = wx.getStorageSync('movieCode');
    let cinemaCode = wx.getStorageSync('cinemaCode');
    let member = wx.getStorageSync('member');
    let memberCode = member.memberCode;
    let userPhone = member.memberPhone;
    let token = member.token;
    let CVersion = wx.getStorageSync('CVersion');
    let OS = wx.getStorageSync('OS');

    goodsListPara = {
      'companyCode': movieCode,
      'cinemaCode': cinemaCode,
      'memberCode': memberCode,
      'type': 2,
      'presetId': id,
      'pageSize': '200',
      'currentPageNumber': '1',
      'token': token,
      'CVersion': CVersion,
      'OS': OS
    };
    this.getGoodsListFn();
    // //左侧点击高亮
    this.setData({
      catHighLightIndex: index,
      id
    });

  },
  // 获取购物车的卖品信息
  accountFn() {
    let that = this;
    let flag = that.data.flag;
    let takeoutFlag = true;
    if ((userPhone == undefined || userPhone == '' || userPhone == null) || (memberCode == undefined || memberCode == '' || memberCode == null)) {
      wx.navigateTo({
        url: '../getUserInfo/login'
      });
      return false;
    }
    if (flag) {
      that.setData({
        flag: false
      })
    } else {
      return false
    }

    wx.request({
      url: trolleyInfoUrl,
      method: 'GET',
      data: {
        'memberCode': memberCode,
        'cinemaCode': cinemaCode,
        'token': token,
        'CVersion': CVersion,
        'OS': OS,
        'companyCode': movieCode
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        'Accept': 'application/json'
      },
      success: function(res) {
        console.log(res)
        let trolleyDetails = res.data.resultData.trolleyDetails;
        let goodsInfo = [];
        for (let i = 0; i < trolleyDetails.length; i++) {
          if (trolleyDetails[i].takeoutFlag == '1') {
            takeoutFlag = false;
          }
          let goodsJson = {
            goodsCode: '',
            amount: '',
            trolleyDetailId: '',
            sellEventId: '',
            limitedSell: ''
          };
          goodsJson.goodsCode = trolleyDetails[i].goodsCode;
          goodsJson.amount = trolleyDetails[i].count;
          goodsJson.trolleyDetailId = trolleyDetails[i].trolleyDetailId;
          goodsJson.sellEventId = trolleyDetails[i].sellEventId;
          goodsJson.limitedSell = trolleyDetails[i].limitedSell;
          goodsInfo.push(goodsJson)
        }
        goodsInfo = JSON.stringify(goodsInfo);
        let creatSellOrderPara = {
          'companyCode': movieCode,
          'memberCode': memberCode,
          'cinemaCode': cinemaCode,
          'goodsInfo': goodsInfo,
          "userPhoneNum": member.memberPhone,
          'token': token,
          'CVersion': CVersion,
          'OS': OS,
          'channel': '5'
        };
        // console.log(creatSellOrderPara)
        wx.request({
          url: creatSellsOrder,
          method: 'GET',
          data: creatSellOrderPara,
          header: {
            'Content-Type': 'text/plain',
            'Accept': 'application/json'
          },
          success: function(res) {
            // console.log(res)
            that.setData({
              flag: true
            });
            if (res.data.resultCode == '2202') {
              wx.navigateTo({
                url: '../Binding/binding',
              });
              return false
            }
            if (res.data.resultCode == '500') {
							$showToast(res.data.resultDesc)
            }
            var resultCode = res.data.resultCode;
            if (resultCode == 0) {
              wx.navigateTo({
                url: '../confirmOrder/goodsConfirmOrder?orderNo=' + res.data.resultData.orderId +
                  '&isTakeout=' + that.data.isTakeout + '&takeoutFlag=' + takeoutFlag,
              });

            }
          },
          fail: function() {},
          complete: function() {}
        });
      }
    })
  },

  // 影厅是否可配送
  distribution: function() {
    var t = this,
      hallCode = wx.getStorageSync('hallCode'),
      cinemaCode = wx.getStorageSync('cinemaCode'),
      data = {
        'cinemaCode': cinemaCode,
        'hallCode': hallCode
      };
    // console.log(data)
    wx.request({
      url: getHallInfoByTakeout,
      method: 'GET',
      data: data,
      success: function(res) {
        // console.log(res)
        let isTakeout = res.data.resultData[0].isTakeout;
        t.setData({
          isTakeout
        });
      }
    })
  },


  //把卖品放进购物车
  putInCart(e) {
    let modifyStr = '+1';
    let goodscode = e.target.dataset.goods.goodsCode;
    let index = e.target.dataset.index;
    this.modifyTrolleyNums(modifyStr, goodscode);
  },

  //减少购物车中卖品数量
  cutGoodFn(e) {
    let modifyStr = '-1';
    let goodscode = e.target.dataset.goods.goodsCode;
    let index = e.target.dataset.index;
    this.modifyTrolleyNums(modifyStr, goodscode)
  },

  //点击展开购物车
  showShopList: function() {
    var that = this,
      trolleyTotalNum = that.data.trolleyTotalNum;

    if (trolleyTotalNum > 0) {
      that.getTrolleyLists();
      that.setData({
        winFlag: false,
      });
    }
  },

  /*
  清空购物车
  */
  delGoodInfo() {
    var _this = this,
      typeLen = _this.data.trolleyTotalNum;
    if (typeLen > 0) {
      wx.showModal({
        title: '提示',
        content: '确定清空购物车吗?',
        success: function(res) {
          if (res.confirm) {
            _this.emptyTrolleyFn();
          } else if (res.cancel) {
            // console.log('用户点击取消')
          }
        }
      });
    } else {
			$showToast('购物车还是空的，去把它填满吧')
    }
  },

  /*
  隐藏购物车
  */
  closeWin: function() {
    var that = this;
    that.setData({
      winFlag: true,
    });
  },

  /*
  修改购物车
  */
  modifyTrolleyNums: function(modifyStr, goodscode) {
    var _this = this,
      modifyPara = {
        'companyCode': movieCode,
        'memberCode': memberCode,
        'cinemaCode': cinemaCode,
        'type': 1,
        'sellId': '',
        'quantity': '',
        'token': token,
        'CVersion': CVersion,
        'OS': OS
      };

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
      success: function(res) {
        var resultCode = res.data.resultCode;
        if (resultCode == 0) {
          _this.getTrolleyLists();
          _this.getGoodsListFn();
        }
      }
    });
  },

  /*
  获取购物车信息
  */
  getTrolleyLists() {
    let t = this;
    wx.showLoading({
      title: '',
      mask: true
    })
    wx.request({
      url: trolleyInfoUrl,
      method: 'GET',
      data: {
        'memberCode': memberCode,
        'cinemaCode': cinemaCode,
        'token': token,
        'CVersion': CVersion,
        'OS': OS,
        'companyCode': movieCode
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        'Accept': 'application/json'
      },
      success: (res) => {
        wx.hideLoading();
        let goodsInfo = res.data.resultData.trolleyDetails;
        t.setData({
          goodsInfo
        })
        if (goodsInfo.length < 1) {
          t.setData({
            winFlag: true,
          });
        }
      },
      fail: (res) => {
        wx.hideLoading();
      }
    })
  },

  //调清空购物车接口
  emptyTrolleyFn() {
    let trolleyId = this.data.trolleyId
    wx.request({
      url: emptyTrolleyUrl,
      method: 'GET',
      data: {
        'memberCode': memberCode,
        'cinemaCode': cinemaCode,
        'token': token,
        'CVersion': CVersion,
        'OS': OS,
        'companyCode': movieCode,
        'id': trolleyId
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        'Accept': 'application/json'
      },
      success: (res) => {
        this.getTrolleyLists();
        this.getGoodsListFn();
        this.setData({
          winFlag: true
        })
      },
    });
  },


})