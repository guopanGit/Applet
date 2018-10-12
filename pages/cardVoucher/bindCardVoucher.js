// pages/confirmOrder/chooseCard.js
var url = require('../../utils/url.js'),
    bindCardUrl = url.bindCard,
    bindVoucherUrl = url.bindVoucher,
    bindCardPara,
    // bindVoucherPara,
    movieCode,
    cinemaCode,
    member;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        page: 0,
       Shield:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var self = this;
        movieCode = wx.getStorageSync('movieCode');
        cinemaCode = wx.getStorageSync('cinemaCode');
        member = wx.getStorageSync('member');
       var movieCode = movieCode;

       if (movieCode == '9408883aa1624466b6e0feea94773051') {

        this.setData({
          Shield: true
        });
       }
        
        //绑线下卡所需的参数
        // bindCardPara = { 'companyCode': movieCode, 'cinemaCode': cinemaCode, 'memberCode': member.memberCode, 'cardNo': '', 'cardPassword': '', 'inviteCode': ''};
        //绑线下券所需的参数
        // bindVoucherPara = { 'companyCode': movieCode, 'cinemaCode': cinemaCode, 'memberCode': member.memberCode, 'voucherNo': '', 'bindPsw': '', 'inviteCode': '' };

    },

     /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
      movieCode = wx.getStorageSync('movieCode');
      var movieCode = movieCode;
      if (movieCode == '9408883aa1624466b6e0feea94773051') {
        wx.setNavigationBarTitle({
          title: '绑券',
        });
      } else{
        wx.setNavigationBarTitle({
          title: '绑卡券',
        });
      }
       
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

    //切换卡券绑定
    changeNav:function (e){
        var _this = this,
            target = e.currentTarget.dataset,
            pageIndex = target.index,
            page = 0;

        if (pageIndex == 1){
            page = 1;
        }

        _this.setData({
            page: page
        });
    },

    //form reset
    formReset: function () {
        // console.log('form发生了reset事件')
    },

    bindFn:function(e){
        var self = this,
            formData = e.detail.value,
            cardNo = formData.cardNo, //page=0时cardNo是券号，page=1时cardNo是卡号
            cardPsw = formData.cardPsw, //page=0时cardNo是券密码，page=1时cardNo是卡密码
            inviteCode = formData.inviteCode,  //page=0时cardNo是券邀请码，page=1时cardNo是邀请码
            page = self.data.page,
            url = '',
            sucLinkUrl = '';
            // paraObj;

        if (cardNo == ''){
            var cardNullHint = (page == 0) ? '请输入券号' : '请输入卡号'
            wx.showToast({
                title: cardNullHint,
            });
            return false;
        }

        if (cardPsw == ''){
            var pswNullHint = (page == 0) ? '请输入券密码' : '请输入卡密码'
            wx.showToast({
                title: pswNullHint,
            });
            return false;
        }

        if(page == 0){
            url = bindVoucherUrl;
            bindCardPara = { 'companyCode': movieCode, 'cinemaCode': cinemaCode, 'memberCode': member.memberCode, 'voucherNo': cardNo, 'bindPsw': cardPsw, 'inviteCode': inviteCode }
        } else {
            url = bindCardUrl;
            bindCardPara = { 'companyCode': movieCode, 'cinemaCode': cinemaCode, 'memberCode': member.memberCode, 'cardNo': cardNo, 'cardPassword': cardPsw, 'inviteCode': inviteCode }
        }

        wx.request({
            url: url,
            method: 'GET',
            data: bindCardPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                console.log(res);
                var resultCode = res.data.resultCode;
                if (resultCode == 0) {
                    wx.showModal({
                        title: '提示',
                        content: "绑定成功",
                        cancelText: '确定',
                        confirmText:'去查看',
                        success: function (res) {
                            if (res.confirm) {
                                console.log('用户点击去查看');
                                if(page == 0) {
                                    sucLinkUrl = 'voucherList';
                                } else {
                                    sucLinkUrl = 'cardList';
                                }
                                wx.redirectTo({
                                    url: sucLinkUrl
                                })
                            } else if (res.cancel) {
                                console.log('用户点击确定');
                                self.setData({
                                    cardNo: '',
                                    cardPsw: '',
                                    inviteCode: ''
                                });
                            }
                        }
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.data.resultDesc,
                        success: function (res) {
                        }
                    });
                }
            },
            fail:function(res){}, 
            complete:function(res){}
        });
    },
})