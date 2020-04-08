/**
 * 导入封装函数
 */

import {
  ajaxPromise
} from 'utils/util.js';

import {
  URL,
} from 'utils/config.js';

// 接口
const {
  sensorsSetup, // 埋点接口
  checkCinema
} = URL || '';

// 神策数据采集
import sensors from './analysis/sensorsdata.min.js';

sensors.init();

// 百度数据采集
const mtjwxsdk = require("./analysis/mtj-wx-sdk.js");

App({

  /**
   * 小程序初次加载函数
   */
  onLaunch(options) {
    // 获取设备信息
    let _this = this;
    wx.getSystemInfo({
      success: res => {
        let OS = res.system.split(' ')[0];
        wx.setStorageSync('OS', OS);
        wx.setStorageSync('CVersion', res.version);
        // 适配iPhoneX
        let deviceModel = ['iPhone X', 'iPhone XR', 'iPhone XS Max'];
        for (let i = 0; i < deviceModel.length; i++) {
          if (res.model.indexOf(deviceModel[i]) > -1) {
            _this.globalData.iPhoneX = true;
          }
        }
      },
    })
  },

  /**
   * 监听小程序显示
   */
  onShow(options) {
    // 检测更新
    this.upgrading();
    // 获取参数
    let sharePara = options.query;
    let scene = options.scene;
    if (scene == 1012 || scene == 1013){ // 长按或相册选
      scene = 1011
    }
    wx.setStorageSync('scene', scene);
    // 扫码跳转小程序替换参数
    if (scene === 1011 && sharePara.q) {
      this.scanEnter(sharePara.q);
    }

    if (sharePara.cinemaCode) {
      wx.setStorageSync('cinemaCode', sharePara.cinemaCode);
    }
    if (sharePara.cinemaName) {
      wx.setStorageSync('cinemaName', sharePara.cinemaName);
    }
    if (sharePara.companyCode) {
      wx.setStorageSync('companyCode', sharePara.companyCode);
    }
    if (sharePara.luckDrawId) {
      wx.setStorageSync('luckDrawId', sharePara.luckDrawId);
    }
    if (sharePara.tabIndex) {
      wx.setStorageSync('tabIndex', sharePara.tabIndex);
    }
    // 启动APP埋点参数
    let memberCode = wx.getStorageSync('member').memberCode;
    let cinemaName = wx.getStorageSync('cinemaName');
    let cinemaCode = wx.getStorageSync('cinemaCode');
    let gps = wx.getStorageSync('longitude') + ',' + wx.getStorageSync('latitude');

    // 埋点接口
    ajaxPromise(false, sensorsSetup, {
      memberCode: memberCode ? memberCode : '',
      cinemaName: cinemaName ? cinemaName : '',
      gps: gps
    }, this.sensorsSetupCall, true);
    // 效验当前cinemaCode 是否正确
    if (cinemaCode) {
      ajaxPromise(false, checkCinema, {
          cinemaCode
        }, false, true)
        .then((res) => {
          let {
            cinemaCodeNew,
            yourCinemaCode
          } = res.resultData;
          if (cinemaCodeNew && cinemaCodeNew != yourCinemaCode) {
            wx.setStorageSync('firstEntry', false);
            wx.reLaunch({
              url: `/pages/cinema/cinema`
            })
          }
        })
        .catch(() => {})
    }

    // 看瓜缓存过期时间
    let getExpiration = wx.getStorageSync("melonSource") || 0; // 拿到过期时间
    let nowTimestamp = Date.parse(new Date()); // 拿到现在时间
    // 进行时间比较
    if (getExpiration < nowTimestamp) { // 过期了，清空缓存，跳转到登录
      wx.setStorageSync('melonSource', 0)
    }
  },

  // 埋点成功回调
  sensorsSetupCall(res) {
    // console.log(res.resultDesc);
  },

  /**
   * 监听小程序隐藏
   */
  onHide() {
    clearInterval(this.globalData.clear);
  },

  /**
   * 全局数据媒介
   */
  globalData: {
    timer: {},
    iPhoneX: false,
    adShowOnce: true,
    sceneArr: [],
    tipsPara: {},
    counponData: {},
    currentScene: {},
    ticketInfos: {},
    couponList: [],
    page: '',
    cardIndex: '',
    cardType: 0,
    couponIndex: [],
    voucherName: [],
    melonSource: "",
    checkCinema: false
  },

  /**
   * 扫码参数
   */
  scanEnter(url) {
    url = decodeURIComponent(url);
    url = url.substring(url.indexOf('?') + 1).split('&');
    url.forEach(element => {
      element = element.split('=');
      wx.setStorageSync(element[0], element[1])
    });
  },

  /**
   * 检查更新
   */
  upgrading() {
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，即将重启应用',
            showCancel: false,
            confirmText: '我知道了',
            success: function (res) {
              if (res.confirm) {
                updateManager.applyUpdate();
              }
            },
          })
        })
        updateManager.onUpdateFailed(() => {
          wx.showModal({
            title: '已经有新版本了哟~',
            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开~',
            showCancel: false,
            confirmText: '我知道了'
          })
        })
      }
    })
  }
})
