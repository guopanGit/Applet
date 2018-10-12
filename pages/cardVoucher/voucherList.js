// pages/confirmOrder/chooseCard.js
var url = require('../../utils/url.js'),
    getVoucherListUrl = url.getvouchers,
    member,
    memberCode,
    movieCode,
    cinemaCode,
    voucherListPara;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        detailsflag: false,
        voucherList: [],
        pageNo: 1,
        hasNext: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;

        member = wx.getStorageSync('member');
        memberCode = member.memberCode;
        movieCode = wx.getStorageSync('movieCode');
        cinemaCode = wx.getStorageSync('cinemaCode');
        voucherListPara = { 'companyCode': movieCode, 'memberCode': memberCode, 'cinemaCode': cinemaCode, 'pageNo': that.data.pageNo, 'voucherType': '-1', };
        that.ajaxFn();
    },

    ajaxFn:function(){
        var self = this;

        wx.request({
            url: getVoucherListUrl,
            method: 'GET',
            data: voucherListPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                console.log(res);
                var data = res.data,
                    resultCode = data.resultCode,
                    resultData = data.resultData,
                    hasNext = resultData.hasNext,
                    pageNo = self.data.pageNo,
                    vouherCount = resultData.vouherCount;
                if (pageNo == 1){
                  self.setData({
                    voucherList: resultData.vouchers,
                    vouherCount: vouherCount,
                    hasNext: hasNext
                  });
                }
                if(pageNo > 1){
                  var list = self.data.voucherList;
                  for (var i = 0; i < resultData.vouchers.length;i++){
                    list.push(resultData.vouchers[i]);
                  }
                  self.setData({
                    voucherList: list,
                    vouherCount: vouherCount,
                    hasNext: hasNext
                  });
                }
                
            },
            fail:function(res){},
            complete: function(){}
        });
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

    //展示券详情
    showDetails: function(e){
        var that = this,
            voucherIndex = e.currentTarget.dataset.cindex,
            voucherList = that.data.voucherList;

        that.setData({
            popContent: voucherList[voucherIndex]
        });

        that.detailsFn(true);  
    },

    //关闭券详情
    hideDetailsFn:function(){
        this.detailsFn(false);
    },

     /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        wx.setNavigationBarTitle({
            title: '优惠券',
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
    onReachBottom: function (e) {
      var that = this;
      var pageNo = this.data.pageNo;
      if (that.data.hasNext) {
        pageNo++;
        that.setData({
          pageNo: pageNo
        });
        that.ajaxFn();
      }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
    }
})