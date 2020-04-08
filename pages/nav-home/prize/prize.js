/**
 * 导入封装函数
 */

import {
  ajaxPromise,
  showToast
} from '../../../utils/util.js';

import {
  URL
} from '../../../utils/config.js';

let {
  luckDrawDetail,
  luckDrawList,
  isLuckDraw,
  winLuckDraw,
  prefixImg,
  winPrize
} = URL || ""

Page({
  data: {
    rules: {},
    endTime: "",
    startTime: "",
    prizeArr: [],
    prizeL: false,
    prizeLC: 0,
    prizeM: false,
    prizeMC: 1,
    prizeR: false,
    prizeRC: 2,
    animationL: {},
    animationM: {},
    animationR: {},
    isPrize: false,
    winPrizeNum: 0,
    winPrizeName: [],
    myPrize: []
  },

  // 全局活动id
  luckDrawId: "",

  luckDrawData: {},

  luckDrawFlag: 1,

  definitive: true,

  // 监听页面加载
  onLoad(options) {
    let luckDrawId = options.luckDrawId || wx.getStorageSync('luckDrawId') || '';
    if (luckDrawId != '') {
      this.luckDrawId = luckDrawId
    }
  },

  onReady() {
    wx.setNavigationBarTitle({
      title: '抽奖活动'
    });
  },

  // 监听页面显示
  onShow() {
    if (this.luckDrawId) {
      // 奖品列表
      ajaxPromise(true, luckDrawList, {
        lotteryId: this.luckDrawId
      }).then((res) => {
        this.luckDrawListCall(res)
      }).catch(() => {
      })

      // 抽奖次数/中间名单
      ajaxPromise(false, winLuckDraw, {
        lotteryId: this.luckDrawId
      }, false, 'modal').then((res) => {

        this.setData({
          winPrizeName: res.resultData.winPrizeInfo,
          winPrizeNum: res.resultData.winPrizeLotteryLimit
        })
      }).catch((res) => {
        if (res.resultCode === '1') {
          this._modal("暂无抽奖活动")
        }
      })

      // 我的中奖记录
      if (wx.getStorageSync('member').memberCode) {
        ajaxPromise(false, winPrize, {
          lotteryId: this.luckDrawId
        }).then((res) => {
          let myPrize = res.resultData;
          myPrize.forEach(element => {
            element.prizeImgLink = prefixImg + element.prizeImgLink
          });
          this.setData({
            myPrize
          })
        }).catch(() => {
        })
      }

      // 活动规则
      ajaxPromise(false, luckDrawDetail, {
        lotteryId: this.luckDrawId
      }).then((res) => {
        let rules = res.resultData;
        let startTime = rules.expireStartTimeStr.split(" ")[0];
        let endTime = rules.expireEndTimeStr.split(" ")[0];
        this.setData({
          rules,
          startTime,
          endTime
        })
      }).catch(() => {
      })
    } else {
      this._modal('活动已暂停，详情请咨询影院')
    }
    this.definitive = true;
  },

  // 请求成功回调
  luckDrawListCall(res) {
    let prizeArr = res.resultData.lotteryDrawPrize;
    if (prizeArr.length >= 2) {
      prizeArr.forEach((element, index) => {
        element.id = index + 1
        element.prizeImgLink = prefixImg + element.prizeImgLink
      });
      if (prizeArr.length < 3) {
        prizeArr.push(prizeArr[0])
      }
      this.setData({
        prizeArr
      })
       // console.log(this.data.prizeL);
    } else {
      this._modal('活动奖品库存不足,请联系影院')
    }
  },


  /*
   *"抽奖点击事件"
   */
  startAnmiation() {
    let memberCode = wx.getStorageSync('member').memberCode || "";
    if (!memberCode) {
      wx.navigateTo({
        url: '/pages/sign-in/authorize/authorize'
      })
      return false
    }

    if (wx.getStorageSync('member').memberCode) {
      if (this.luckDrawFlag === 0) {
        return false
      }
      let definitive = this.definitive;
      if (definitive) {
        this.definitive = false;
      } else {
        return false
      }
      if (this.data.winPrizeNum > 0) {
        ajaxPromise(false, isLuckDraw, {
          lotteryId: this.luckDrawId
        }).then((res) => {
          let data = res.resultData;
          if (data.lotteryResultCode == '0') {
            let prizeArr = this.data.prizeArr;
            try {
              prizeArr.forEach((element, index) => {
                if (element.prizeId === data.prizeId) {
                  throw new Error(index)
                }
              })
            } catch (e) {
              if (data.lotteryResultCode == '0') {
                this.initAnimation('prizeL', e.message); // 第一个动画
                setTimeout(() => {
                  this.initAnimation('prizeM', e.message); // 第二个动画
                }, 200)
                setTimeout(() => {
                  this.initAnimation('prizeR', e.message); // 第二个动画
                }, 500)
                this.setData({
                  winPrizeNum: this.data.winPrizeNum - 1,
                  prize: data
                })
              } else {
                showToast(res.resultData.lotteryErrorMessage)
              }
            }
          } else {
            showToast(res.resultData.lotteryErrorMessage)
          }
        }).catch(() => {
          this.definitive = true;
        })
      } else {
        showToast("您的抽奖次数已用完")
        return false
      }
    } else {
      wx.navigateTo({
        url: '/pages/sign-in/authorize/authorize'
      })
    }

  },

  /**
   * 初始化动画效果
   */
  initAnimation(line, index) {
    let interval = line + 'I';
    let duration = line + 'D';
    let current = line + 'C';
    this.setData({
      [line]: true,
      [interval]: 150,
      [duration]: 240
    })

    setTimeout(() => {
      this.setData({
        [line]: false,
        [current]: index
      })
    }, 5000);
    setTimeout(() => {
      this.setData({
        isPrize: true
      })
      this.definitive = true;
    }, 6000)

  },

  // 显示活动规则
  activityRules() {
    this.setData({
      showRules: true
    })
  },

  // 隐藏显示活动
  hideRules() {
    this.setData({
      showRules: false,
      isPrize: false
    })
  },

  // 立即使用
  useing() {
    wx.navigateTo({
      url: '/pages/nav-my/my-coupon/my-coupon',
    })
    this.setData({
      isPrize: false
    })
  },

  // 提示信息
  _modal(content) {
    wx.showModal({
      content: content,
      showCancel: false,
      confirmText: '确定',
      success: (result) => {
        if (result.confirm) {
          wx.navigateBack({
            delta: 1
          });
        }
      },
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(res) {
    let companyCode = wx.getStorageSync('companyCode');
    let cinemaCode = wx.getStorageSync('cinemaCode');
    let luckDrawId = this.luckDrawId;
    return {
      title: '这个抽奖挺不错',
      path: `pages/nav-home/prize/prize?cinemaCode=${cinemaCode}&companyCode=${companyCode}&luckDrawId=${luckDrawId}`,
    }
  }
})
