// pages/my/login.js
var member,
  url = require('../../utils/url.js'),
  sessionID = url.sessionID,
  userInfoUrl = url.userInfoUrl,
  // wxBindPhoUrl = url.wxBindPho,
  wxLoginUrl = url.wxLogin,
  movieCode, //影城编码
  wxLoginPara, //微信登录参数
  prevPage = ''; //登录页的上一页
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    prevPage = wx.getStorageSync('prevPage');
    movieCode = wx.getStorageSync('movieCode');
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () { },

  //获取用户信息fn
  bindGetUserInfo: function (e) {
     console.log(e)
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 3000
    });

    var that = this;
    wx.login({
      success: function (res) {
        // console.log(res, 999);       

        //用拿到的code，从后台获取sessionId
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
            // console.log(res.data.resultData);
            // console.log(res.data.resultData);
            var sessionId = res.data.resultData; //从后台获取到的sessionId
            wx.setStorageSync('sessionId', sessionId);

            //从后台拿到的sessionId是用来解密userInfo里的加密数据encryptedData的
            wx.getUserInfo({
              success: function(msg){
                // console.log(msg);
                var encryptedData = msg.encryptedData,
                    iv = msg.iv;
                wx.request({
                  url: userInfoUrl,
                  method: 'POST',
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
                    // console.log(res, 1234);
                    var data = JSON.parse(res.data.resultData),
                      resultCode = res.data.resultCode,
                      resultDesc = res.data.resultDesc;
                    // console.log(data);           
                    if (data == null) {
                      wx.showToast({
                        title: '网络缓慢，请重试',
                        icon: 'none',
                        duration: 2000
                      });
                      return false;
                    }
                    if (resultCode == '500') {
                      wx.showToast({
                        title: resultDesc,
                        icon: 'none',
                        duration: 3000
                      });
                      return false;
                    }
                    //// console.log(data, 'openid')
                    // data.language = data.language;
                    if (resultCode == '0') {
                      wx.setStorageSync('userData', data);

                      if (data.unionId) {
                        var unionids = data.unionId
                      } else {
                        var unionids = data.openId + movieCode
                      }
                      wx.setStorageSync('unionids', unionids)

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
                        unionid: unionids,
                        loginType: '5', //'6',
                        source: '5' //'6'
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
                      return false
                    }
                    // console.log(data);
                  },
                  fail: function (res) {
                    var data = res.data,
                      resultCode = data.resultCode;
                  }
                });
              }
            })
            
          }
        });
      }
    });
  },

  //wx login
  wxLoginfn: function () {
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
        // console.log(res)     
        if (res.data.resultCode == '500') {
          //  // console.log(12132)
          // wx.showToast({
          //   title: "",
          //   icon: 'none',
          //   duration: 2000
          // });
          return false
        }
        // if (res.data.resultCode == '0'){
        //    wx.showToast({
        //      title: res.data.resultDesc,
        //      icon: 'none',
        //      duration: 2000
        //    })
        // }
        //// console.log(res, 123);
        // loginFlag = true;
        var data = res.data.resultData,
          url = '';

        //// console.log(data.unionid);
        if (data.isBinding == '0') { //如果没有绑定手机号，则进入手动绑定手机号页面
          url = '../login/login';
          wx.setStorageSync('member', data); //用来存储跳往绑手机号页的当前页：0：首页，1：个人中心页
          wx.redirectTo({
            url: url
          });
        } else { //如果已经绑定了手机号，则更新缓存里member的数据
          wx.setStorageSync('member', data);
          wx.navigateBack({
            delta: 1
          });
        }
      },
      fail: function () { },
      complete: function () { }
    });
  },
})