// pages/my/login.js
var member,
  url = require('../../utils/url.js'),
  sessionID = url.sessionID,
  userInfoUrl = url.userInfoUrl,
  // wxBindPhoUrl = url.wxBindPho,
  wxLoginUrl = url.wxLogin,
  movieCode, //影城编码
  wxLoginPara,  //微信登录参数
  prevPage = ''; //登录页的上一页
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

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
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
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

  //获取用户信息fn
  bindGetUserInfo: function (e) {
    //debugger;
    var that = this,
      userInfo = e.detail,
      encryptedData = userInfo.encryptedData,
      iv = userInfo.iv;
    console.log(userInfo);

    //调用微信登录，获取code值，用来传给后来拿sessionId
    wx.login({
      success: function (res) {
        console.log(res);
        wx.showToast({
          title: '加载中',
          icon: 'loading',
        })
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
            console.log(res);
            var sessionId = res.data.resultData; //从后台获取到的sessionId

            wx.setStorageSync('sessionId', sessionId);

            //从后台拿到的sessionId是用来解密userInfo里的加密数据encryptedData的
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
                console.log(res);
                var data = JSON.parse(res.data.resultData),
                  resultCode = res.data.resultCode,
                  resultDesc = res.data.resultDesc;
                console.log(data);
                // data.language = data.language;
                if (resultCode == '0') {
                  wx.setStorageSync('userData', data);
                  //console.log(data.language);
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
                }
                // console.log(data);
              },
              fail: function (res) {
                var data = res.data,
                  resultCode = data.resultCode;

              }
            });
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
        // loginFlag = true;
        var data = res.data.resultData,
          url = '';

        console.log(data);

        if (data.isBinding == '0') {//如果没有绑定手机号，则进入手动绑定手机号页面
          url = '../login/login';
          //  wx.setStorageSync('member', data); //用来存储跳往绑手机号页的当前页：0：首页，1：个人中心页
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
  }

})