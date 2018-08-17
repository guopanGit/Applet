//app.js
import temp from 'template/temp';

var configJson = require('utils/bin.js').config,
	url = require('utils/url.js'),
    wxLoginUrl = url.wxLogin,
	appId = configJson.appId,
	AppSecret = configJson.AppSecret,
    wxLoginPara = {};
App({
    onLaunch: function () {
        // console.log('App Launch')
        //调用API从本地缓存中获取数据
        var logs = wx.getStorageSync('logs') || [];
        logs.unshift(Date.now());

		var movieCode = configJson.movieCode;
        //调用API从进行数据的本地缓存
        wx.setStorageSync('logs', logs);
        wx.setStorageSync('movieCode', movieCode); 
        wx.setStorageSync('CVersion', '2.6.1');
        wx.setStorageSync('OS', 'IOS');

    },
    getUserInfo:function(cb){
        var that = this;
        if(this.globalData.userInfo){
            typeof cb == "function" && cb(this.globalData.userInfo)
        }else{
            //调用登录接口
            wx.login({
                success: function (res) {
                    if(res.code){
                        //发起网络请求
                        wx.request({
                            url: 'https://api.weixin.qq.com/sns/jscode2session',
                            method: 'GET',
                            data: {
                                js_code: res.code,
                                appid: appId,
                                secret: AppSecret,
                                grant_type: 'authorization_code'
                            },
                            header: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                'Accept': 'application/json'
                            },
                            success: function (res) {
                                //success
                                var pc = new WXBizDataCrypt(appId, res.data.session_key);
                                wx.getUserInfo({
                                    success: function (res) { 
                                      console.log(res , "iv")                                       
                                        var data = pc.decryptData(res.encryptedData, res.iv);

                                        wx.setStorageSync('userData', data);

                                        wxLoginPara.city = data.city;
                                        wxLoginPara.country = data.country;
                                        wxLoginPara.headimgurl = data.avatarUrl;
                                        wxLoginPara.language = data.language;
                                        wxLoginPara.nickname = data.nickName;
                                        wxLoginPara.openid = data.openId;
                                        wxLoginPara.province = data.province;
                                        wxLoginPara.sex = data.gender;
                                        wxLoginPara.unionid = data.unionId;

                                        that.wxLoginfn();
                                    },
                                })
                            },
                            fail: function () {},
                            complete: function () {}
                        });
                    }
                }
            });
        }
    },

    //wx login
    wxLoginfn: function (e) {
        var that = this;
        wx.request({
            url: wxLoginUrl,
            method: 'GET',
            data: wxLoginPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                var data = res.data.resultData;
                wx.setStorageSync('member', data);

                if (data.isBinding == '0') {
                    var url = 'pages/login/login';
                    wx.navigateTo({
                        url: url
                    });
                }

            },
            fail: function () {},
            complete: function () {}
        })
    }, 

    onShow: function () {
    // console.log('App Show')
    },
    onHide: function () {
    console.log('App Hide')
    },
    globalData:{
        userInfo:null,
        // url: 'http://101.201.210.244:8081/yinghe-app'
        // movieCode: '7f8ceeed9182403796eef0de0bf8748c'
    },

    //通过scope来引入weToast函数
    weToast: (scope) => new weToast(scope)
});