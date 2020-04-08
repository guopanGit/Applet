const app = getApp();


import {URL} from '../../utils/config';
import {formatTime} from '../../utils/util';

const prefixImg = URL.prefixImg;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: Array,
    source: Number,
    type: String,
    couponIndex: {
      type: Array,
      observer(newVal) {
        let list = this.data.list;
        if (list.length > 0) {
          list.forEach(ele => {
            ele.index = false;
            newVal.forEach(element => {
              if (ele.voucherCode == element) {
                ele.index = true
              }
            })
          })
          this.setData({
            list
          })
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    fromHome: '',
    prefixImg
  },

  attached() {
    let couponIndex = app.globalData.couponIndex;
    setTimeout(() => {
      if (couponIndex) {
        let list = this.data.list;
        list.forEach(ele => {
          ele.index = false
          couponIndex.forEach(element => {
            if (ele.voucherCode == element) {
              ele.index = true
            }
          })
        })

        this.setData({
          list
        })
      }
    }, 500)
    let present = formatTime(new Date(), false, '.');
    if (this.properties.source == 1) {
      this.setData({
        fromHome: 'from-home'
      })
    } else if (this.properties.source == 2) {
      this.setData({
        fromHome: 'from-redict'
      })
    } else {
      this.setData({
        fromHome: ''
      })
    }
    this.setData({
      couponIndex,
      present
    })

  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 点击券面
     */
    coupon(e) {
      let val = e.currentTarget.dataset.val;
      this.triggerEvent('coupon', val);
    },

    /**
     * 点击去使用
     */
    service(e) {
      let val = e.currentTarget.dataset.val
      this.triggerEvent('service', val);
    },
  }
})
