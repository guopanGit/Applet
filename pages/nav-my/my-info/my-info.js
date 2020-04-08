/**
 * 导入封装函数
 */

import {
  ajaxPromise,
  showToast,
} from '../../../utils/util.js';

import {
  URL
} from '../../../utils/config.js';

const {
  setUserInfo,
  getMember
} = URL || '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatar: '',
    userName: '',
    birthday: '',
    gender: '',
    registerCinema: '',
    genderArray: ['男', '女']
  },

  onLoad() {
    wx.hideShareMenu();
    let avatar = wx.getStorageSync('member').avatar; // 头像
    let userName = wx.getStorageSync('member').nickName; // 昵称

    this.setData({
      avatar: avatar,
      userName: userName,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 获取用户信息
    ajaxPromise(true, getMember, {})
      .then((res) => {
        this.getUserInfoCall(res)
      })
      .catch(() => {
      })
  },

  /**
   * 获取用户信息成功回调
   */
  getUserInfoCall(res) {
    let birthday = res.resultData.birthday; // 生日
    let memberSex = res.resultData.sex; // 性别
    let registerCinema = res.resultData.memberOwner;

    // 判断性别
    if (memberSex) {
      if (memberSex == '1') {
        this.setData({
          gender: '男'
        })
      } else if (memberSex == '2') {
        this.setData({
          gender: '女'
        })
      }
    }

    this.setData({
      birthday: birthday,
      registerCinema: registerCinema
    })
  },

  /**
   * 选择性别
   */
  bindPickerChange(e) {
    // 提示信息
    showToast('性别一旦确认就不能修改');

    let memberSex;

    // 判断性别
    if (e.detail.value == '0') {
      memberSex = '1';
      this.setData({
        gender: '男'
      })
    } else if (e.detail.value == '1') {
      memberSex = '2';
      this.setData({
        gender: '女'
      })
    }

    // 传给后台
    this.modifyUserInfo(memberSex);
  },

  /**
   * 选择生日
   */
  bindDateChange(e) {
    let birthday = e.detail.value
    this.setData({
      birthday: birthday
    })

    // 传给后台
    this.modifyUserInfo(null, birthday);
  },

  /**
   * 修改用户信息
   */
  modifyUserInfo(gender, birthday) {
    ajaxPromise(true, setUserInfo, {
      memberSex: gender ? gender : '',
      memberBirthday: birthday ? birthday : ''
    })
      .then((res) => {
       showToast('修改成功')
      })
      .catch(() => {
      })
  }
})
