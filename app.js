//app.js
import temp from 'template/temp';

var configJson = require('utils/bin.js').config,
  url = require('utils/url.js'),
  utils = require('./utils/util'),
  wxLoginUrl = url.wxLogin,
  appId = configJson.appId,
  AppSecret = configJson.AppSecret,
  wxLoginPara = {};
App({
  onLaunch: function(options) {
    let thit = this;
    // // console.log('App Launch')
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
  getUserInfo: function(cb) {
    var that = this;
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function(res) {
          if (res.code) {
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
              success: function(res) {
                //success
                var pc = new WXBizDataCrypt(appId, res.data.session_key);
                wx.getUserInfo({
                  success: function(res) {
                    // console.log(res , "iv")                                       
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
              fail: function() {},
              complete: function() {}
            });
          }
        }
      });
    }
  },

  //wx login
  wxLoginfn: function(e) {
    var that = this;
    wx.request({
      url: wxLoginUrl,
      method: 'GET',
      data: wxLoginPara,
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      success: function(res) {
        var data = res.data.resultData;
        wx.setStorageSync('member', data);

        if (data.isBinding == '0') {
          var url = 'pages/login/login';
          wx.navigateTo({
            url: url
          });
        }

      },
      fail: function() {},
      complete: function() {}
    })
  },

	onShow: function (options) {
		wx.setStorageSync('scenc', options.scene);
		console.log(options.scene)
		const _this = this;
	if (options.scene == 1011 && options.query.q) {
			let url = decodeURIComponent(options.query.q);
			url = url.substring(url.indexOf('?') + 1).split('&');
			let cinemaCode = url[1];
			let cinemaName = url[2];
			let companyCode = url[3];
			let hallCode = url[4];
			let movie = url[5];
			let row = url[6];
			let seat = url[7];
			cinemaCode = _this.getCaption(cinemaCode);
			cinemaName = _this.getCaption(cinemaName);
			companyCode = _this.getCaption(companyCode);
			hallCode = _this.getCaption(hallCode);
			movie = _this.getCaption(movie);
			row = _this.getCaption(row);
			seat = _this.getCaption(seat);
			wx.setStorageSync('cinemaCode', cinemaCode);
			wx.setStorageSync('cinemaName', cinemaName);
			wx.setStorageSync('companyCode', companyCode);
			wx.setStorageSync('hallCode', hallCode);
			wx.setStorageSync('movie', movie);
			wx.setStorageSync('row', row);
			wx.setStorageSync('seat', seat);
		}
	},
  onHide: function() {	
	
  },
  globalData: {
    userInfo: null,
    // url: 'http://101.201.210.244:8081/yinghe-app'
    // movieCode: '7f8ceeed9182403796eef0de0bf8748c'
  },
	//  截取url中的参数
	getCaption(obj) {
		var index = obj.indexOf("=");
		obj = obj.substring(index + 1, obj.length);
		return obj;
	},
  //通过scope来引入weToast函数
  weToast: (scope) => new weToast(scope)
});