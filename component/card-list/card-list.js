import {
  ajaxPromise, showToast
} from "../../utils/util";

import {
  URL
} from '../../utils/config';

const {
  newPosPwd
} = URL || '';


const app = getApp();

Component({

  /**
   * 组件的接收父组件属性
   */
  properties: {
    source: Number,  // 1.选择会员卡 2.商城会员卡 3.我的会员卡
    isPassword: String,
    chooseCardData: Array,
    currentIndex: {
      type: Number,
      value: '',
      observer(newVal) {
        this.setData({
          currentIndex: newVal
        })
      }
    }
  },

  /**
   * 组件的内部数据，和 properties 一同用于组件的模版渲染
   */
  data: {
    isSelect: true,
    showUpdatePwd: false,
    cardVal: {},
    cardPassword: ''
  },

  // 页面加载完成
  ready() {
  },

  /**
   * 组件的方法，包括事件响应函数和任意的自定义方法
   */
  methods: {

    /**
     * 开卡
     */
    buyCard(e) {
      let val = e.currentTarget.dataset.val;
      this.triggerEvent('buyCard', val);
    },

    /**
     * 充值
     */
    rechargeCard(e) {
      let detail = e.currentTarget.dataset.val
      let val = {
        cardCode: detail.cardCode,
        cardName: detail.cardName,
        rechargeAmount: detail.rechargeAmount
      }
      val = JSON.stringify(val)
      wx.navigateTo({
        url: `/pages/nav-my/my-card/recharge/recharge?val=${val}`
      })
    },

    // 点击修改密码
    inputSix(e) {
      let card = e.currentTarget.dataset.val;
      let cardVal = {
        cardCode: card.cardCode,
        noFormat: card.noFormat,
        limitTime: card.limitTime || '永久有效',
      };
      this.setData({
        showUpdatePwd: true,
        cardVal
      })
    },

    // 隐藏修改密码弹框
    hideLayer() {
      this.setData({
        showUpdatePwd: false
      })
    },

    bindInput(e) {
      let cardPassword = e.detail.value;
      this.setData({
        cardPassword
      });
    },

    /**
     * 点击卡面
     */
    tapCard(e) {
      //  console.log(e);
      let currentIndex = e.currentTarget.dataset.index;
      let val = e.currentTarget.dataset.val;
      val.index = currentIndex;
      //  console.log(val);
      if (val.cardType == '10' || val.cardType == '11') {
        if (val.isValid == '0')
          return
      }

      if (val.expire == '1' && this.data.source == 1) {
        return
      }
      this.triggerEvent('tapCard', val);
    },

    /**
     * 刷新
     */

    refresh() {
      this.triggerEvent('refresh');
    },

    // 更新密码
    updatePassword() {
      let cardPassword = this.data.cardPassword
      if (!cardPassword) {
        showToast('请输入密码')
        return
      }
      ajaxPromise(true, newPosPwd, {
        cardNo: this.data.cardVal.cardCode,
        cardPassword
      })
        .then((res) => {
          this.setData({
            showUpdatePwd: false
          })
          this.triggerEvent('updatePassword');
        })
        .catch(() => {
        })
    },

  }
})
