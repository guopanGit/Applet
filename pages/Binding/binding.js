// pages/binding/binding.js
var app = getApp(),
  url = require('../../utils/url.js'),
  URL = url.getVerifyCode,
  loginUrl = url.loginUrl,
  wxBindPhoUrl = url.wxBindPho,
  miniappsLogin = url.miniappsLogin, //获取wx绑定的手机号之后传给后台注册时的url
  updateMemberPhone = url.updateMemberPhone, // 更换手机号
  cinemaCode,
  memberCode,
  phoneNum = '',
  verifyCode, //系统返回的验证码
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
    verifyCode: '',
    time: '获取验证码',
    toastItem: {
      text: 'sucess!',
      toast_visible: !1
    },
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

      getVerifyCodePara = {
        'cinemaCode': cinemaCode,
        'memberPhone': memberPhone,
        'type': 3,
        memberCode: ''
      };

    if (flag == false) {
      wx.showToast({
        title: '一分钟内禁止重复发送获取验证码',
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
                title: '发送成功',
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
      var bindPhoPara = {
        'cinemaCode': cinemaCode,
        'memberPhone': memberPhone,
        'verifyCode': getVerifyCode,
        'memberCode': memberCode,
        'pushId': '',
        'phoneType': '0',
        'vCode': vCode,
        'deviceCode': '小程序',
        'osVersion': vCode,
        'platType': '1'
      };
      var movieCode = wx.getStorageSync('movieCode'),
        cinemaCode = wx.getStorageSync('cinemaCode'),
        memberCode = wx.getStorageSync('memberCode');

      if (!userInfo.unionId) {
        var unionIds = userInfo.openId + movieCode
      }

      bindPhoPara.verifyCode = getVerifyCode;
      bindPhoPara.memberPhone = memberPhone;
      bindPhoPara.cinemaCode = cinemaCode;
      bindPhoPara.memberCode = memberCode;
     
      wx.request({
        url: updateMemberPhone,
        method: 'GET',
        data: bindPhoPara,
        header: {
          'Content-Type': 'text/plain',
          'Accept': 'application/json'
        },
        success: function (res) {
          console.log(res)
          if(res.data.resultCode != '0'){
            wx.showToast({
              title: res.data.resultDesc,
              icon:'none'
            });
            return false
          }


          wx.navigateBack({
            delta:1
          });
        },
        fail: function (res) {

        },
        complete: function () { }
      });
    }
  },
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