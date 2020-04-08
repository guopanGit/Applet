/**
 * 导入封装函数
 */

import {
  creatOrder,
  payOrder,
  wxPayment,
  showToast,
  formatTime,
  ajaxPromise
} from '../../utils/util.js';

import {URL} from "../../utils/config";

const {
  destroybusCoupon,
  goodsDetail
} = URL || '';

const app = getApp();

Component({

  /**
   * 组件的接收父组件属性
   */
  properties: {
    // 接收的字段名必须和传的一致
    renderData: {
      type: Object, // 传值类型
      value: "", // 默认
      observer(newVal) {
        if (newVal.cardCode) {
          let renderData = newVal;
          let cardCode = renderData.cardCode;
          this.setData({
            cardCode: cardCode,
          })
        }
      }
    },
    coupon: {
      type: Object, // 传值类型
      value: "", // 默认
      observer(newVal) {
        let present = formatTime(new Date(), false, '.');
        this.setData({
          present
        })
      }
    },
    renderShow: {
      type: Boolean,
      value: false
    },
    showCardDetail: {
      type: Object,
      value: {},
      observer(showCardDetail) {
        if (showCardDetail && showCardDetail.codeCinemaMsg) {
          showCardDetail.codeCinemaMsg.forEach(element => {
            element.cinemaName = element.cinemaName.split(',');
          });
          this.setData({
            showCardDetail
          })
        }
      }
    },
    showDetail: {
      type: Object,
      value: {},
      observer(showDetail) {
        if (showDetail && showDetail.codeCinemaMsg) {
          showDetail.codeCinemaMsg.forEach(element => {
            element.cinemaName = element.cinemaName.split(',');
          });
          this.setData({
            showDetail
          })
        }
      }
    },
    showGift: {
      type: Object,
      value: {},
      observer(showGift) {
        if (showGift && showGift.goodsDetail) {
          showGift.goodsDetail.forEach(element => {
          	if(element){
	            element.showRule = false;
	            element.showList = false;
	            element.codeCinemaMsg.forEach(ele => {
		            ele && (ele.cinemaName = ele.cinemaName.split(','));
	            })
            }
          });
          const query = this.createSelectorQuery();
          query.selectAll('.textBox').boundingClientRect();
          query.selectViewport().scrollOffset();
          query.exec((res) => {
            let list = res[0];
            showGift.goodsDetail.forEach((element, index) => {
              element.showIcon = false;
              element.unfold = true;
              element.fold = false;
              list.forEach((ele, inx) => {
                if (index == inx && ele.height > 40) {
                  element.showIcon = true;
                }
              })
            })
	        this.setData({
              showGift
            })
          })
          // this.setData({
          //   showGift
          // })
        }
      }
    },
    recommend: {
      type: Boolean,
      value: false
    },
    recommendCard: Object,
    cardTitle: Array,
    source: Number,
    discounts: {
      type: Number,
      value: 0
    },
    initiate: {
      type: Number,
      value: 0
    },
    fromMyCard: {
      type: Boolean,
      value: true
    },
  },

  /**
   * 组件的内部数据，和 properties 一同用于组件的模版渲染
   */
  data: {
    cardCode: '',
    isOK: true,
    isSelected: false,
  },

  // 页面加载完成
  ready() {
    if (this.data.renderData.cardCode) {
      let renderData = this.data.renderData;
      let cardCode = renderData.cardCode;
      this.setData({
        cardCode: cardCode,
      })
    }
  },

  // 监听页面显示
  pageLifetimes: {
    show() {
      this.data.isOK = true;
    },
  },

  /**
   * 组件的方法，包括事件响应函数和任意的自定义方法
   */
  methods: {

    // 显示弹层
    showLayer() {
      let source = this.properties.source;
      let recommendCard = this.data.recommendCard;
      let goodsId = this.data.recommendCard.gId;
      ajaxPromise(true, goodsDetail, {goodsId})
        .then((res) => {
          if (recommendCard.gType == 'CARD') {
            this.setData({
              showCardDetail: res.resultData
            })
          } else if (recommendCard.gType == 'VOUCHER') {
            this.setData({
              showDetail: res.resultData
            })
          } else if (recommendCard.gType == 'PACKAGE') {
            this.setData({
              showGift: res.resultData
            })
          }
        })
        .catch(() => {
        });
      let sourceName = '';
      if (source == 1) {
        sourceName = '首页';
      } else if (source == 2) {
        sourceName = '场次列表页';
      } else {
        sourceName = '商城卖品页';
      }
      app.sensors.track('cardRecommendedClick', {
        platform_type: '小程序',
        cinemaName: wx.getStorageSync('cinemaName'),
        sourceName
      })
    },

    // 关闭弹层
    hideLayer() {
      this.setData({
        showCardDetail: {},
        showDetail: {},
        showGift: {},
        isSelected:false
      })
    },
    // 购卡
    openCard(e) {
      // console.log(e);
      let _this = this;
      let isSelected = _this.data.isSelected;
      if (!isSelected) {
        let type = e.currentTarget.dataset.type;
        let text = '请您阅读并同意《购卡协议》及《购券协议》';
        if (type == '2') {
          text = '请您阅读并同意《购券协议》'
        } else if (type == '1') {
          text = '请您阅读并同意《购卡协议》'
        }
        showToast(text);
        return;
      }
      let member = wx.getStorageSync('member') || '';
      if (!member) {
        wx.navigateTo({
          url: `/pages/sign-in/authorize/authorize`
        });
        return;
      }
      if (_this.data.isOK) {
        _this.data.isOK = false;
      } else {
        return
      }

      let val = e.currentTarget.dataset.val;
      let promotionId = '';
      creatOrder(3, val, (res) => {
        let orderNo = res.resultData.orderNo;
        _this.data.isOK = true;
        payOrder(6, orderNo, (res) => {
          let data = res.resultData;
          wxPayment(data, (res) => {
            // 埋点
            app.sensors.track('buyCrad', {
              platform_type: '小程序',
              cinemaName: wx.getStorageSync('cinemaName'),
              cardType: val.cardType,
              cardName: val.cardName,
              cardAmount: val.cardAmount
            });
            wx.navigateTo({
              url: `/pages/success/success?orderNo=${orderNo}&type=3`
            })
          }, () => {
            _this.data.isOK = true;
            showToast("支付已取消")
          })
        }, () => {
          _this.data.isOK = true;
        })
      }, {
        promotionId
      }, () => {
        _this.data.isOK = true;
      })
    },

    // 卡协议
    goCard() {
      wx.navigateTo({
        url: '/pages/agreement/agreement?type=1'
      });
    },

    // 券协议
    goCoupon() {
      wx.navigateTo({
        url: '/pages/agreement/agreement?type=3'
      });
    },

    // 查看卡明细
    particulars(e) {
      let detail = e.currentTarget.dataset.item;
      let val = this._myCardDetail(detail);
      wx.navigateTo({
        url: `/pages/nav-my/my-card/detailed/detailed?val=${val}`
      })
    },

    // 去充值
    result(e) {
      let detail = e.currentTarget.dataset.val;
      let val = this._myCardDetail(detail);
      wx.navigateTo({
        url: `/pages/nav-my/my-card/recharge/recharge?val=${val}`
      })
    },

    // 充值 卡明细 参数获取
    _myCardDetail(detail) {
      let val = {
        cardCode: detail.cardCode,
        cardName: detail.cardName,
        rechargeAmount: detail.rechargeAmount
      }
      val = JSON.stringify(val)
      return val
    },

    // 同意开卡协议
    uncheck() {
      this.setData({
        isSelected: !this.data.isSelected
      })
    },

    // 扫码使用商家券
    scan() {
      let val = this.data.coupon;
      let present = this.data.present;
      let startTime = val.startTime;

      if (present < startTime) {
        showToast('未到可用日期');
        return;
      }

      let clickYn = val.clickYn;
      if (clickYn == 1) {
        return;
      }
      let _this = this;
      wx.scanCode({
        success(res) {
          ajaxPromise(true, destroybusCoupon, {
            voucherCode: val.voucherCode,
            key: res.result,
          })
            .then((res) => {
              _this.data.list.splice(val.index, 1);
              _this.setData({
                showDetail: false,
                mask: false,
                list: _this.data.list
              })
              setTimeout(() => {
                showToast('兑换成功')
              }, 1000);
            })
            .catch(() => {
            })
        }
      })
    },

    // 显示隐藏影院列表
    showCinemaList(e) {
      const showGift = this.data.showGift;
      const index = e.currentTarget.dataset.index || 0;
      const key = `showGift.goodsDetail[${index}].showList`;
      const value = !!showGift && !!showGift.goodsDetail[index] && showGift.goodsDetail[index].showList || false;
      this.setData({
        [key]: !value
      })
    },

    // 更多
    unfold(e) {
	    const showGift = this.data.showGift;
	    const index = e.currentTarget.dataset.index || 0;
	    if (!showGift.goodsDetail[index].showIcon) return;
	    const foldKey = `showGift.goodsDetail[${index}].fold`;
	    const unfoldKey = `showGift.goodsDetail[${index}].unfold`;
	    const foldValue = !!showGift && !!showGift.goodsDetail[index] && showGift.goodsDetail[index].fold || false;
	    this.setData({
		    [foldKey]: !foldValue,
		    [unfoldKey]: foldValue
	    })
    },

    // 防止穿透
    stopIncident(){
      return false
    }
  }
})
