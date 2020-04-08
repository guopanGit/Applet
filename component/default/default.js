// component/default/default.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: {
      type: String,
      value: '', // 1 无售卖会员卡  2 无卖品上架 3 无订单 4 无会员卡可用 5 无优惠券可用 6 网络不给力 7 出票 8 没有会员卡 9 没有优惠券
      observer(newVal, oldVal) {
        if (newVal) {
          let kind = '';
          let title = '';
          switch (newVal) {
            case '3':
              kind = 'orange';
              title = '去购票';
              break;
            case '4':
              kind = 'orange';
              title = '绑定会员卡';
              break;
            case '5':
              kind = 'orange';
              title = '绑定优惠券';
              break;
            case '6':
              kind = 'gray';
              title = '点击刷新';
              break;
            case '7':
              kind = 'gray';
              title = '点击刷新';
              break;
            case '8':
              kind = 'orange';
              title = '绑定会员卡';
              break;
            case '9':
              kind = 'orange';
              title = '绑定优惠券';
              break;
            case '10':
              kind = 'orange';
              title = '去购卡';
              break;
          }
          this.setData({
            kind,
            title
          })
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    kind: 'orange',
    title: ''
  },
  lifetimes: {
    attached() {

    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show() {
      this.setData({
        show: true
      })
    },

    hide() {
      this.setData({
        show: false
      })
    },

    clickBtn() {
      this.triggerEvent('clickBtn')
    }
  }
})
