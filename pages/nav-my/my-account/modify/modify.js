// 重设支付密码

import {
  showToast,
  ajaxPromise
} from "../../../../utils/util.js";

import {URL} from "../../../../utils/config.js";

const {
  resetPwd,
  verifyCodeByPhone
} = URL || '';


Page({

  /**
   * 页面的初始数据
   */
  data: {
    time: '获取验证码',
    resultCode: 0,
    verify: '',
    phone: '',
    pwd: '',
    pwdNew: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: '重设支付密码',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  // 获取是输入的手机号
  bindKeyPhone(e) {
    let phone = e.detail.value;
    let time = this.data.time;
    this.setData({
      phone,
    })
    if (time != '获取验证码') {
      this.setData({})
    }
  },
  // 判断手机号获取验证码
  getVerify() {
    let phonetel = /^1[23456789]\d{9}$/;
    let memberPhone = this.data.phone;
    let time = this.data.time;
    let resultCode = this.data.resultCode;

    if (time !== '获取验证码') {
      showToast('一分钟内禁止再次获取验证码')
      return
    }
    if (memberPhone == '') {
      let title = '手机号不能为空';
      showToast(title)
      return
    }
    if (!phonetel.test(memberPhone)) {
      let title = '手机号格式错误，请重新输入';
      showToast(title)
      return
    }
    if (memberPhone.length < 11) {
      let title = '手机号格式错误，请重新输入';
      showToast(title)
      return
    }
    ajaxPromise(true, verifyCodeByPhone, {
      memberPhone
    })
      .then((res) => {
        this.timer()
        showToast('验证码发送成功')
      })
      .catch(() => {
      })
  },
  // 获取输入的验证码
  bindKeyVerify(e) {
    let verify = e.detail.value;
    this.setData({
      verify
    })
  },
  // 获取第一次密码
  bindKeyPwd(e) {
    let pwd = e.detail.value;
    this.setData({
      pwd
    })
  },

  // 第一次密码失去焦点
  bindKeyOver() {
    let pwd = this.data.pwd;
    let isIdentical = /^(\d)\1+$/;
    let decrement = new RegExp("(?:(?:0(?=1)|1(?=2)|2(?=3)|3(?=4)|4(?=5)|5(?=6)|6(?=7)|7(?=8)|8(?=9)){5}|(?:9(?=8)|8(?=7)|7(?=6)|6(?=5)|5(?=4)|4(?=3)|3(?=2)|2(?=1)|1(?=0)){5})\\d");
    let txt = '为确保您的账号安全请不要设置简单密码，请重新设置密码'
    if (pwd.length < 6 && pwd.length >= 1) {
      showToast('密码不能少于6位')
      return
    } else if (pwd == '') {
      showToast('密码不能为空')
      return
    } else if (isIdentical.test(pwd)) {
      showToast(txt);
      return
    }
    if (decrement.test(pwd)) {
      showToast(txt)
      return
    }

  },

  // 获取第二次密码
  bindKeyPwdNew(e) {
    let pwdNew = e.detail.value;
    this.setData({
      pwdNew
    })
  },
  // 点击确定
  modification() {
    let isIdentical = /^(\d)\1+$/;
    let decrement = new RegExp("(?:(?:0(?=1)|1(?=2)|2(?=3)|3(?=4)|4(?=5)|5(?=6)|6(?=7)|7(?=8)|8(?=9)){5}|(?:9(?=8)|8(?=7)|7(?=6)|6(?=5)|5(?=4)|4(?=3)|3(?=2)|2(?=1)|1(?=0)){5})\\d");
    let text = '为确保您的账号安全请不要设置简单密码，请重新设置密码';
    let {
      phone,
      pwdNew,
      pwd,
      verify
    } = this.data;

    if (decrement.test(pwd)) {
      this.setData({
        pwd: '',
        pwdNew: '',
      })
      showToast(text)
      return
    }
    if (phone == '') {
      showToast('请输入手机号')
      return
    } else if (phone.length < 11) {
      showToast('手机号格式错误，请重新输入')
      return
    } else if (verify == '') {
      showToast('请输入验证码')
      return
    } else if (pwdNew != pwd) {
      showToast('密码不一致，请重新设置密码')
      this.setData({
        pwd: '',
        pwdNew: '',
      })
      return
    }
    if (pwd.length < 6 && pwd.length >= 1) {
      showToast('密码不能少于6位');
      this.setData({
        pwd: '',
        pwdNew: '',
      })
      return
    }
    if (isIdentical.test(pwd)) {
      showToast(text);
      this.setData({
        pwd: '',
        pwdNew: '',
      })
      return
    }
    ajaxPromise(true, resetPwd, {
      newPassword: pwd,
      pushId: verify,
      type: '1'
    })
      .then((res) => {
        showToast('重设成功')
        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
          })
        }, 2000)
      })
      .catch(() => {
      })

  },

  // 定时器
  timer() {
    const that = this;
    let times = 60;
    let time = setInterval(() => {
      if (times > 1) {
        times--;
        that.setData({
          time: `${times}S`
        })
      } else {
        clearInterval(time);
        that.setData({
          time: '获取验证码',
        })
      }
    }, 1000)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  }
})
