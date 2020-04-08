// 绑卡券.js
import {
  showToast,
  ajaxPromise
} from '../../../utils/util';

import {
  URL,
} from '../../../utils/config.js';

const {
  scanCode,
  bindVoucher,
  bindCard,
  scanCard
} = URL;


const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '1',
    num: '请输入券号',
    pwd: '请输入券密码',
    number: '',
    password: '',
    invite: '',
    isOpa: false,
    isScan: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
    this.setData({
      id: options.id
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: '绑卡券'
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      number: '',
      password: '',
      isOpa: false,
      isScan: false
    })
  },

  /**
   * 切换导航
   */
  changeNav(e) {

    let id = e.currentTarget.dataset.id
    let num = '';
    let pwd = '';
    if (id == '1') {
      num = '请输入券号';
      pwd = '请输入券密码';
    } else {
      num = '请输入卡号';
      pwd = '请输入卡密码';
    }
    this.setData({
      id,
      num,
      pwd,
      number: '',
      password: '',
      invite: '',
      isOpa: false,
      isScan: false
    })
  },

  /**
   * 获取输入号码
   */

  setNum(e) {
    let number = e.detail.value;
    let password = this.data.password;
    let isOpa = '';
    let isScan = '';
    if (password != '' && number != '') {
      isOpa = true;
      isScan = true;
    }
    this.setData({
      number,
      isOpa,
      isScan
    })
  },

  /**
   * 获取输入密码
   */

  setPwd(e) {
    let password = e.detail.value;
    let number = this.data.number;
    let isOpa = '';
    let isScan = '';
    if (password != '' && number != '') {
      isOpa = true;
      isScan = true;
    }
    this.setData({
      password,
      isOpa,
      isScan
    })
  },

  /**
   * 获取输入密码
   */

  setInvite(e) {
    let invite = e.detail.value;
    this.setData({
      invite
    })
  },

  /**
   *绑定
   */

  binding() {
    let {number, password} = this.data;
    if (number == '') {
      showToast(this.data.num);
      return
    } else if (password == '') {
      showToast(this.data.pwd);
      return
    }
    this.bindCard(number, password)
  },

  /**
   * 绑定卡券
   */
  bindCard(number, password) {
    let {id, invite} = this.data;
    if (id == 1) {
      ajaxPromise(true, bindVoucher, {
        voucherNo: number,
        bindPsw: password,
        inviteCode: invite
      },)
        .then((res) => {
          this.bindCall(res)
        })
        .catch(() => {
        })
    } else {
      ajaxPromise(true, bindCard, {
        cardNo: number,
        cardPassword: password,
        inviteCode: invite
      })
        .then((res) => {
          this.bindCall(res)
        })
        .catch(() => {
        })
    }
  },

  /**
   * 绑定成功回调
   */
  bindCall(res) {
    let id = this.data.id;
    let url;
    if (id == 1) {
      url = '/pages/nav-my/my-coupon/my-coupon'
    } else {
      url = '/pages/nav-my/my-card/vip-card/vip-card'
    }
    app.sensors.track('binding', {
      platform_type: '小程序',
      cinemaName: wx.getStorageSync('cinemaName'),
      bindingType: id == 1 ? '券' : '卡',
      bindingNumber: this.data.number
    });
    showToast('绑定成功');

    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      })
    }, 2000)
  },

  /**
   * 扫码识别
   */
  scan() {
    let _this = this;
    let {
      isOpa,
      isScan
    } = _this.data;
    if (isOpa || isScan) {
      return
    }
    wx.scanCode({
      success(res) {
        let {
          id
        } = _this.data;
        if (id == 1) {
          ajaxPromise(true, scanCode, {
            qrCode: res.result,
            type: 2
          })
            .then((res) => {
              setTimeout(() => {
                let {voucherNo, bindPassword} = res.resultData;
                _this.setData({
                  number: voucherNo,
                  password: bindPassword,
                  isOpa: true,
                  isScan: true,
                })
              }, 1000)
            })
            .catch(() => {
            })
        } else if (id == 2) {
          ajaxPromise(true, scanCard, {
            qrCode: res.result
          })
            .then((res) => {
              console.log(res);
              setTimeout(() => {
                let {
                  cardNo,
                  bindPassword
                } = res.resultData;
                _this.setData({
                  number: cardNo,
                  password: bindPassword,
                  isOpa: true,
                  isScan: true,
                })
              }, 1000)
            })
            .catch(() => {
            })
        }
      }
    })
  }
})
