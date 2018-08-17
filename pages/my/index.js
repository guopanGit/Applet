/* my:index.js  */
var member,
    url = require('../../utils/url.js'),
    app = getApp(),
    sessionID = url.sessionID,
    userInfoUrl = url.userInfoUrl,
    wxBindPhoUrl = url.wxBindPho,
    wxLoginUrl = url.wxLogin,
    movieCode, //影城编码
    wxLoginPara;  //微信登录参数
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userName: '',
        memberHead: '',
        loginflag: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var self = this;
        self.loadFn();
    },

    loadFn:function(){
        var _this = this;

        member = wx.getStorageSync('member');
        movieCode = wx.getStorageSync('movieCode');
        var loginflag,
          memberCode = member.memberCode,
          memberPhone = member.memberPhone;


        if ((memberPhone == '' || memberPhone == null || memberPhone == undefined) && (memberCode == undefined || memberCode == '' || memberCode == null)) {
            loginflag = false;
            _this.setData({
                loginflag: loginflag
            });
            return false;
        } else {
            loginflag = true;
        }
        var memberHead = member.memberHeadImgNew;

        // console.log(member);

        var memberName = member.memberName,
            userName = memberName;
        if (memberName == '' || memberName == null || memberName == undefined) {
          userName = member.resultData.nickname
        }

        _this.setData({
            userName: userName,
            memberHead: memberHead,
            loginflag: loginflag
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        wx.setNavigationBarTitle({
            title: '个人中心'
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var self = this;
        self.loadFn();
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
    
    //login
    loginFn: function(){
        wx.navigateTo({
            url: '../getUserInfo/login',
        });
    },

    //退出登录
    quitOutFn:function(){
        var that = this;
        wx.showModal({
            title: '提示',
            content: '确定要退出登录吗？',
            success: function (res) {
                if (res.confirm) { //用户点击确定
                  wx.setStorageSync('member', '');
                    
                  // try {
                  //   wx.removeStorageSync('member')
                  // } catch (e) {
                  //   // Do something when catch error
                  // }

                    var page = getCurrentPages().pop();
                    console.log(page);
                    if (page == undefined || page == null) { return false; }
                    page.onShow();  
                } else if (res.cancel) { //用户点击取消
                }
            }
        });
            
    },
  /*  loginFn: function (cb) {
        var that = this;
        if (app.globalData.userInfo) {
            typeof cb == "function" && cb(app.globalData.userInfo)
        } else {
            //调用登录接口
            wx.login({
                success: function (res) {
                    // console.log(res.code);

                    wx.request({
                        url: sessionID,
                        method: 'GET',
                        data: {
                            js_code: res.code,
                            movieCode: movieCode
                        },
                        header: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            'Accept': 'application/json'
                        },
                        success: function (res) {
                            // console.log(res);
                            var sessionId = res.data.resultData;

                            wx.setStorageSync('sessionId', sessionId);

                            wx.getUserInfo({
                                success: function (res) {
                                    // console.log(res);
                                    var encryptedData = res.encryptedData,
                                        iv = res.iv;

                                    wx.request({
                                        url: userInfoUrl,
                                        method: 'GET',
                                        data: {
                                            encryptedData: encryptedData,
                                            iv: iv,
                                            sessionId: sessionId
                                        },
                                        header: {
                                            "Content-Type": "application/x-www-form-urlencoded",
                                            'Accept': 'application/json'
                                        },
                                        success: function (res) {
                                            var data = JSON.parse(res.data.resultData),
                                                resultCode = res.data.resultCode,
                                                resultDesc = res.data.resultDesc;
                                            if (resultCode == '0') {
                                                wx.setStorageSync('userData', data);

                                                wxLoginPara = {
                                                    city: data.city,
                                                    country: data.country,
                                                    companyCode: movieCode,
                                                    headimgurl: data.avatarUrl,
                                                    language: data.language,
                                                    nickname: data.nickName,
                                                    openid: data.openId,
                                                    province: data.province,
                                                    sex: data.gender,
                                                    unionid: data.unionId,
                                                    loginType: '6',
                                                    source: '6'
                                                };

                                                that.wxLoginfn();
                                            } else {
                                                wx.showModal({
                                                    title: '提示',
                                                    content: resultDesc,
                                                    showCancel: false,
                                                    confirmText: '知道了',
                                                    success: function (res) {
                                                        if (res.confirm) {
                                                            // console.log('用户点击确定')
                                                        }
                                                    }
                                                });
                                            }
                                            // console.log(data);
                                        },
                                        fail: function (res) {
                                            var data = res.data,
                                                resultCode = data.resultCode;

                                        }
                                    })

                                    // var data = pc.decryptData(res.encryptedData, res.iv);
                                    // console.log('解密后 data: ', data);


                                },
                            })
                        },
                        fail: function (res) { },
                        complete: function (res) { }
                    });

                }
            });
        }
    }, */

    //wx login
    /*wxLoginfn:function(src){
        var that = this;

        wx.request({
            url: wxLoginUrl, //wxCheckLogin
            method: 'GET',
            data: wxLoginPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                // loginFlag = true;
                var data = res.data.resultData,
                    url = '';

                console.log(data)

                if (data.isBinding == '0') {//如果没有绑定手机号，则进入手动绑定手机号页面
                    url = '../login/login';
                    // wx.setStorageSync('member', data); //用来存储跳往绑手机号页的当前页：0：首页，1：个人中心页
                    wx.redirectTo({
                        url: url
                    });
                } else { //如果已经绑定了手机号，则更新缓存里member的数据
                    wx.setStorageSync('member', data);
                    // url = '../my/my';
                    if (src == '../my/my') {
                        wx.redirectTo({
                            url: src,
                        });
                    } else {
                        wx.navigateTo({
                            url: src,
                        });
                    }
                }
            },
            fail: function () {},
            complete: function () {}
        });
    },*/

    //linkFn
    linkFn:function(e){
        var self = this,
            target = e.currentTarget.dataset,
            linkflag = target.linkflag,
            url = '';
        
        if (linkflag == 'link_01') {
            url = 'my';
        } else if(linkflag == 'link_02') {
            url = '../cardVoucher/cardList';
        } else if(linkflag == 'link_03') {
            url = '../cardVoucher/voucherList';
        } else {
            url = '../cardVoucher/bindCardVoucher';
        }

        wx.navigateTo({
            url: url
        })
    },   

});