// pages/confirmOrder/chooseCard.js
var url = require('../../utils/url.js'),
  util = require('../../utils/util.js'),
  getCardListUrl = url.getCardList,
  memberCardPara,
  selCardCode;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    detailsflag: false,
    isFromSearch: true,
    cardlist: [],
    pageNo: 1,
    hasNext: true,
    loadOver: false,
    cardLen: 0, 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this,
        movieCode = wx.getStorageSync('movieCode'),
        cinemaCode = wx.getStorageSync('cinemaCode'),
        member = wx.getStorageSync('member');

    // 获取系统信息
    // wx.getSystemInfo({
    //     success: function (res) {
    //         console.log(res);
    //         // 可使用窗口宽度、高度
    //         console.log('height=' + res.windowHeight);
    //         console.log('width=' + res.windowWidth);
    //         // 计算主体部分高度,单位为px
    //         self.setData({
    //             // second部分高度 = 利用窗口可使用高度 - first部分高度（这里的高度单位为px，所有利用比例将300rpx转换为px）
    //             scrollHeight: res.windowHeight * 2 // - res.windowWidth / 750 * 88
    //         });
    //     }
    // });

    memberCardPara = { 'companyCode': movieCode, 'memberCode': member.memberCode, 'cinemaCode': cinemaCode, 'pageNo': self.data.pageNo, 'cardType': '' }

    //console.log(memberCardPara);
    self.ajaxFn();

  },
  //卡列表数据
  ajaxFn: function () {
    //debugger;
    var self = this,
        pageNo = self.data.pageNo;
    memberCardPara.pageNo = pageNo;
    
    wx.request({
      url: getCardListUrl,
      method: 'GET',
      data: memberCardPara,
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
			success: function (res) {
				wx.hideLoading();
				console.log(res, "卡列表");
				var cardInfoData = res.data.resultData,
					hasNext = '',
					cardLen = cardInfoData.orders.length;
				if (cardInfoData.hasNext != undefined) {
					hasNext = cardInfoData.hasNext
				};
				for (var i = 0; i < cardInfoData.orders.length; i++) {
					if (cardInfoData.orders[i].cardType == 2) {
						cardInfoData.orders[i].cardComments = cardInfoData.orders[i].cardComments;
					} else if (cardInfoData.orders[i].cardType == 1 || cardInfoData.orders[i].cardType == 10 || cardInfoData.orders[i].cardType == 11) {
						cardInfoData.orders[i].cardComments = cardInfoData.orders[i].cardComments.substr(6).replace("元", "");
					}
					// if (cardInfoData.orders[i].limitTime == "" || cardInfoData.orders[i].limitTime == undefined) {
					//   cardInfoData.orders[i].limitTime = "永久有效";
					// }

				}
				if (pageNo == 1) {

					self.setData({
						cardlist: cardInfoData.orders,
						hasNext: hasNext,
						cardLen: cardLen
					});

				}


				if (pageNo > 1) {
					console.log(pageNo)
					var arr = self.data.cardlist;
					for (var i = 0; i < cardInfoData.orders.length; i++) {
						arr.push(cardInfoData.orders[i]);
					}
					self.setData({
						cardlist: arr,
						hasNext: hasNext
					});
				}
			}
    });
  },

  //滚动到底部时触发此函数
  onReachBottom: function (e) {
    //debugger;
    var that = this;
    var pageNo = that.data.pageNo;
    if (that.data.hasNext) {
      console.log(that.data.hasNext+'dadadaa')
      that.data.loadOver = false;
      pageNo++;
      that.setData({
        pageNo: pageNo
      });
      that.ajaxFn();
    }else{
      that.data.loadOver = true;
    }
  },
  bayCardLink: function(){
    var url = '../store/index?page=0'
    wx.reLaunch({
      url: url
    });
  },
  //打开卡详情
  showCardDetails: function () {

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
	onShow() {
		wx.showLoading({
			title: '',
			mask: true
		})
		this.onLoad();
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  },

  //点击选择卡
  selectCardFn: function () {

  },

  /*
 **弹框相关函数
 ** @showflag: boolean, true:打开详情，false:关闭
 */
  detailsFn: function (showflag) {
    var that = this,
      animation = wx.createAnimation({
        //动画持续时间
        duration: 500,
        //定义动画效果，当前是匀速
        timingFunction: 'ease',
        delay: 0,   //动画延迟时间，单位 ms
        transformOrigin: "50% 100% 0"
      });

    that.animation = animation;
    animation.translateY(380).step();

    that.setData({
      animationData: animation.export(),
      // detailsflag: true
    });

    if (showflag == true) {
      that.setData({
        detailsflag: true
      });
    }

    setTimeout(function () {
      animation.translateY(0).step();
      that.setData({
        animationData: animation.export(),
        // detailsflag: false
      });

      if (showflag == false) {
        that.setData({
          detailsflag: false
        });
      }

    }.bind(this), 300);
  },

  //查看详情
  cardDetailsFn: function (e) {
    var that = this,
      cardIndex = e.currentTarget.dataset.index,
      cardlist = that.data.cardlist;

    that.setData({
      popInfo: cardlist[cardIndex]
    });

    that.detailsFn(true);
  },

  //闭关详情
  hideDetailsFn: function () {
    this.detailsFn(false);
  }

})