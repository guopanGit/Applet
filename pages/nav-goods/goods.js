/**
 * 导入封装函数
 */

import {
  URL
} from '../../utils/config.js';

import {
  ajaxPromise,
  layerAnimate,
  creatOrder,
  payOrder,
  wxPayment,
  showToast,
} from '../../utils/util.js';

let {
  sellGoodsList,
  sellCardList,
  goodsCartList,
  addCartGoods,
  deleteCard,
  getTakeout,
  cardRecommend,
  goodsDetail,
  getCinemaInfo
} = URL || ''

const app = getApp();

const getTabbarHeight = () => {
	const systemInfo = wx.getSystemInfoSync()
	// px转换到rpx的比例
	const pxToRpxScale = 750 / systemInfo.windowWidth;
	// 状态栏的高度
	const ktxStatusHeight = systemInfo.statusBarHeight * pxToRpxScale
	// 导航栏的高度
	const navigationHeight = 44 * pxToRpxScale
	// window的宽度
	let ktxWindowWidth = systemInfo.windowWidth * pxToRpxScale
	// window的高度
	const ktxWindowHeight = systemInfo.windowHeight * pxToRpxScale
	// 屏幕的高度
	const ktxScreentHeight = systemInfo.screenHeight * pxToRpxScale
	// 底部tabBar的高度
	const tabBarHeight = ktxScreentHeight - ktxStatusHeight - navigationHeight - ktxWindowHeight;

	return tabBarHeight;
};

Page({

  /**
   * 页面的初始数据
   */
  data: {
    source: 2,
    rolled: 0,
    tabIndex: 0,
    scrollTop: 0,
    menuScroll: 0,
    currentIndex: 0,
    cartTotal: 0,
    goodsList: [],
    goodsMenu: [],
    cartList: [],
    noDelivery: "",
    delivery: '',
    showCart: false,
    prefLayer: false,
    showLayer: false,
    isCartList: false,
    cardDetail: false,
    renderShow: true,
    locationCity: "",
    totalPrice: 0,
    goosDatail: {},
    trolleyId: '',
    particular: {},
    type: '1',
    recommendCard: {},
    recommend: false,
    cardPrice: 0,
    initiate: 0,
    cardTab: 1,
    cardScrollTop: 0,
    toView: 'tabs0',
    winHeight: '100%',
    hasScroll: false,
    scrollTopArr: [],
    autoScroll: false,
    couponList: [],
    giftList: [],
    underlineX: '',
    titleXArr: [],
    underLineWidth: 0,
    cardDetails: {},
    couponDetails: {},
    giftDetails: {},
    titleIdArr: [],
  },
  isFirst: false,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let tabIndex = options.page || wx.getStorageSync('tabIndex') || 0;
    let hallCode = wx.getStorageSync('hallCode');
    let goodsId = wx.getStorageSync('goodsId') || '';
    let cityName = wx.getStorageSync('cityName');
    let scene = wx.getStorageSync('scene');
    this.isFirst = true;
    if (hallCode) {
      ajaxPromise(false, getTakeout, {
        hallCode,
        isTakeout: 1
      })
        .then((res) => {
          if (!res.resultData.length) {
            wx.removeStorageSync('hallCode');
            wx.removeStorageSync('movie');
            wx.removeStorageSync('row');
            wx.removeStorageSync('seat');
            wx.showModal({
              content: '前台小姐姐太忙啦,暂时无法为您送餐,请您下单后移步前台取餐',
              showCancel: false,
              confirmText: '我知道了'
            })
          }
        })
        .catch(() => {
        })
    }
    if (goodsId && scene == 1011) {
      tabIndex = 1;
      this.getDetail(goodsId);
    }
    if (scene == 1011) {
      wx.removeStorageSync('cityName');
      ajaxPromise(false, getCinemaInfo, {})
        .then((res) => {
          let {
            cityName
          } = res.resultData;
          wx.setStorageSync('cityName', cityName)
          this.setData({
            locationCity: cityName
          })
        })
        .catch(() => {
        })
    }
    this.setData({
      tabIndex,
      locationCity: cityName
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: '商城',
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let page = app.globalData.page;
    let currentPage;
    if (page !== '') {
      currentPage = page
      this.setData({
        tabIndex: page
      })
    } else {
      currentPage = this.data.tabIndex;
    }
    this._requestData(currentPage)
    this.isFirst = false;
  },

  /**
   * @param {} 切换导航
   */
  tabToggle(e) {
    let index = e.currentTarget.dataset.index;
    if (index == this.data.tabIndex) {
      return
    } else {
      this._requestData(index)
    }
    this.setData({
      tabIndex: index
    }, () => {
      if (index == 1) {
        this.getTitGps()
      }
    })
  },

  /**
   *
   * @param {} 卖品列表成功回调
   */
  sellGoodsListCall(res) {
    let goodsList = res.resultData.productList;
    let goodsMenu = [];
    if (goodsList.length) {
      // 处理卖品
      let initiate = 10000;
      goodsList.forEach(element => {
        goodsMenu.push(element.typeName);
        element.productList.forEach(ele => {
          ele.goodsNum = 0;
          ele.price = Number(ele.price);
          if (ele.sellEventPrice) {
            ele.sellEventPrice = Number(ele.sellEventPrice);
          }
          if (ele.cardPrice) {
            ele.cardPrice = Number(ele.cardPrice);
            ele.save = ele.price - ele.cardPrice;
          }
          let sellEventPrice = ele.sellEventPrice;
          if (!sellEventPrice || sellEventPrice > ele.cardPrice) {
            if (initiate > (ele.cardPrice / 100)) {
              initiate = ele.cardPrice / 100;
            }
          }
        });
      });
      initiate === 10000 ? initiate = 0 : initiate;
      this.setData({
        initiate
      })
      this.selectComponent("#default").hide();
    } else {
      this.setData({
        type: '2'
      })
      this.selectComponent("#default").show();
    }

    this.setData({
      goodsMenu,
      goodsList
    })

    if (wx.getStorageSync('member').memberCode) {
      ajaxPromise(false, goodsCartList, {})
        .then((res) => {
          this.goodsCartListCall(res)
        })
        .catch(() => {
        })
    } else {
      this.setData({
        cartTotal: 0,
        totalPrice: 0,
        cardPrice: 0,
        cartList: []
      })
    }
  },

  /**
   *
   * @param {*} 购物车列表成功回调
   */
  goodsCartListCall(res) {
    if (res.resultCode == '500' && res.resultDesc == "TOKEN_INVALID") {
      this.setData({
        noToken: true
      })
    }
    let cartList = res.resultData.trolleyDetails;
    let {
      goodsList,
    } = this.data || [];
    if (cartList.length > 0) {
      this.setData({
        goodsList
      });
      setTimeout(() => {
        this._cartClassify(cartList)
      }, 300)
    } else {
      this.setData({
        cartTotal: 0,
        totalPrice: 0,
        cardPrice: 0,
        cartList: []
      })
    }
  },

  /**
   * 获取会员卡成功回调
   */
  sellCardListCall(res) {
    if (!res.resultData) {
      this.setData({
        type: '1'
      })
      this.selectComponent("#default").show();
      return
    }
    let navList = res.resultData.typeList;
    let cardList = res.resultData.CARD || '';
    let couponList = res.resultData.VOUCHER || '';
    let giftList = res.resultData.PACKAGE || '';

    if (couponList.length) {
      couponList.forEach(element => {
        switch (element.targetType) {
          case 0:
            element.genre = '影票代金劵';
            break;
          case 1:
            element.genre = '折扣劵';
            break;
          case 2:
            element.genre = '固定金额通兑券';
            break;
          case 3:
            element.genre = '其他';
            break;
          case 4:
            element.genre = '影票免费兑换券';
            break;
          case 5:
            element.genre = '卖品券';
            break;
          case 7:
            element.genre = '商家券';
            break;
        }
      })
    }

    if (cardList.length) {
      cardList.forEach(i => {
        i.expire = 0;
        if (i.openMinus) {
          i.cost = i.cardFee - Number(i.openMinus)
        } else {
          i.cost = i.cardFee
        }
        if (i.cinemaMsg) {
          i.cinemaMsg.forEach(k => {
            k.cinemaName = k.cinemaName.split(',')
          });
        }
      });
      this.selectComponent("#default").hide();
    }

    if (couponList.length < 1 || giftList.length < 1 && cardList.length < 1) {
      this.setData({
        type: '1'
      })
      this.selectComponent("#default").show();
    }
    this.setData({
      cardList,
      couponList,
      giftList
    }, () => this.getTitleArr())
  },

  /**
   * 重新选择城市
   */
  selectCity() {
    // 重置首次进入小程序标识
    wx.setStorageSync('firstEntry', false);

    wx.redirectTo({
      url: '/pages/cinema/cinema',
    })
  },

  /**
   * @param {} 切换菜单
   */
  toggleMenu(e) {
    let menuName = e.currentTarget.dataset.menu;
    let index = e.currentTarget.dataset.index;
    this._watchScroll(menuName);
    setTimeout(() => {
      this.setData({
        currentIndex: index,
      },)
    }, 200)
  },

  /**
   *  监听卖品列表滚动
   */
  goodListScroll(e) {
    this._watchScroll();
    this.setData({
      rolled: e.detail.scrollTop
    })
  },

  /**
   * 加卖品
   */
  bindAdd(e) {
    let symbol = "+";
    this._calcTotal(e, symbol);
    this.setData({
      showCart: true
    })
  },

  /**
   * 减卖品
   */
  bindSub(e) {
    let symbol = "-";
    this._calcTotal(e, symbol);
    this.setData({
      showCart: true
    })
  },

  /**
   * 购物车 减少
   */
  listSub(e) {
    let {
      item
    } = e.currentTarget.dataset;
    this.addCart('-', item.goodsCode);
    this.setCount('-', item.goodsCode, item.index);
  },

  /**
   * 购物车 添加
   */
  listAdd(e) {
    let {
      item
    } = e.currentTarget.dataset;
    if (item.sellEventId) {

      if (item.count == item.eventLimitNum && item.eventLimitNum < item.limitedSell - item.saleLimit) {
        showToast("已超出特惠份额, 将以非活动价计算")
      } else if (item.count == (item.limitedSell - item.saleLimit) && item.eventLimitNum >= item.limitedSell - item.saleLimit) {
        showToast("您的限享份数已用完, 将以正常价格结算")
      }
    }


    this.addCart('+', item.goodsCode);
    this.setCount('+', item.goodsCode, item.index);
  },

  /**
   * 修改购物车
   * @param {添加/删除} deriction
   * @param {商品id} goodsId
   */
  addCart(deriction, goodsId) {
    let derictionPara;
    if (deriction == '+') {
      derictionPara = "+1"
    } else if (deriction == '-') {
      derictionPara = "-1"
    }
    ajaxPromise(false, addCartGoods, {
      type: 1,
      sellId: goodsId,
      quantity: derictionPara
    })
      .then((res) => {
        ajaxPromise(false, goodsCartList, {})
          .then((res) => {
            let cartList = res.resultData.trolleyDetails;
            this._cartClassify(cartList)
          })
          .catch(() => {
          })
      });
  },

  /**
   * 购物车列表
   */
  showCartList() {
    layerAnimate(this, 200);
    this.setData({
      showLayer: !this.data.showLayer,
      isCartList: !this.data.isCartList
    })
  },

  /**
   *  详情添加购物车
   */
  addCard() {
    let code = this.data.goosDatail.goodsCode;
    let cartTotal = this.data.cartTotal;
    if (cartTotal == 99) {
      showToast('添加总数不超过99件')
      return
    }
    this.addCart('+', code);
    this.setGoosNum(code, '+');
    this.setData({
      showLayer: false,
      prefLayer: false
    })
  },

  /**
   * 修改购物车
   */
  setCount(symbol, code, index) {
    let {
      cartList,
      cartTotal
    } = this.data;
    let count = cartList[index].count;
    if (symbol == '+') {
      count += 1;
      cartTotal += 1;
      cartList[index].count = count;
      if (cartTotal >= 99) {
        showToast('添加总数不超过99件')
      }
      this.setGoosNum(code, symbol)
    } else if (symbol == '-') {
      count -= 1
      cartTotal -= 1
      if (count <= 0) count = 0
      if (cartTotal <= 0) cartTotal = 0
      cartList[index].count = count
      this.setGoosNum(code, symbol)
    }
    if (count == 0) {
      cartList.splice(index, 1)
    }
    this.setData({
      cartList,
      cartTotal
    })
  },

  /**
   * 修改页面数量
   */
  setGoosNum(code, symbol) {
    let goodsList = this.data.goodsList;
    goodsList.forEach(i => {
      i.productList.forEach(k => {
        if (code == k.goodsCode) {
          if (symbol == '+') {
            k.goodsNum += 1
          } else if (symbol == '-') {
            k.goodsNum -= 1
          }
        }
      });
    });
    this.setData({
      goodsList
    })
  },

  /**
   * 清空购物车
   */
  empty() {
    wx.showModal({
      title: '',
      content: '是否清空购物车',
      success: res => {
        if (res.confirm) {
          ajaxPromise(true, deleteCard, {
            id: this.data.trolleyId
          })
            .then((res) => {
              let data = {
                presetId: "-1",
                pageSize: "10000",
                deliverPriority: '0',
                currentPageNumber: "0"
              };
              let scene = wx.getStorageSync('scene');
              let goodsType = wx.getStorageSync('type');

              if (scene == 1011) {
                if (goodsType == 1) {
                  data.deliverPriority = 'type5'
                } else if (goodsType == 0) {
                  data.deliverPriority = 'type4'
                }
              }
              ajaxPromise(true, sellGoodsList, data)
                .then((res) => {
                  this.sellGoodsListCall(res)
                })
                .catch(() => {
                })
              this.setData({
                showLayer: false,
                isCartList: false,
                cartTotal: 0
              })
            })
            .catch(() => {
            })
        }
      }
    })
  },

  /**
   * 卖品下一步 去结算
   */
  nextStep() {
    let list = this.data.cartList;
    let goodsInfo = []
    list.forEach(i => {
      let data = {
        amount: i.count,
        goodsCode: i.goodsCode
      };
      if (i.sellEventId) {
        data.sellEventId = i.sellEventId
      }
      goodsInfo.push(data)
    })
    let params = {
      phone: wx.getStorageSync('member').phone,
      goodsInfo: JSON.stringify(goodsInfo)
    };
    creatOrder(2, '', (res) => {
      let orderId = res.resultData.orderId;
      wx.navigateTo({
        url: `/pages/order/submit-order/submit-order?orderNo=${orderId}&type=2`
      })
    }, params)
  },

  // 购卡
  openCard(e) {
    let data = e.detail;
    let code = e.detail.cardCode || e.currentTarget.dataset.val.cardCode;
    let lurkData = data;
    let cinemaName = wx.getStorageSync('cinemaName');
    // 创建订单
    creatOrder(3, code, (res) => {
      let orderNo = res.resultData.orderNo;
      payOrder(3, orderNo, (res) => {
        let data = res.resultData;
        wxPayment(data, (res) => {
          if (res.errMsg == "requestPayment:ok") {
            // 埋点
            app.sensors.track('buyCrad', {
              platform_type: '小程序',
              cinemaName,
              cardType: lurkData.cardType,
              cardName: lurkData.cardName,
              cardAmount: lurkData.cardAmount
            })
          }
          wx.navigateTo({
            url: `/pages/success/success?orderNo=${orderNo}&type=3`
          })
        }, () => {
          showToast("支付已取消")
        })
      })
    }, data)
  },

  /**
   * 关闭弹层
   */
  closeLayer() {
    this.setData({
      cardDetail: false
    })
  },

  /**
   * 隐藏层
   */
  hideLayer() {
    this.setData({
      showLayer: false,
      prefLayer: false,
      isCartList: false,
    })
  },

  /**
   * @param {} 查看特惠商品
   */
  checkPref(e) {
    let goosDatail = e.currentTarget.dataset.type;
    this.setData({
      prefLayer: true,
      showLayer: true,
      goosDatail
    })
  },

  /**
   * 监听页面滚动到底部
   */
  bindscrolltolower() {
    this.setData({
      currentIndex: this.data.goodsMenu.length - 1
    })
  },

  /**
   *
   * @param {} 传入当前加载的页码
   */
  _requestData(page, state) {
    if (page == 0) {
      // 卖品列表
      let goodsType = wx.getStorageSync('type');
      let scene = wx.getStorageSync('scene');
      let params = {
        presetId: "-1",
        pageSize: "10000",
        deliverPriority: '',
        currentPageNumber: "0",
      };
      if (scene == 1011) {
        if (goodsType == 1) {
          params.deliverPriority = 'type5'
        } else if (goodsType == 2) {
          params.deliverPriority = 'type4'
        }
      }
      ajaxPromise(this.isFirst, sellGoodsList, params)
        .then((res) => {
          this.sellGoodsListCall(res)
          if (state) {
            wx.stopPullDownRefresh()
          }
        })
        .catch(() => {
          this.setData({
            type: '2'
          })
          this.selectComponent("#default").show();
        })
      ajaxPromise(false, cardRecommend, {
        sortType: 3
      }, false, true)
        .then((res) => {
          let recommendCard = res.resultData.recommendCard;
          if (recommendCard.gId) {
            this.setData({
              recommend: true,
              recommendCard
            })
          } else {
            this.setData({
              recommend: false,
            })
          }
        })
        .catch(() => {
        })
    } else {
      // 会员卡列表
      ajaxPromise(this.isFirst, sellCardList, {}, 'POST')
        .then((res) => {
          this.sellCardListCall(res)
          if (state) {
            wx.stopPullDownRefresh()
          }
        })
        .catch(() => {
          this.setData({
            type: '1'
          })
          this.selectComponent("#default").show();
        })
    }
  },

  /**
   * @param {*} 获取当前索引
   * @param {*} 标识
   */
  _calcTotal(e, symbol) {
    if (wx.getStorageSync('member').memberCode && !this.data.noToken) {
      let cartList = this.data.cartList;
      let cartTotal = this.data.cartTotal;
      let {
        inside,
        outside,
      } = e.currentTarget.dataset || ""

      // 获取当前卖品数量
      let currentGoods = this.data.goodsList[outside].productList[inside];
      let goodsNum = currentGoods.goodsNum;
      if (symbol === "+") {
        if (cartTotal >= 98) {
          showToast('添加总数不超过99件')
        }
        goodsNum++; // 卖品自加
        cartTotal++; // 购物车总数自加
        currentGoods.goodsNum = goodsNum; // 赋值
        // 添加购物车
        this.addCart(symbol, currentGoods.goodsCode);
        if (currentGoods.isEvent == '1') {
          let goodName = currentGoods.sellName;
          if (currentGoods.singleLimit <= currentGoods.eventLimitNum) {
            if (goodsNum == currentGoods.singleLimit + 1) {
              showToast(`您的${goodName}限享份数已用完, 将以正常价格结算`)
            }
          } else {
            if (goodsNum == currentGoods.eventLimitNum + 1) {
              showToast(`${goodName}已超出特惠份额, 将以非活动价计算`)
            }
          }
        }
      } else if (symbol === "-") {
        goodsNum--; // 卖品自减
        cartTotal--; // 购物车总数自减

        if (goodsNum <= 0) goodsNum = 0;
        if (cartTotal <= 0) cartTotal = 0;
        currentGoods.goodsNum = goodsNum; // 赋值
        // 添加购物车
        this.addCart(symbol, currentGoods.goodsCode);
        if (cartList.length == 0) {
          this.hideLayer();
        }
      }
      // 更新数据
      this.setData({
        cartList,
        cartTotal,
        goodsList: this.data.goodsList
      })
    } else {
      wx.navigateTo({
        url: `/pages/sign-in/authorize/authorize`
      })
    }
  },

  /**
   * @param {} 购物车分类
   */
  _cartClassify(cartList) {
    let noDelivery = '0'
    let delivery = '0'
    let totalPrice = 0;
    let cartTotal = 0;
    let discounts = 0; // 本单省
    let trolleyId = '';
    if (cartList.length > 0) {
      trolleyId = cartList[0].trolleyId;
      let goodsList = this.data.goodsList;
      // 查找不可配送的卖品
      cartList.forEach((element, index) => {
        element.index = index;
        element.totalPrice = 0;
        goodsList.forEach(dom => {
          dom.productList.forEach(ele => {
            if (element.goodsCode == ele.goodsCode) {
              ele.goodsNum = element.count;
              if (ele.cardPrice) {
                element.cardPrice = ele.cardPrice
              }
              let singleLimit = element.singleLimit || 0;
              if (ele.sellEventId) {
                // 剩余数量是否大于限购
                if (ele.eventLimitNum < ele.singleLimit) {
                  singleLimit = ele.eventLimitNum;
                } else {
                  singleLimit = ele.singleLimit;
                }
                if (element.count <= singleLimit) {
                  element.totalPrice = element.count * ele.sellEventPrice
                } else {
                  let count = element.count - singleLimit;
                  element.totalPrice = Number(ele.sellEventPrice * singleLimit) + (count * ele.goodsPrice)
                }
              } else {
                element.totalPrice = element.count * ele.goodsPrice
              }
            }
          })
        });
        if (element.cardPrice) { // 开卡有折扣
          if (element.sellEventId) { // 有活动
            let singleLimit = 0;
            // 剩余数量是否大于限购
            if (element.eventLimitNum < element.singleLimit) {
              singleLimit = element.eventLimitNum;
              // element.totalPrice = 0;
            } else {
              singleLimit = element.singleLimit;
            }
            let num = element.count - singleLimit;
            if (element.sellEventPrice <= element.cardPrice) {
              if (num > 0) {
                discounts += (element.goodsPrice - element.cardPrice) * num;
              }
            } else {
              if (num <= 0) {
                discounts += (element.sellEventPrice - element.cardPrice) * element.count;
              } else {
                let eventPrice = (element.sellEventPrice - element.cardPrice) * singleLimit;
                discounts += eventPrice + (element.goodsPrice - element.cardPrice) * (element.count - singleLimit);
              }
            }
          } else { // 没活动
            let price = Number(element.goodsPrice) - Number(element.cardPrice);
            discounts += price * element.count;
          }
        }
        totalPrice += element.totalPrice;
        cartTotal = element.allCount + cartTotal;
        if (element.takeoutFlag == "0") {
          noDelivery = '1'
        } else {
          delivery = '1'
        }
      })
      this.setData({
        goodsList
      })
    } else {
      this.setData({
        isCartList: false,
        showLayer: false,
        cardPrice: 0
      })
    }
    this.setData({
      cartList,
      noDelivery,
      delivery,
      totalPrice,
      cartTotal,
      trolleyId,
      cardPrice: discounts
    })
  },

  /**
   * 获取卡券里面 标题的坐标
   */
  getTitGps() {
    setTimeout(() => {
      const query = wx.createSelectorQuery()
      query.selectAll('.tab-item').fields({
        dataset: true,
        size: true,
        rect: true,
        scrollOffset: true
      });
      query.select('.underLine').fields({
        dataset: true,
        size: true,
        rect: true,
        scrollOffset: true
      })
      query.exec(res => {
        // console.log(res, 'res')
        const domArr = res[0]
        const underLineWidth = res[1] && res[1].width
        const titleXArr = domArr.map(i => {
          return {
            left: i.left,
            width: i.width
          }
        })
        this.setData({
          underlineX: (domArr[0] && domArr[0].width - underLineWidth) / 2 + (domArr[0] && domArr[0].left),
          titleXArr,
          underLineWidth,
          toView: this.data.titleIdArr[0],
        })
      })
    }, 500);

  },

  /**
   * 获取锚点组件标题
   * @return Array
   */
  getTitleArr() {
    let cache = []
    const list = [
      {
        id: 'tabs0',
        conent: this.data.cardList
      }, {
        id: 'tabs1',
        conent: this.data.couponList
      }, {
        id: 'tabs2',
        conent: this.data.giftList
      }
    ]
    list.forEach(i => {
      if (i.conent.length > 0) {
        cache.push(i.id)
      }
    })
    this.setData({
      titleIdArr: cache
    })

  },



  clickTab(e) {
    const {tab} = e.currentTarget.dataset
    const {titleXArr, underLineWidth, titleIdArr} = this.data
    const index = titleIdArr.indexOf(tab)
    const tabAc = titleXArr[index]
    const underlineX = (tabAc.width - underLineWidth) / 2 + tabAc.left
    this.setData({
      toView: e.currentTarget.dataset.tab,
      autoScroll: true,
      underlineX
    })
  },

  cardScroll(e) {
    if (this.data.titleIdArr.length == 1) {
      return
    }
    // 仅在第一次滑动的时候去获取锚点的位置
    if (!this.data.hasScroll) {
      this.getEleTop()
    } else {
      this.scrollFn(e)
    }
  },

  /**
   * 获取底部滑动模块最新值
   * @param toView 即将更新的锚点
   * @return underlineX 底部滑动模块最新值
   */
  getUnderlineXNow(toView) {
    const {titleXArr, underLineWidth, titleIdArr} = this.data
    const index = titleIdArr.indexOf(toView)
    // console.log(toView,'toView',index)
    const tabAc = titleXArr[index]
    return (tabAc.width - underLineWidth) / 2 + tabAc.left
  },

  /**
   * @param {e} 滑动参数
   * @description 获取已滑动的位置更改选中的标题
   */
  scrollFn(e) {
    const {scrollTopArr, toView, titleIdArr} = this.data
    const {scrollTop} = e.detail
    // const side1 = scrollTop < scrollTopArr[0]
	  // const side2 = scrollTopArr[1]
    //   ? scrollTopArr[1] < scrollTopArr[0]
    //     ? scrollTopArr[1] < scrollTop
    //     : (scrollTopArr[0] < scrollTop) && (scrollTop < scrollTopArr[1])
    //   : scrollTopArr[0] < scrollTop
    // const side3 = scrollTopArr[2]
    //   ? (scrollTopArr[1] < scrollTop) && (scrollTop < scrollTopArr[2])
    //   : scrollTopArr[1] < scrollTop

    // if (side3 && scrollTopArr[1] > scrollTopArr[0]) {
    //   if (titleIdArr[2] && (titleIdArr[2] != toView)) {
    //     this.setData({
    //       toView: titleIdArr[2],
    //       autoScroll: false,
    //       underlineX: this.getUnderlineXNow(titleIdArr[2])
    //     })
    //   }
    // } else if (side2) {
    //   if (titleIdArr[1] && (titleIdArr[1] != toView)) {
    //     this.setData({
    //       toView: titleIdArr[1],
    //       autoScroll: false,
    //       underlineX: this.getUnderlineXNow(titleIdArr[1])
    //     })
    //   }
    // } else if (side1) {
    //   if (titleIdArr[0] != toView) {
    //     this.setData({
    //       toView: titleIdArr[0],
    //       autoScroll: false,
    //       underlineX: this.getUnderlineXNow(titleIdArr[0])
    //     })
    //   }
    // }
	  const side1 = scrollTop < scrollTopArr[0];
	  const side2 = scrollTop >= scrollTopArr[0] && scrollTop < scrollTopArr[1];
	  const side3 = scrollTop >= scrollTopArr[1] && scrollTop < scrollTopArr[2];
	  if(side1 && toView!==titleIdArr[0]){
		  // console.log('会员卡范围',{scrollTop, scrollTopArr});
	      this.setData({
	        toView: titleIdArr[0],
	        autoScroll: false,
	        underlineX: this.getUnderlineXNow(titleIdArr[0])
	      });
		  return;
	  }
	  if(side2 && toView!==titleIdArr[1]){
		  // console.log('优惠券范围',{scrollTop, scrollTopArr});
		  this.setData({
			  toView: titleIdArr[1],
			  autoScroll: false,
			  underlineX: this.getUnderlineXNow(titleIdArr[1])
		  });
		  return;
	  }
	  if(side3 && toView!==titleIdArr[2]){
		  // console.log('礼包范围',{scrollTop, scrollTopArr});
		  this.setData({
			  toView: titleIdArr[2],
			  autoScroll: false,
			  underlineX: this.getUnderlineXNow(titleIdArr[2])
		  });
		  return;
	  }
  },
  /**
   * @description 获取每个锚点的高度
   */
  getEleTop() {
    const query = wx.createSelectorQuery()
    query.selectAll('.view-top').fields({
      dataset: true,
      size: true,
      rect: true,
      scrollOffset: true
    })
    query.select('#scroll-conent').fields({
      dataset: true,
      size: true,
      rect: true,
      scrollOffset: true,
    })
    query.exec((res) => {
      const initTop = res[0][0].bottom-getTabbarHeight();
	    let scrollTopArr = [initTop];
      res[0].forEach((element, index) => {
        // if(index==0){
        //   if (res[0][index + 1]) {
        //     scrollTopArr.push(res[0][index + 1].top - initTop)
        //   }
        // }else
        if (index != res[0].length - 1) {
          if (res[0][index + 1]) {

            const lastGps = res[0][index + 1].bottom-getTabbarHeight();
            scrollTopArr.push(lastGps)
          }
        } else {
          return
        }
      })
      this.setData({
        scrollTopArr,
        hasScroll: true
      })
    });
  },
  /**
   * 滑动到底部
   */
  lowerScrollFn(e) {
    const {titleXArr, underLineWidth, titleIdArr, scrollTopArr} = this.data
    const toView = titleIdArr[titleIdArr.length - 1]
    const index = titleIdArr.indexOf(toView) || 0;
    const tabAc = titleXArr[index]
    const underlineX = tabAc && ((tabAc.width - underLineWidth) / 2 + tabAc.left) || 0
    if (titleIdArr.length == 1) {
      return
    }
    if (scrollTopArr[1] < scrollTopArr[0]) {
      return
    }
    this.setData({
      toView,
      autoScroll: false,
      underlineX
    })
  },

  setScrollTop(title, rollLength) {
    let _this = this;
    wx.createSelectorQuery().selectAll('.list-title').fields({
      dataset: true,
      size: true,
      rect: true
    }, (res) => {
      res.forEach((element, index) => {
        if (title == element.dataset.name) {
          let scrollTop = element.top;
          _this.setData({
            cardScrollTop: scrollTop,
          })
        }
        if (!title) {
          if (element.top <= 240 && element.top >= 100) {
            _this.setData({
              cardTab: index + 1,
            })
          } else if (element.top > 400) {
            _this.setData({
              cardTab: index,
            })
          }
        }
      })
    }).exec();
  },

  /**
   * 监听滚动
   */
  _watchScroll(menuName) {
    let _this = this;
    let recommend = this.data.recommend;
    wx.createSelectorQuery().selectAll('.goods-type').fields({
      dataset: true,
      size: true,
      rect: true
    }, (res) => {
      res.forEach((element, index) => {
        // 点击联动
        if (menuName == element.dataset.name) {
          let scrollTop = element.top + _this.data.rolled - 50;
          if (recommend) {
            scrollTop -= 50
          }
          _this.setData({
            scrollTop,
          })
        }

        // 滚动联动
        if (element.top <= 100 && element.top >= 50) {
          _this.setData({
            currentIndex: index,
          })
        }
      })
    }).exec();
  },

  /**
   * 会员卡详情
   */
  cardDetails(e) {
    let id = e.currentTarget.dataset.id;
    this.getDetail(id);
  },

  /**
   * 优惠券详情
   */
  couponDetails(e) {
    let id = e.currentTarget.dataset.id;
    this.getDetail(id);
  },

  /**
   * 礼品详情
   */
  giftDetails(e) {
    let id = e.currentTarget.dataset.id;
    this.getDetail(id);
  },


  /**
   * 获取商品详情
   */
  getDetail(goodsId) {
    ajaxPromise(true, goodsDetail, {
      goodsId
    })
      .then((res) => {
        let name = '';
        let goodsType = res.resultData.goodsType;
        if (goodsType == 'CARD') {
          name = 'cardDetails'
        } else if (goodsType == 'VOUCHER') {
          name = 'couponDetails'
        } else if (goodsType == 'PACKAGE') {
          name = 'giftDetails'
        }
        this.setData({
          [name]: res.resultData,
          cardDetail: true,
        })
      })
      .catch(() => {
      })
  },

  // 下拉刷新
  onPullDownRefresh() {
    let tabIndex = this.data.tabIndex;
    this._requestData(tabIndex, true)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    const that = this;
    let title = '';
    let companyCode = wx.getStorageSync('companyCode');
    let cinemaCode = wx.getStorageSync('cinemaCode');
    let cityName = wx.getStorageSync('cityName');
    if (that.data.tabIndex == 0) {
      title = '来个小食看电影，美滋滋~'
    } else {
      title = '办张会员卡，购票更优惠'
    }
    return {
      title: title,
      path: `pages/nav-goods/goods?cinemaCode=${cinemaCode}&companyCode=${companyCode}&cityName=${cityName}&tabIndex=${that.data.tabIndex}`,
    }
  }
})
