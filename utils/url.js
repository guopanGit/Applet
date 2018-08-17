// 老版测试地址-old
// var HOST = 'http://101.201.210.244:8081/yinghe-app',
// HOST1 = 'http://101.201.210.244:8080/mplus',
//老版测试地址-new
// var HOST = 'http://101.201.79.224:8081/yinghe-app',
// 	HOST1 = 'http://101.201.79.224:8080/mplus',
// 新版轻量化-s端测试地址
//  var HOST = 'http://192.168.0.224:8081/yinghe-app',
  // HOST1 = 'http://192.168.0.222:5555', //s端测试地址
  
var HOST = 'http://192.168.0.145:8080/yinghe-app',
  HOST1 = 'http://192.168.0.140:5555', //s端测试地址
  //  HOST1 = 'http://192.168.100.52:5555', //s端崔程电脑地址
// HOST1 = 'http://192.168.0.55:5555', //s端王磊电脑地址


// 正式地址
//var HOST = 'https://light.mplus.net.cn', //老轻量化接口
//HOST1 = 'https://api.ingcore.com/mplus',//老s端
//  var HOST = 'https://newlight.ingcore.com', //新轻量化接口
//  HOST1 = 'https://small.ingcore.com/',//新s端

 
    getVerifyCode = HOST + '/app/CommonSystem/verifyCode', //获取登录验证码
    MEMBER_LOGIN = HOST + '/app/member/verifyCodeLogin', //验证码登录 
    wxLogin = HOST + '/app/member/wxCheckLogin', //微信登录
    sessionID = HOST1 + '/app/member/initWxLogin', //获取sessionID
    userInfoUrl = HOST1 + '/app/member/decodeUserInfo', //获取openId和unionId
    wxBindPho = HOST1 + '/app/member/wxBindingPhone', //微信绑定手机号
	miniappsLogin = HOST1 + '/app/member/miniappsLogin', //一键获取微信手机号并注册
    bannerUrl = HOST1 + '/app/other/ad', //首页banner图
    // index = HOST + '/app/film/getIndexData', //轻量化首页接口
    index = HOST1 + '/app/film/films2', //s端电影列表接口
    movieInfo = HOST + '/app/film/getFilmInfo', //影片详情 
    getCinemaLogo = HOST + '/app/CommonSystem/getMoviePics', //获取影院logo图片
    movieUrl = HOST + '/app/CommonSystem/getCinemasCities', //选择影院
    orderListUrl = HOST + '/app/memberMyInfo/getordersList', //影票订单列表
    selTicketsUrl = HOST + '/app/film/getShowsSeats', //选票页面
    createOrder = HOST + '/app/order/createOrder', //创建购票订单
    goodsList = HOST + '/app/sellGoods/getMixGoodsList.html', //选择商品
    addGoods = HOST + '/app/order/addGoods.json', //在订单里添加商品
    confirmOrder = HOST + '/app/order/getOrderInfo', //确认订单
    getvouchers = HOST + '/app/Voucher/getvouchersByMember', //确认订单页-获取券信息
    getCardList = HOST + '/app/memberMyInfo/getCardsByMember', //获取卡列表
    // cancelOrder = HOST1 + '/app/trade/cancelOrder', //取消订单
    refundUrl = HOST1 + '/app/pay/refund', //单独影票退票地址
	// refundGoodsUrl = HOST1 + '/app/pay/refundGoods', //混合订单退票+卖品
    initPay = HOST1 + '/app/pay/initPay',  //支付
    // bindOrder = HOST + '/app/order/orderBinding', //确认订单绑定卡或券接口(不用卡券的时候也要调此接口)
    bindOrder = HOST1 + '/app/trade/orderConfirm', //确认订单绑定卡或券接口(不用卡券的时候也要调此接口)
    cancelOrder = HOST + '/app/order/cancelOrder', //取消订单
    checkOrderState = HOST + '/app/order/checkOrderState', //验证支付状态
    orderInfo = HOST + '/app/order/getOrderInfo', //订单详情 '
    bindVoucher = HOST + '/app/Voucher/bindVoucher', //绑线下券
    bindCard = HOST + '/app/card/bindCard', //绑线下卡
    storeGoodsTypeList = HOST + '/app/sellGoods/getGoodsTypeList', //商城商品分类
    storeGoodsList = HOST + '/app/sellGoods/getGoodsList', //商城商品列表
    storeCardList = HOST + '/app/card/getCardsbycinemalist',//商城卡列表
    byeCard = HOST + '/app/order/byCardOrder', //立即购卡-轻量化接口
    // byeCard = HOST1 + 'app/card/order', //立即购卡-新B端接口
    trolleyList = HOST + '/app/sellGoods/getTrolleyList',  //获取购物车数据
    modifyTrolleyVal = HOST + '/app/sellGoods/saveTrolleyDetail',  // 修改商城卖品购物车数据
    emptyTrolley = HOST + '/app/sellGoods/deleteTrolleyById',  //清空购物车
    // creatSellsOrder = HOST + '/app/sellGoods/createOrder',  //创建卖品订单-轻量化接口
    creatSellsOrder = HOST1 + '/app/goods/sellOrder/createOrder',  //创建卖品订单-S端接口
    getSellOrderDetail = HOST + '/app/sellGoods/getSellOrderDetail', //获取卖品订单详情
    // selCard = HOST + '/app/order/prepaid',  //影票确认订单用卡页面，点击选卡，预支付接口
    selCard = HOST1 + '/app/trade/prepaid',  //影票确认订单用卡页面，点击选卡，预支付接口
    goodsOrderSelCard = HOST + '/app/sellGoods/prepaid',  //卖品确认订单用卡页面，点击选卡 ，预支付接口
    cardPsw = HOST + '/app/member/cardPsw', //查看当前用户是否设置了卡密码
    setCardPsw = HOST + '/app/order/updatBalancePwd', //设置卡支付密码
    getSellOrderList = HOST + '/app/sellGoods/getSellOrderList',//获取卖品订单列表
    sellBindOrder = HOST + '/app/sellGoods/orderBingding', // 卖品订单支付前订单绑定
    orderGoodsInfo = HOST +'/app/sellGoods/getSellGoodsDetail',//卖品订单详情接口
    payExchange = HOST + '/app/order/payExchange', //混合订单零元对换券支付接口
    payExchangeGoods = HOST1 + '/app/trade/pay', //独立卖品零元对换券支付接口
    checkCardPsw = HOST + '/app/order/checkCardPsw', //校验卡支付密码是否正确
    checkPosCardPsw = HOST + '/app/order/checkPosCardPsw', //校验pos卡支付密码是否正确
    cardPayBack = HOST + '/app/order/payBack', //校验过卡密码后，用卡支付
    getState = HOST + '/app/sellGoods/getState';//获取订单状态

module.exports = {
    // getHost: getHost,
	HOST: HOST,
	HOST1: HOST1,
    loginUrl:MEMBER_LOGIN,
    getCinemaLogo: getCinemaLogo,
    movieUrl: movieUrl,
    index: index,
    bannerUrl: bannerUrl,
    movieInfo: movieInfo,
    orderList: orderListUrl,
    selTicketsUrl: selTicketsUrl,
    createOrder: createOrder,
    orderInfo: orderInfo, 
    getVerifyCode: getVerifyCode,
    goodsList: goodsList,
    addGoods: addGoods,
    confirmOrder: confirmOrder,
    getvouchers: getvouchers,
    getCardList: getCardList, 
    bindOrder: bindOrder, 
    cancelOrder: cancelOrder,
    checkOrderState: checkOrderState,
    wxLogin: wxLogin,
    wxBindPho: wxBindPho,
	miniappsLogin: miniappsLogin,
    userInfoUrl: userInfoUrl,
    sessionID: sessionID,
    initPay: initPay,
    refundUrl: refundUrl,
    bindVoucher: bindVoucher,
    bindCard: bindCard,
    storeCardList: storeCardList,
    storeGoodsTypeList: storeGoodsTypeList,
    storeGoodsList: storeGoodsList,
    byeCard: byeCard,
    modifyTrolleyVal: modifyTrolleyVal,
    trolleyList: trolleyList,
    emptyTrolley: emptyTrolley,
    creatSellsOrder: creatSellsOrder,
    getSellOrderDetail: getSellOrderDetail,
    selCard: selCard,
    cardPsw: cardPsw,
    setCardPsw: setCardPsw,
    getSellOrderList: getSellOrderList,
    goodsOrderSelCard: goodsOrderSelCard,
    sellBindOrder: sellBindOrder,
    orderGoodsInfo: orderGoodsInfo,
    payExchange: payExchange,
    payExchangeGoods: payExchangeGoods,
    checkCardPsw: checkCardPsw,
    checkPosCardPsw:checkPosCardPsw,
    cardPayBack: cardPayBack,
    getState: getState
};
