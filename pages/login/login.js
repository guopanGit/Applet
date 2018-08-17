// pages/login/login.js
var app = getApp(),
  url = require('../../utils/url.js'),
  URL = url.getVerifyCode,
  loginUrl = url.loginUrl,
  wxBindPhoUrl = url.wxBindPho,
  miniappsLogin = url.miniappsLogin, //获取wx绑定的手机号之后传给后台注册时的url
  cinemaCode,
  memberCode,
  phoneNum = '',
  verifyCode,//系统返回的验证码
  flag = true, //判断是否要发送验证码
  countSs, //获取验证码的倒计时函数
  getWxPhonePara, //获取wx绑定的手机号之后传给后台注册时的para
  vCode; //缓存里的CVersion
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneNum: '',
    // verifyCode: '',
    time: '获取验证码',
    toastItem: {
      text: 'sucess!',
      toast_visible: !1
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    vCode = wx.getStorageSync('CVersion');
    cinemaCode = wx.getStorageSync('cinemaCode');
    memberCode = wx.getStorageSync('memberCode');

    // var that = this,

    // if (memberPhone == ''){
    //     wx.showToast({
    //         title: '请输入手机号码！',
    //     })
    // }
    //关闭转发按钮
    wx.hideShareMenu()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '绑定手机号',
    });
  },
  //获取用户微信帐户绑定的手机号的回调函数
  getPhoneNumber: function (e) {
   if(e.detail.iv == undefined){
    return false
   }
    var data = e.detail,
      userData = wx.getStorageSync('userData'),
       unionids = wx.getStorageSync('unionids');
    if (!unionids) {
      unionids = userData.unionid || ''
    }
    console.log(unionids)
   
    if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
      // wx.showModal({
      // 	title: '提示',
      // 	showCancel: false,
      // 	content: '未授权',
      // 	success: function (res) {}
      // })
    } else {
      getWxPhonePara = {
        iv: data.iv,
        encryptedData: data.encryptedData,
        sessionId: wx.getStorageSync('sessionId'),
        cinemaCode: cinemaCode,
        headimgurl: userData.avatarUrl,
        nickname: userData.nickName,
        sex: userData.gender,
        unionid: unionids,
        pushId: '',
        phoneType: '0',
        vCode: vCode,
        deviceCode: '小程序',
        osVersion: vCode,
        platType: '1',
        loginType: '5', //'6',
        source: '5'  // '6'
      };
       console.log(getWxPhonePara);

      //从后台获取解密后的微信绑定的手机号
      wx.request({
        url: miniappsLogin,
        method: 'GET',
        data: getWxPhonePara,
        header: {
          'Content-Type': 'text/plain',
          'Accept': 'application/json'
        },
        success: function (res) {
      
          console.log(res, '123');
         
          var data = res.data;
          if (data.resultCode == '500') {
            // wx.showToast({
            //   title: data.resultDesc,
            //   icon: 'none',
            //   duration: 3000
            // })
            
          }
          if(data.resultData.isBinding == '0'){
            // wx.showToast({
            //   title: data.resultDesc,
            //   icon: 'none',
            //   duration: 3000
            // })
            return false;
          }
           var member = data.resultData;
          member.openid = userData.openId;
          wx.setStorageSync('member', member); 
          if (data.resultCode == '0' && data.resultData.memberPhone != '' || data.resultData.memberPhone != null || data.resultData.memberPhone != undefined) {
            var indexUrl = '../home/index';
            wx.switchTab({
              url: indexUrl
            });
            // wx.navigateBack({
            //     delta: 1
            // });
          } 
        },
        fail: function (res) {
          console.log(res);
        },
        complete: function (res) {
          console.log(res);
        }
      });
    }


  },

  //获取用户输入的手机号
  phoneChange: function (e) {
    phoneNum = e.detail.value;
    // console.log(phoneNum);
  },

  //获取用户输入的验证码
  codeChange: function (e) {
    // var verifyCode = e.detail.value;

    // this.setData({
    //     verifyCode: verifyCode
    // });

  },

  //点击获取验证码
  getVerifyCodeFn: function (e) {
    var the = this,
      memberPhone = phoneNum,
      
     getVerifyCodePara = { 'cinemaCode': cinemaCode, 'memberPhone': memberPhone, 'type': 3, memberCode: '' };

    if (flag == false) {
      wx.showToast({
        title:'一分钟内禁止重复发送获取验证码',
        icon: 'none'
      });
      return false;
    }
   
    if (memberPhone == '' || memberPhone == undefined) {
      the.setData({
        toastItem: {
          text: '请输入手机号',
          toast_visible: !0
        }
      });
     
      setTimeout(function () {
        the.setData({
          toastItem: {
            toast_visible: !1
          }
        });
      }, 2000);
    } else if (!(/^1\d{10}$/.test(memberPhone))) {
      the.setData({
        toastItem: {
          text: '手机号格式有误，请重新输入',
          toast_visible: !0
        }
      });

      setTimeout(function () {
        the.setData({
          toastItem: {
            toast_visible: !1
          }
        });
      }, 2000);
    } else if (flag) {
      flag = false;
      var ss = 60,
        time = ss + 's';
      the.setData({
        time: time
      });
      countSs = setInterval(function () {
        ss--;
        if (ss < 0) {
          time = '重新获取验证码';
          the.setData({
            time: time
          });
          clearInterval(countSs);
          flag = true;
        } else {
          time = ss + 's';
          the.setData({
            time: time
          });
        }
      }, 1000);

      //获取验证码
      wx.request({
        url: URL,
        method: 'GET',
        data: getVerifyCodePara,
        header: {
          'Content-Type': 'text/plain',
          'Accept': 'application/json'
        },
        success: function (res) {
console.log(res);
          verifyCode = res.data.resultData; //系统返回的验证码
          if (res.data.resultCode == 0) {
            if (verifyCode != '' && verifyCode != undefined) {
              wx.showToast({
                title:'发送成功',
                icon: 'none'
              });
            }
          } else if (res.data.resultCode != 0) {
            wx.showToast({
              title: res.data.resultDesc,
              icon: 'none'
            });
          }
        },
        fail: function (res) {
          // console.log(res);
        },
        complete: function (res) {
          // console.log(res);
        }
      });
    }

    //
  },

  //点击绑定手机号
  bindPhoFn: function (e) {
    var formData = e.detail.value,
      memberPhone = formData.memberPhone,
      getVerifyCode = formData.verifyCode, //用户手动填写的验证码

      userInfo = wx.getStorageSync('userData');
    // deviceCode = '' + memberPhone
    console.log(userInfo+ '123')
    if (getVerifyCode == '') {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      });
    } else if (memberPhone == '' || memberPhone == undefined) {
      wx.showToast({
        title: '请输入手机号',
      });
    } else {
      var bindPhoPara = { 'cinemaCode': cinemaCode, 'memberPhone': memberPhone, 'pushId': '', 'phoneType': '0', 'vCode': vCode, 'deviceCode': '小程序', 'osVersion': vCode, 'platType': '1' };
    var  movieCode = wx.getStorageSync('movieCode');
      if (!userInfo.unionId){
        var unionIds = userInfo.openId + movieCode
      }
      bindPhoPara.city = userInfo.city;
      bindPhoPara.country = userInfo.country;
      bindPhoPara.headimgurl = userInfo.avatarUrl;
      bindPhoPara.language = userInfo.language;
      bindPhoPara.nickname = userInfo.nickName;
      bindPhoPara.openid = userInfo.openId;
      bindPhoPara.province = userInfo.province;
      bindPhoPara.sex = userInfo.gender;
      bindPhoPara.unionid = userInfo.unionId || unionIds;
      bindPhoPara.verifyCode = getVerifyCode;
      bindPhoPara.companyCode = wx.getStorageSync('movieCode');
      bindPhoPara.OS = wx.getStorageSync('OS');
      bindPhoPara.CVersion = wx.getStorageSync('CVersion');
      bindPhoPara.source = '5';
      console.log(bindPhoPara.unionid)
      

      wx.request({
        url: wxBindPhoUrl,
        method: 'GET',
        data: bindPhoPara,
        header: {
          'Content-Type': 'text/plain',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log(res);
          var data = res.data,
            url = '';

          if (data.resultCode == '0') {
            data.resultData.openid = userInfo.openId;
            wx.setStorageSync('member', data.resultData);
            url = '../home/index';
            wx.switchTab({
              url: url
            });
            // wx.navigateBack({
            //     delta: 1
            // });
          } else {
            var msg = data.resultDesc;
            wx.showModal({
              title: '提示',
              content: msg,
              success: function () {
                //点击确定
              }
            });
          }
        },
        fail: function (res) {
          var data = res.data,
            msg = data.resultDes;
        },
        complete: function () { }
      });
    }
  },
  //点击登录
  /*loginFn: function (e) {
      var formData = e.detail.value,
          memberPhone = formData.memberPhone,
          verifyCode = formData.verifyCode,
          getVerifyCode = this.data.verifyCode;

      if (verifyCode == '') {
          wx.showToast({
              title: '请输入验证码！',
          })
      } else if (getVerifyCode == verifyCode) {
          var loginPara = {
              'memberCode': memberCode, 'cinemaCode': cinemaCode, 'memberPhone': memberPhone, 'verifyCode': verifyCode, 'pushId': '1', 'phoneType': '1', 'vCode': '1.0', 'deviceCode': '1', 'osVersion': '1', 'platType': '1', 'RFB': false
          };

          //登录 
          wx.request({
              url: loginUrl,
              method: 'GET',
              data: loginPara,
              header: {
                  'Content-Type': 'text/plain',
                  'Accept': 'application/json'
              },
              success: function (res) {
                  var data = res.data.resultData;
                  console.log(res);
                  wx.redirectTo({
                      url: '../home/index',
                  });
                  wx.setStorageSync('member', data);
              }
          });
      } else {
          wx.showToast({
              title: '验证码输入错误，请重新输入！',
          })
      }

      
  }, */
  //form reset
  formReset: function () {
    // console.log('form发生了reset事件')
  },

  //页面隐藏
  onHide: function () {
    clearInterval(countSs);
    flag = true;
  },

  //页面展示
  // onShow: function () {
  //   phoneNum = phoneNum;
    
  // }
});