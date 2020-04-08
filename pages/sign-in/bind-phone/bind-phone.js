/**
 * 导入封装函数
 */

import {
  ajaxPromise,
  showToast,
  uuid
} from '../../../utils/util.js';

import {
  URL
} from '../../../utils/config.js';

const {
  bindPhone,
  getVerifyCode,
  quickBinding,
  getPhoneCode,
  updatePhone
} = URL || '';


const app = getApp();

let timer = app.globalData.timer;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    verifyVal: '',
    inviteVal: '',
    phoneVal: '',
    showCode: true,
    verifyText: '获取验证码',
    btnText: '验证后绑定新手机号',
    source: 0,
    status: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
    let source = options.source || 0;
    let phone = wx.getStorageSync('member').phone;
    let phoneVal = phone.substr(0, 3) + '****' + phone.substr(7);
    if (source == 1) {
      this.setData({
        phoneVal,
        source,
        btnText: '验证后绑定新手机号'
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    let title = '绑定手机号';
    let source = this.data.source;
    if (source == 1) {
      title = '身份验证'
    }
    wx.setNavigationBarTitle({
      title
    });
  },

  /**
   *
   * @param {e} 监听手机输入
   */
  inputVal(e) {
    let inputVal = e.detail.value;
    let inputType = e.target.dataset.type;
    let reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
    if (reg.test(inputVal)) {
      this.setData({
        clearVal: ""
      })
      showToast('输入格式错误,请输入数字');
      return
    }
    if (inputType == '1') {
      this.setData({
        phoneVal: inputVal
      })
    } else if (inputType == '2') {
      this.setData({
        verifyVal: inputVal
      })
    } else if (inputType == '3') {
      this.setData({
        inviVal: inputVal
      })
    }
  },

  /**
   * 倒计时
   */
  count() {
    let second = 60;
    let status = this.data.status;
    this.setData({
      countTime: second,
      countTimes: second,
      showCode: false
    })
    timer = setInterval(() => {
      second--;
      if (second < 0) {
        this.setData({
          showCode: true,
          verifyText: '重新获取'
        })
        clearInterval(timer);
      } else {
        if (status) {
          this.setData({
            countTimes: second,
            showCode: false
          })
        } else {
          this.setData({
            countTime: second,
            showCode: false
          })
        }
      }
    }, 1000);
  },

  /**
   * 获取验证码
   */
  getVerifyCode() {
    let phoneVal = this.data.phoneVal;
    if (phoneVal) {
      let source = this.data.source;
      // 发送验证码
      if (source == 0) {
        ajaxPromise(false, getVerifyCode, {
          memberPhone: this.data.phoneVal,
          type: 3,
        })
          .then((res) => {
            this.verifyCodeCall(res)
          })
          .catch(() => {
          })
      } else {
        let params = {
          operateType: '1',
          memberPhone: wx.getStorageSync('member').phone
        };
        let status = this.data.status;
        if (status) {
          params.operateType = '2';
          params.memberPhone = phoneVal;
        }
        ajaxPromise(false, getPhoneCode, params)
          .then((res) => {
            this.verifyCodeCall(res)
          })
          .catch(() => {
          })
      }
    } else {
      showToast('请输入手机号');
    }
  },

  /**
   * 获取验证码成功回调
   */
  verifyCodeCall(res) {
    if (res.resultCode == '0') {
      showToast('验证码发送成功');
      this.count();
    }
  },

  /**
   *
   * @param {val} 点击绑定
   */
  binding() {
    if (this.data.phoneVal) {
      if(!(/^1[3456789]\d{9}$/.test(this.data.phoneVal))){
        showToast("请输入正确的手机号");
        return;
      }
      if(this.data.verifyVal.length == 0){
        showToast('请输入验证码');
        return;
      }
      if (this.data.verifyVal.length < 4) {
        showToast('验证码不正确');
        return;
      }
      let member = wx.getStorageSync('member');
      let deviceCode = uuid();
      let anonymousId = uuid();
      ajaxPromise(true, bindPhone, {
        memberPhone: this.data.phoneVal,
        verifyCode: this.data.verifyVal,
        inviteCode: this.data.inviVal ? this.data.inviVal : '',
        openid: member.openid,
        province: member.province,
        unionid: member.unionId,
        city: member.city,
        language: member.language,
        country: member.country,
        headimgurl: member.avatar,
        nickname: member.nickName,
        sex: member.gender,
        deviceCode,
        anonymousId,
        pushId: '',
        vCode: '',
        osVersion: '',
        phoneType: '0',
        platType: '1',
        source: '5',
        loginType: '5',
      })
        .then((res) => {
          this.bindingCall(res)
        })
        .catch(() => {
        })
    } else {
      if (!this.data.phoneVal) {
        showToast('请输入手机号');
        return
      }
      if (!this.data.verifyVal) {
        showToast('请输入验证码');
      }
    }
  },

  /**
   *
   * @param {e} 一键绑定微信返回参数
   */
  getPhoneNumber(e) {
    //  console.log(e);
    if (e.detail.iv) {
      let member = wx.getStorageSync('member');
      let deviceCode = uuid();
      let anonymousId = uuid();
      ajaxPromise(true, quickBinding, {
        iv: e.detail.iv,
        encryptedData: e.detail.encryptedData,
        headimgurl: member.avatar,
        nickname: member.nickName,
        sex: member.gender,
        unionid: member.unionId,
        sessionId: member.sessionId,
        deviceCode: deviceCode,
        anonymousId: anonymousId,
        osVersion: wx.getStorageSync('CVersion'),
        pushId: '',
        phoneType: '0',
        vCode: '',
        platType: '1',
        loginType: '5',
        source: '5'
      })
        .then((res) => {
          this.bindingCall(res)
        })
        .catch(() => {
        })
    }
  },

  /**
   *
   * @param {res} 绑定成功回调
   */
  bindingCall(res) {
    if (res.resultCode == '0') {
      // console.log(res);
      let member = wx.getStorageSync('member');
      member.memberCode = res.resultData.memberCode;
      member.phone = res.resultData.memberPhone;
      member.token = res.resultData.token;
      member.nickName = res.resultData.memberName;
      member.avatar = res.resultData.memberHeadImgNew;
      wx.setStorageSync('member', member); // 更新缓存
      wx.navigateBack({
        delta: 1
      });
    }
  },

  /**
   * 验证身份
   */
  bindChange(e) {
    let {
      status,
      verifyVal,
      phoneVal
    } = this.data;
    if (verifyVal == '') {
      showToast('请输入验证码')
      return
    }
    let params = {
      operateType: '1',
      memberPhone: wx.getStorageSync('member').phone,
      verCode: verifyVal
    };
    if (status) {
      params.operateType = '2';
      params.memberPhone = phoneVal;
    }
    ajaxPromise(true, updatePhone, params)
      .then((res) => {
        if (!status) {
          clearInterval(timer);
          wx.setNavigationBarTitle({
            title: '绑定新手机号'
          });
          this.setData({
            status: true,
            btnText: '确认绑定',
            phoneVal: '',
            verifyVal: '',
            verifyText: '获取验证码',
            showCode: true
          })
        } else {
          showToast('修改成功')
          let member = wx.getStorageSync('member');
          member.phone = phoneVal;
          wx.setStorageSync('member', member);
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        }
      })
      .catch(() => {
      })
  },

});
