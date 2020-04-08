import {
  showToast,
  ajaxPromise
} from '../../utils/util.js';

import {
  URL
} from '../../utils/config';

const {
  setCardPwd,
  checkCardPsw,
  cardPayBack,
  checkPosCardPsw
} = URL || '';

Component({

  // 组件属性
  properties: {

    source: {// 0:初始密码 1:支付密码 2:同步POS密码
      type: Number,
      value: '0',
      observer(newVal) {
        if (newVal == 1) {
          let title = '请输入支付密码';
          if (this.properties.payType == 11) {
            title = '请输入实体卡密码'
          }
          this.setData({
            title
          })
        }
      }
    },

    cardNo: String,

    orderNo: String,

    orderType: String,

    payType: String, // 支付类型

    isBack: String, // 成功是否返回 1 跳转 不传为返回

    cardType: {// 卡类型
      type: String,
      value: '5',
      observer(newVal) {
        let title = '请输入支付密码';
        if (newVal === '11') {
          title = '请输入实体卡密码';
        }
        this.setData({
          title
        })
      }
    },

    //输入框密码位数
    value_length: {
      type: Number,
      value: 0,
      // 监听输入框密码变化
      observer: function (newVal, oldVal) {
        let that = this;
        let input_value = that.data.input_value;

        that.triggerEvent('valueNow', input_value)
        this.setData({
          input_value,
        })
        // 当输入框的值等于6时（发起支付等...）
        if (newVal == 6) {

          // 设定延时事件处理
          // setTimeout(function () {
          //   // 引用组件页面的自定义函数(前一个参数为函数，后一个为传递给父页面的值)
          //   that.triggerEvent('valueSix', input_value)
          //   // 当没有
          //   if (!that.data.isNext) {
          //     // 回到初始样式
          //     that.setData({
          //       get_focus: false,
          //       value_length: 0,
          //       input_value
          //     });
          //   }
          // }, 100)
        }
      }
    },

    // 是否显示间隔输入框
    interval: {
      type: Boolean,
      value: true,
      observer: function (newVal, oldVal) {

      }
    },

    // 是否有下一步按钮（如果有则当输入6位数字时不自动清空内容）
    isNext: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal) {

      }
    },

    //输入框聚焦状态
    get_focus: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal) {

      }
    },

    //输入框初始内容
    input_value: {
      type: String,
      value: "",
      observer: function (newVal, oldVal) {

      }
    },

    //输入框聚焦样式
    focus_class: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal) {

      }
    },

    //输入框格子数
    value_num: {
      type: Array,
      value: [1, 2, 3, 4, 5, 6],
      observer: function (newVal, oldVal) {

      }
    },

    //输入框高度
    height: {
      type: String,
      value: "98rpx",
      observer: function (newVal, oldVal) {

      }
    },

    //输入框宽度
    width: {
      type: String,
      value: "604rpx",
      observer: function (newVal, oldVal) {

      }
    },

    //是否明文展示
    see: {
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal) {

      }
    },
  },

  // 组件方法
  methods: {
    // 获得焦点时
    get_focus() {
      let that = this;
      that.setData({
        focus_class: true
      })
    },

    // 失去焦点时
    blur() {
      let that = this;
      that.setData({
        focus_class: false
      })
    },

    // 点击聚焦
    set_focus() {
      let that = this;
      that.setData({
        get_focus: true
      })
    },

    // 获取输入框的值
    get_value(data) {
      let that = this;
      // 设置空数组用于明文展现
      let val_arr = [];
      // 获取当前输入框的值
      let now_val = data.detail.value
      // 遍历把每个数字加入数组
      for (let i = 0; i < 6; i++) {
        val_arr.push(now_val.substr(i, 1))
      }
      // 获取输入框值的长度
      let value_length = data.detail.value.length;

      // 更新数据
      that.setData({
        value_length: value_length,
        val_arr: val_arr,
        input_value: now_val
      });
    },

    // 确定
    confirmPwd(val) {
      // 密码不能少于6位数
      if (this.data.input_value.length < 6) {
        showToast("密码不能低于6位数")
        return
      }
      if (this.data.source == 0) { // 设置支付密码 回调
        ajaxPromise(true, setCardPwd, {
          newPassword: this.data.input_value,
          type: 0,
        })
          .then((res) => {
            this.triggerEvent('confirmPassword');
            this.setData({
              input_value: "",
              value_length: 0
            })
          })
          .catch(() => {
          })
      } else { // 付款
        let url = checkCardPsw;
        let {orderNo, payType, cardType} = this.data;
        if (cardType == 11) {
          url = checkPosCardPsw
        }
        if (payType == 1) {
          payType = 5
        }
        ajaxPromise(true, url, {
          password: this.data.input_value,
          orderNo,
          prefAccount: ''
        })
          .then((res) => {
            ajaxPromise(true, cardPayBack, {
              orderNo,
              payType
            })
              .then((res) => {
                let isBack = this.data.isBack;
                if (isBack) {
                  isBack = 2
                } else {
                  isBack = 4
                }
                wx.redirectTo({
                  url: `/pages/success/success?type=${isBack}&orderNo=${orderNo}&orderType=${this.data.orderType}`
                })
                this.triggerEvent('confirmPassword');
              })
              .catch(() => {
              })
          })
          .catch(() => {
          })
      }

    },
    // 关闭输入框
    closeInput() {
      this.triggerEvent('closeInput')
    }
  }
})
