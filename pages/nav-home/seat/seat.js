/**
 * 导入封装函数
 */

import {
  URL
} from '../../../utils/config.js';

import {
  formatTime,
  ajaxPromise,
  showToast,
  creatOrder
} from '../../../utils/util.js';

const app = getApp();
const {
  seatMap,
  isHasGoods
} = URL;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    seatIcon: '/image/seat.png',
    selectIcon: '/image/select-seat.png',
    lockIcon: '/image/lock-seat.png',
    lovesIcon: '/image/loves.png',
    lovesLock: '/image/lock-loves.png',
    selectLoves: '/image/select-loves.png',

    colNumber: 0,
    lineTop: 0,
    rowHeight: "",
    height: "",
    lineHeight: '',
    lineLeft: 0,
    width: 0,
    scrollLeft: 0,

    isShowModal: true,
    notice: true,
    noticeContent: '',
    limitNum: 0,
    isShow: false,
    filmName: '',
    rightDate: '',
    showCode: '',
    currentScene: {},
    sceneArr: [],
    rowArray: [],
    seatArray: [],
    selectSeatList: [],
    totalTicketPrice: 0,
    iPhoneX: app.globalData.iPhoneX
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.hideShareMenu();
    let filmName = options.filmName;
    this.setData({
      filmName: filmName,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 请求需要的参数数据
    let currentScene = app.globalData.currentScene;
    let originSceneArr = app.globalData.sceneArr;
    let tipsPara = app.globalData.tipsPara;
    let showCode = currentScene.showCode;
    let tagContent = currentScene.tagContent;

     // console.log(tipsPara);
     // console.log(currentScene);
     // console.log(originSceneArr);

    // 获取座位图
    this.updateSeatMap(currentScene, tipsPara);

    this.setData({
      selectSeatList: [],
      showCode: showCode,
      currentScene: currentScene,
      tagContent: tagContent,
      originSceneArr: originSceneArr
    });

    // 神策埋点
    app.sensors.para.autoTrack['pageShow'] = {
      platform_type: '小程序',
      cinemaName: wx.getStorageSync('cinemaName')
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    this.setData({
      isShowModal: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('cinemaName'),
    });

    // 原始场次数组
    let originSceneArr = this.data.originSceneArr;
    let dayDate;

    // 处理场次数据
    for (let i = 0; i < originSceneArr.length; i++) {
      dayDate = originSceneArr[i].day.substring(0, 2);
      originSceneArr[i].dayDate = dayDate
      originSceneArr[i].id = i;
    }

    //  console.log(originSceneArr);

    // 更新场次数据
    this.setData({
      sceneArr: originSceneArr
    })
  },

  /**
   * 是否显示场次
   */
  showScene() {
    this.setData({
      isShow: !this.data.isShow
    });

    // 选中的场次居中
    if (this.data.isShow) {
      const scrollLeft = 375 / 2;
      const query = wx.createSelectorQuery();
      query.select('#sliderWrap .active').boundingClientRect();
      query.exec((res) => {
        let left = res[0].left;
        if (left > scrollLeft) {
          let diffLeft = left - scrollLeft + 30;
          this.setData({
            scrollLeft: diffLeft
          })
        }
      })
    }
  },

  /**
   * 更新座位图
   */
  updateSeatMap(data, date) {
    //  console.log(date);
    // 查询座位图
    ajaxPromise(true, seatMap, {
      showCode: data.showCode,
      hallCode: data.hallCode,
      filmCode: data.filmCode,
      filmNo: data.filmNo,
      showDate: data.showDate,
      startTime: data.startTime,
      eventCode: data.eventCode,
      haltSales: data.haltSales
    })
      .then((res) => {
        this.seatMapCall(res)
      })
      .catch(() => {
      })

    // 获取所需变量
    let formatToday = date.currentDate.substring(0, 2); // 截取'今天'字段
    let formatDay = 1 * 24 * 60 * 60 * 1000; // 一天多少毫秒
    let formatRight = new Date(date.rightDate).getTime(); // 日期换算成毫秒
    let beforeDawn = formatTime(new Date(formatRight + formatDay)); // 凌晨场次 日期显示需要+1天
    let formatBefore = beforeDawn.substring(5, beforeDawn.length).replace('-', '月') + '日'; // 格式化凌晨场显示
    let formatCurrent = date.currentDate.substring(2, date.currentDate.length); // 格式化正确日期
    // 场次对应的日期时间
    if (date.isMorrow == '1') {
      let rightDate = beforeDawn + ' ' + date.startTime;
      this.setData({
        rightDate: rightDate
      });
    } else {
      let rightDate = date.rightDate + ' ' + date.startTime;
      this.setData({
        rightDate: rightDate
      });
    }

    // 不同场次 给出对应的提示信息
    if (this.data.isShowModal) {
      if (date.isMorrow == '1' && formatToday == '今天') { // 今天的凌晨场次
        wx.showModal({
          title: '',
          content: '您选择的是明天' + formatBefore + ' ' + date.startTime + '的场次，今天晚上就该出发了',
          showCancel: false,
        });
      } else if (date.isMorrow == '1' && formatToday != '今天') { // 非今天的凌晨场次
        wx.showModal({
          title: '',
          content: '您选择的是' + formatBefore + ' ' + date.startTime + '的场次，' + formatCurrent + '晚上就该出发了',
          showCancel: false,
        });
      } else {
        if (formatToday != '今天') { // 既不是凌晨场次 也不是今天的场次
          wx.showModal({
            title: '',
            content: '您选择的是' + date.currentDate + '的场次',
            showCancel: false,
          });
        }
      }
    }

  },

  /**
   * 座位图请求成功回调
   */
  seatMapCall(res) {
    //  console.log(res);

    let seatData = res.resultData; // 全部数据
    let limitNum = res.resultData.discountNum; // 活动限购张数
    let maxSelected = res.resultData.limitTicketAmount; // 最大可选座位数
    let isSaleOut = '0'; // 是否售罄
    let seats = res.resultData.seats; // 原始座位
    let seatNum = seatData.nos; // 原始行
    let rowArray = []; // 处理行
    let colArray = seatData.maxCol; // 列
    let handleArray = []; // 重组数组

    let isBlankRow = true;
    let road = { // 过道
      r: '',
      cn: '',
      iconSrc: '',
      type: 'road'
    }

    // 购票须知
    if (seatData.noticeContent) {
      let noticeContent = seatData.noticeContent;
      this.setData({
        noticeContent: noticeContent
      });
    } else {
      this.setData({
        noticeContent: ''
      });
    }

    // 处理行号
    for (let i = 0; i < seatData.nos.length; i++) {
      if (isBlankRow && seatData.nos[i] == '') {
        continue
      }
      isBlankRow = false;
      rowArray.push(seatData.nos[i]);
    }

    // 处理座位图
    for (let x = 1; x < seatNum.length + 1; x++) { // 遍历每行
      let everyRowArr = []; // 每行数组
      for (let y = 1; y <= colArray; y++) { // 遍历每列
        everyRowArr.push(road)
        for (let j = 0; j < seats.length; j++) { // 遍历每个座位
          if (seats[j].s != 'B' && seats[j].s != 'T') { // 售罄
            isSaleOut = '1'
          }
          if (seats[j].rn == x && seats[j].cn == y) { // 实体座位
            if (seats[j].ls) { // 情侣座
              if (seats[j].s == "F") {
                seats[j].iconSrc = this.data.lovesIcon; // 可选
              } else {
                seats[j].iconSrc = this.data.lovesLock; // 已售
              }
              if (seats[j + 1]) {
                if (seats[j].ls == seats[j + 1].ls) {
                  seats[j].lovers = 'lovers';
                }
              }
            } else {
              if (seats[j].s == "F") { // 非情侣座可售状态
                seats[j].iconSrc = this.data.seatIcon; // 可选
              } else {
                seats[j].iconSrc = this.data.lockIcon; // 已售
              }
            }
            seats[j].select = false; // 定义选座标识
            everyRowArr[everyRowArr.length - 1] = seats[j]; // 每一行放入新数组
            break;
          }
        }
      }
      handleArray.push(everyRowArr); // 放入新数组
    }

    //  console.log(handleArray);

    let seatArray = []; // 座位图
    let minRow = -1; // 最小行
    let minCol = 10000; // 最小列

    // 算出开头空座数
    for (let r = 0; r < handleArray.length; r++) {
      for (let c = 0; c < handleArray[r].length; c++) {
        if (handleArray[r][c].cn) {
          if (minRow == -1) { // 记录第一次进入行
            minRow = r;
          }
          if (minCol > c) { // 比较索引值
            minCol = c;
          }
          break
        }
      }
    }

    // 删除空行和空列
    for (let m = 0; m < handleArray.length; m++) {
      let newRowArray = []; // 定义一个新的行
      for (let n = 0; n < handleArray[m].length; n++) {
        if (n >= minCol) { // 当前列索引大于最小值时插入
          newRowArray.push(handleArray[m][n]);
        }
      }
      if (m >= minRow) { // 当前行索引大于最小值时插入
        seatArray.push(newRowArray);
      }
    }

    // console.log(seatArray);
    // 售罄
    if (isSaleOut == '0') {
      wx.showModal({
        title: '',
        content: '座位已售罄，换个场次吧',
        confirmText: '关闭',
        showCancel: false,
      })
    }

    // 广元国际特殊活动厅处理逻辑
    let hallCode = seatData.hallCode;
    let cinemaCode = wx.getStorageSync('cinemaCode');
    if (hallCode == '17395' && cinemaCode == '51150301') {
      let specialSeatArr = []
      let specialSeatNum = []

      for (let i = 0; i < 17; i++) {
        specialSeatArr.push(seatArray[i]);
        specialSeatNum.push(rowArray[i]);
      }

      this.setData({
        seatArray: specialSeatArr,
        rowArray: specialSeatNum,
        colNumber: specialSeatNum.length
      })

    } else {
      this.setData({
        seatArray,
        rowArray,
        colNumber: rowArray.length,
      })
    }


    // 更新数据
    this.setData({
      seatData: seatData,
      limitNum: limitNum,
      maxSelected: maxSelected
    });


    // 计算中线
    if (seatArray.length) {
      let seatLength = seatArray[0].length;
      const query = wx.createSelectorQuery();
      query.select('#seatView').boundingClientRect();
      query.exec((res) => {
        let width = res[0].width;
        let lineHeight = res[0].height;
        let top = res[0].top;
        let lineLeft;
        if (seatLength % 2 == 0) {
          lineLeft = width / 2;
        } else {
          lineLeft = (width / 2) + 13;
        }
        this.setData({
          width: width,
          lineHeight: lineHeight,
          lineTop: top,
          lineLeft: lineLeft
        })
      })
    }
  },

  /**
   * 购票须知
   */
  showNotice() {
    if (this.data.noticeContent) {
      if (this.data.noticeContent.length > 27) {
        this.setData({
          notice: !this.data.notice
        })
      }
    }
  },

  /**
   * 选择场次
   */
  selectScene(e) {
    //  console.log(e)
    // 获取所需变量
    let originArray = app.globalData.sceneArr;
    let index = e.currentTarget.dataset.index;
    let currentScene = e.currentTarget.dataset.item;
    let showCode = e.currentTarget.dataset.code;
    let isSellOut = currentScene.isSellOut;
    let isStopSell = currentScene.isStopSell;
    // console.log(app.globalData.sceneArr);

    // 判断该场次是否可购买
    if (isSellOut){
      showToast('该场次座位已售罄，请换个场次吧')
      return;
    } else if(isStopSell){
      showToast(' 该场次已停止网上售卖，请换个场次吧')
      return;
    }

    // 更新座位图参数
    let currentDate = originArray[index].day;
    let rightDate = originArray[index].date;
    let tagContent = currentScene.tagContent;
    let isMorrow = currentScene.ismorrow;
    let startTime = currentScene.startTime;

    let updateParams = {
      currentDate: currentDate,
      isMorrow: isMorrow,
      rightDate: rightDate,
      startTime: startTime
    }

    //  console.log(originArray);

    // 切换场次 更新座位图
    this.updateSeatMap(currentScene, updateParams);

    this.setData({
      showCode: showCode,
      tagContent: tagContent,
      currentScene: currentScene,
      selectSeatList: []
    })
  },

  /**
   * 选择座位
   */
  selectSeat(e) {

    let rowIndex = e.currentTarget.dataset.idx; // 对应当前数组中的行
    let colIndex = e.currentTarget.dataset.idy; // 对应当前数组中的列
    let rowId = e.currentTarget.dataset.x; // 获取实际横坐标
    let colId = e.currentTarget.dataset.y; // 获取实际纵坐标
    let seatArray = this.data.seatArray; // 获取重组后的座位数组

    // 判断情侣情侣座 边缘检测
    let seatNo, loveColId, prevSeat, nextSeat;
    let currentSeat = seatArray[rowIndex][colIndex];

    if (seatArray[rowIndex][colIndex + 1]) {
      nextSeat = seatArray[rowIndex][colIndex + 1];
      if (currentSeat.ls === nextSeat.ls) { // 当前情侣座和下一个是一对
        loveColId = nextSeat.c;
        seatNo = nextSeat.sn;
      }
    }
    if (seatArray[rowIndex][colIndex - 1]) {
      prevSeat = seatArray[rowIndex][colIndex - 1];
      if (currentSeat.ls === prevSeat.ls) { // 当前情侣座和上一个是一对
        loveColId = prevSeat.c;
        seatNo = prevSeat.sn;
      }
    }

    // 点击改变对应座位的状态
    for (var a = 0; a < seatArray.length; a++) {
      for (var b = 0; b < seatArray[a].length; b++) {
        let item = seatArray[a][b]; // 当前座位

        if (item.r == rowId && item.c == colId && item.s != 'B' && item.type != 'road') {
          if (item.select == true) {
            item.select = false;
            item.s = 'F';
            if (item.ls) { // 情侣座
              item.iconSrc = this.data.lovesIcon;
              let seatInfo = rowId + "排" + loveColId + "座";
              this.removeSeat(seatInfo);
            } else { // 非情侣座
              item.iconSrc = this.data.seatIcon;
            }

            let seatInfo = rowId + "排" + colId + "座";
            this.removeSeat(seatInfo); // 移除座位
            this.updatePrice(); // 计算价格

          } else {
            if (item.ls) {
              if (this.data.selectSeatList.length + 1 >= this.data.maxSelected) {
                showToast('最多选择' + this.data.maxSelected + '个座位');
                return
              }
            } else {
              if (this.data.selectSeatList.length >= this.data.maxSelected) {
                showToast('最多选择' + this.data.maxSelected + '个座位');
                return
              }
            }

            item.select = true;
            item.s = 'S';
            let currentSeat = {};
            let seatInfo = rowId + "排" + colId + "座";
            currentSeat.seatInfo = seatInfo;

            // 参数
            currentSeat.eventPrice = this.data.currentScene.eventPrice;
            currentSeat.strategyPrice = this.data.currentScene.terraceFilmPrice;
            currentSeat.ticketPrice = this.data.currentScene.price;
            currentSeat.seatRow = rowId;
            currentSeat.seatRowId = rowId;
            currentSeat.seatCol = colId;
            currentSeat.seatColId = colId;
            currentSeat.seatNo = item.sn
            currentSeat.sectionId = item.sc;
            currentSeat.ls = item.ls;
            currentSeat.rowIndex = rowIndex;
            currentSeat.colIndex = colIndex;
            currentSeat.index = Number(rowId) + Number(colId);

            if (item.ls) { // 情侣座
              item.iconSrc = this.data.selectLoves;
              let nextLoveSeat = {};
              let seatInfo = rowId + "排" + loveColId + "座";

              // 下一个情侣座参数
              nextLoveSeat.seatInfo = seatInfo;
              nextLoveSeat.eventPrice = this.data.currentScene.eventPrice;
              nextLoveSeat.strategyPrice = this.data.currentScene.terraceFilmPrice;
              nextLoveSeat.ticketPrice = this.data.currentScene.price;
              nextLoveSeat.seatRow = rowId;
              nextLoveSeat.seatRowId = rowId;
              nextLoveSeat.seatCol = String(loveColId);
              nextLoveSeat.seatColId = String(loveColId);
              nextLoveSeat.seatNo = seatNo;
              nextLoveSeat.sectionId = item.sc;
              nextLoveSeat.ls = item.ls;
              nextLoveSeat.rowIndex = rowIndex;
              nextLoveSeat.colIndex = colIndex;
              nextLoveSeat.index = Number(rowId) + Number(loveColId);
              this.data.selectSeatList.push(nextLoveSeat); // 增加情侣座
            } else { // 非情侣座
              item.iconSrc = this.data.selectIcon;
            }
            this.data.selectSeatList.push(currentSeat); // 已选座位
            this.updatePrice(); // 计算价格

          }
          this.setData({
            selectSeatList: this.data.selectSeatList
          })
        }
      }
    }
    this.setData({
      seatArray: seatArray
    })
  },

  /**
   * 取消座位
   */
  cancelSeat(e) {
    let selectSeatList = this.data.selectSeatList; // 选中座位数组
    let seatArray = this.data.seatArray; // 重组后的座位数组
    let x = e.currentTarget.dataset.x; // 原始数组中的X坐标
    let y = e.currentTarget.dataset.y; // 原始数组中的Y坐标
    let currentSeat = seatArray[x][y]; // 当前座位
    let nextSeat = seatArray[x][y + 1]; // 下一个情侣座
    let prevSeat = seatArray[x][y - 1]; // 上一个情侣座

    // 更新当前座位状态图标
    if (currentSeat.ls) { // 情侣座
      if (nextSeat) {
        if (currentSeat.ls == nextSeat.ls) {
          nextSeat.iconSrc = this.data.lovesIcon;
        }
      }
      if (prevSeat) {
        if (currentSeat.ls == prevSeat.ls) {
          prevSeat.iconSrc = this.data.lovesIcon;
        }
      }
      currentSeat.iconSrc = this.data.lovesIcon;
    } else { // 非情侣座
      currentSeat.iconSrc = this.data.seatIcon;
    }

    // 删除选中座位数组中的当前座位
    let index = Number(e.currentTarget.id);
    let cancelCurrent = selectSeatList[index];

    if (cancelCurrent.ls) { // 情侣座
      if (selectSeatList[index + 1]) { // 移除对应的情侣座
        if (cancelCurrent.ls == selectSeatList[index + 1].ls) {
          this.removeSeat(selectSeatList[index + 1].seatInfo);
        }
      }
      if (selectSeatList[index - 1]) { // 移除对应的情侣座
        if (cancelCurrent.ls == selectSeatList[index - 1].ls) {
          this.removeSeat(selectSeatList[index - 1].seatInfo);
        }
      }
    }
    this.removeSeat(cancelCurrent.seatInfo); // 移除当前座位
    this.updatePrice(); // 计算价格

    // 更新座位
    this.setData({
      seatArray: seatArray,
    });

  },

  /**
   * 移除座位函数
   */
  removeSeat(val) {
    for (var a = 0; a < this.data.selectSeatList.length; a++) {
      if (this.data.selectSeatList[a].seatInfo == val) {
        this.data.selectSeatList.splice(a, 1);
        break;
      }
    }
    this.setData({
      selectSeatList: this.data.selectSeatList
    })
  },

  /**
   * 计算价格
   */
  updatePrice() {
    let activityPrice = Number(this.data.currentScene.eventPrice); // 活动价
    let discounPrice = Number(this.data.currentScene.price); // 折扣价或者原价
    let activityNum = this.data.seatData.eventLimitTicketAmount; // 活动购买张数
    let totalSeatNum = this.data.selectSeatList.length; // 选中座位数
    let totalTicketPrice; // 总票价

    // 是否有活动
    if (this.data.currentScene.eventIsSatart) { // 活动标识
      if (activityNum > 0 && activityNum != 999) { // 活动限购
        if (totalSeatNum > activityNum) {
          let diffNum = totalSeatNum - activityNum; // 差价
          totalTicketPrice = (activityPrice * activityNum) + (diffNum * discounPrice);
        } else {
          totalTicketPrice = activityPrice * totalSeatNum;
        }
      } else {
        totalTicketPrice = discounPrice * totalSeatNum;
      }
      if (activityNum == 999 && this.data.limitNum == 0) { // 活动不限购
        totalTicketPrice = activityPrice * totalSeatNum;
      }
    } else {
      totalTicketPrice = totalSeatNum * discounPrice;
    }
     totalTicketPrice = parseFloat(totalTicketPrice.toFixed(2));
    // 更新票价
    this.setData({
      totalTicketPrice: totalTicketPrice
    })
  },
  /**
   * 确认选座
   */
  submit() {

    // 恶意留空座检索
    let result = this.data.selectSeatList.every((element, index, array) => {
      return this._checkSeat(element, this.data.selectSeatList)
    })

    if (!result) {
      showToast('旁边不要留空座');
      return
    }

    // 订单参数
    let creatOrderParams = {
      oldOrderNo: this.data.seatData.needPayOrderNo,
      showTime: this.data.rightDate,
      eventCode: "",
      hallCode: this.data.seatData.hallCode,
      showCode: this.data.currentScene.showCode,
      filmCode: this.data.currentScene.filmCode,
      filmNo: this.data.currentScene.filmNo,
      recvpPhone: wx.getStorageSync('member').phone,
      payType: '3',
      seatInfo: JSON.stringify(this.data.selectSeatList),
      companyChannelId: wx.getStorageSync('melonSource') ? 14 : 5
    }

    // 是否已经存在订单
    let ticketType = 1;
    let _this = this;
    if (this.data.seatData.needPayOrderNo) {
      wx.showModal({
        title: '提示',
        content: '有未支付订单',
        cancelText: '去支付',
        confirmText: '支付本单',
        success(res) {
          if (res.cancel) { // 去支付
            // 携带参数并跳转
            let orderNo = _this.data.seatData.needPayOrderNo;
            let isConfirm = _this.data.seatData.confirmFlag;
            if (isConfirm == '0') {
              wx.navigateTo({
                url: `/pages/order/submit-order/submit-order?orderNo=${orderNo}`
              })
            } else if (isConfirm == '1') {
              wx.navigateTo({
                url: `/pages/order/order-detail/order-detail?orderNo=${orderNo}&type=1`
              })
            }
          } else if (res.confirm) { // 支付本单
            creatOrder(ticketType, null, _this.creatOrderCall, creatOrderParams); // 创建订单
          }
        }
      })
    } else {
      creatOrder(ticketType, null, this.creatOrderCall, creatOrderParams); // 创建订单
    }
  },

  /**
   * 订单成功回调
   */
  creatOrderCall(res) {
    wx.hideLoading();

    // 神策埋点
    let _this = this;
    app.sensors.track('selectSeat', {
      platform_type: '小程序',
      cinemaName: wx.getStorageSync('cinemaName'),
      filmName: _this.data.filmName,
      filmPlayID: _this.data.currentScene.showCode,
      filmPlaytime: new Date(_this.data.rightDate),
      filmOriginalPrice: Number(_this.data.currentScene.price),
      filmActualPrice: Number(_this.data.currentScene.terraceFilmPrice),
      purchaseNumber: _this.data.selectSeatList.length,
      totalActualPrice: _this.data.totalTicketPrice
    })

    // 创建订单成功
    let orderNo = res.resultData.orderNo;
    let orderTime = res.resultData.orderTimeOut;
    this.queryGoods(orderNo, orderTime);
  },

  /**
   *
   * @param {*} 查询是否有卖品
   */
  queryGoods(orderNo, orderTime) {
    ajaxPromise(false, isHasGoods, {
      channel: '5'
    })
      .then((res) => {
        if (res.resultData == 0) {
          wx.navigateTo({
            url: `/pages/order/submit-order/submit-order?orderNo=${orderNo}`
          })
        } else {
          wx.navigateTo({
            url: `/pages/order/choose-goods/choose-goods?orderNo=${orderNo}&orderTime=${orderTime}`
          })
        }
      })
      .catch(() => {
      })
  },

  /**
   * 座位图改变
   */
  onChange(e) {
    this.updateEffect(this.data.colNumber);
  },

  /**
   * 座位图缩放
   */
  onScale(e) {
     // console.log(e);
    this.updateEffect(this.data.colNumber);
  },

  /**
   * 更新座位图效果
   */
  updateEffect(rowArrayLen) {
    const query = wx.createSelectorQuery();
    query.select('#seatView').boundingClientRect();
    query.exec((res) => {
      let height = res[0].height;
      let rowHeight = height / rowArrayLen;
      let top = res[0].top;
      this.setData({
        height: height,
        rowHeight: rowHeight,
        lineTop: top,
      })
    })
  },

  /**
   *
   * @param {element} 当前选择的座位集合
   * @param {selectSeatList} 选中的座位数组
   */
  _checkSeat(element, selectSeatList) {

    let checkNum = 2 + selectSeatList.length - 1;
    let isLove = element.ls;
    let x = element.rowIndex; // 横坐标
    let y = element.colIndex; // 纵坐标

    if (isLove) {
      // 如果是情侣座 不检测
      return true
    }

    // 检查座位左侧
    let left = this._checkSeatDirection(x, y, checkNum, '-');

    //  console.log('left-----' + left);

    // 如果左侧已经检查出是靠着过道直接 返回true
    if (left === 'special') {
      return true
    }

    // 检查座位右侧
    let right = this._checkSeatDirection(x, y, checkNum, '+');

    //  console.log('right+++++' + right);

    if (right === 'special') {
      // 无论左侧是否是什么状态 检查出右侧靠着过道直接 返回true
      return true
    } else if (right === 'normal' && left === 'normal') {
      // 如果左右两侧都有富裕的座位 返回true
      return true
    } else if (right === 'fail' || left === 'fail') {
      // 如果左右两侧都是不通过检测 返回false
      return false
    }
    return true
  },

  /**
   *
   * @param {*} x 横坐标 也就是索引值
   * @param {*} y 纵坐标 也就是索引值
   * @param {*} checkNum 要检索的座位数
   * @param {*} direction 要检索的座位方向
   */
  _checkSeatDirection(x, y, checkNum, direction) {
    let emptySeat = 0;
    let a = 1; // 检查位置 只允许在x的位置出现过道,已售
    let checkCurrent; // 根据 x y 找出检查座位左边按顺序排列的checkNum
    let seatArray = this.data.seatArray;

    for (let i = 1; i <= checkNum; i++) {
      if (direction === '-') { // 左侧
        checkCurrent = seatArray[x][y - i];
      } else if (direction === '+') { // 右侧
        checkCurrent = seatArray[x][y + i];
      }

      //  console.log(checkCurrent);

      if (a === i) {
        if (checkCurrent === undefined || checkCurrent.type === 'road') {
          // 过道
          return 'special'
        }
        if (checkCurrent.s === 'B') {
          // 已售
          return 'special'
        }
        let checkSelect = false
        if (checkCurrent.s === 'S') {
          // 已选 检测下一位
          a++
          checkSelect = true;
        }
        if (checkSelect) {
          continue
        }
      } else {
        if (checkCurrent === undefined || checkCurrent.type === 'road') {
          // 过道
          return 'fail'
        }
        if (checkCurrent.s === 'B') {
          // 已售或者维修
          return 'fail'
        }
        if (checkCurrent.s === 'S') {
          return 'fail'
        }
      }
      emptySeat++
      if (emptySeat >= 2) {
        return 'normal'
      }
    }
  }

})
