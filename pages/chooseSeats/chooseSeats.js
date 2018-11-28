// pages/chooseSeats/chooseSeats.js
var url = require('../../utils/url.js'),
  util = require('../../utils/util.js'),
  URL = url.selTicketsUrl,
  URL2 = url.createOrder,
  logoutToken = util.logoutToken, //退出登录以后，清仓除缓存的用户信息
  cinemaCode,
  memberCode,
  memberPhone,
  member,
  discountPrice = '0', //原价（限购票数已用完明使用的价格）
  cinemaName,
  // eventTicketNum, // 每人限购活动票数
  needPayOrderNo = '', //待支付订单号
  selTicketPara,
  // seatsMap = [], //座位图
  seatNum = {}, //逻辑座位号
  // NUM = 0, //已选座位数
  listInfo, //排片信息列表
  showTime = ''; //是否第一次进入页面的表示
// backFlag = 0; //当前是否为卖品返回页，true：是返回页，false：是排片直接进入页

Page({
  /**页面的初始数据**/
  data: {
    hideWin1: true,
    hideWin2: true,
    hideWin3: true,
    hideWin4: true,
    hideWin5: true,
    nocancel: true,
    show: true,
    hideLegend: false,
    hideSelected: true,
    seatInfo: {
      seat: []
    }, //已选中的座位信息
    NUM: 0, //已选座位数
    price: 30, //用来计算总金额的票价
    eventPrice: 0, //活动价格
    totalPrice: 0, //购票所需总金额
    countTime: { //倒计时时间
      dd: 0, //天
      hh: 0, //时
      mm: 0, //分
      ss: 0 //秒
    },
    countDownFlag: true, //倒计时部分是否隐藏
    hideDay: false, //倒计时的天是否隐藏
    eventCode: '', //活动编码
    // needPayOrderNo: '', //待支付订单号
    toastItem: {
      text: 'sucess!',
      toast_visible: !1
    },
    eventTicketNum: undefined, // 每人限购活动票数
    middleWidth: 0, // middle的宽
    middleHeigh: 0, // middle的高
    left: 0,
    seatsWrapWidth: 0,
    startPoint: [0, 0]

  },

  /*生命周期函数--监听页面加载*/
  onLoad: function(options) {
    wx.hideShareMenu();

    var that = this,
      opt = options,
      price = Number(that.data.price); //获取data数据对象里的票价
    member = wx.getStorageSync('member');
    listInfo = JSON.parse(opt.listInfo); //排片信息列表
    console.log(listInfo);
    if (listInfo.terraceFilmPrice && listInfo.terraceFilmPrice > 0) {
      discountPrice = listInfo.terraceFilmPrice;
    } else {
      discountPrice = listInfo.filmPrice;
    }
    var showDate = listInfo.showDate, //影片本场的播放日期”2017-06-28“
      filmName = opt.filmName, //影片名称
      eventCode = listInfo.eventCode, //活动编码
      showCode = listInfo.showCode, //播放编码
      hallCode = listInfo.hallCode, //影厅编码 
      filmNo = listInfo.filmNo,
      startTime = listInfo.startTime, //影片开播时间
      cinemaName = wx.getStorageSync('cinemaName'), //影院名
      filmSight = listInfo.filmLang + ' ' + listInfo.filmSight, //‘英语 3D’这类的字眼
      hallName = listInfo.hallName, //影厅名
      filmCode = listInfo.filmCode; //影片编码
    if (listInfo.ismorrow == '1') {
      var dayArr = showDate.split('-'),
        day = Number(dayArr[2]) + 1;
      showDate = dayArr[0] + '-' + dayArr[1] + '-' + day;
    }
    var eventPrice; //这个活动价格用来在头部倒计时部分显示用
    price = Number(discountPrice);
    // originalPrice = listInfo.filmPrice;  

    that.setData({
      filmName: filmName,
      cinemaName: cinemaName,
      filmSight: filmSight,
      showDate: showDate,
      startTime: startTime,
      hallName: hallName,
      price: price,
    });
    cinemaCode = wx.getStorageSync('cinemaCode');
    memberCode = member.memberCode;
    memberPhone = member.memberPhone;
    selTicketPara = {
      'cinemaCode': cinemaCode,
      'memberCode': memberCode,
      'showCode': showCode,
      'hallCode': hallCode,
      'filmCode': filmCode,
      'filmNo': filmNo,
      'showDate': showDate,
      'startTime': startTime,
      'eventCode': eventCode
    };
    that.ajaxFn();
  },
  // 优化座位图
  FormatSeat: function(data) {
    if (data == null) {
      return false
    }
    var arr = new Array();
    var leftBl = false;
    var rightBl = false;
    for (var i = 0; i < data.nos.length; i++) {
      if (leftBl || (data.nos[i] != '' && data.nos[i] != undefined)) {
        leftBl = true;
        arr.push(data.nos[i])
      }
    }
    var arr2 = new Array();
    for (var j = arr.length - 1; j >= 0; j--) {
      if (rightBl || Number(arr[j]) != '') {
        rightBl = true;
        arr2.push(arr[j])
      }
    }
    var rowDifference = Number(data.nos.length - Number(arr.length));
    for (var seat in data.seats) {
      data.seats[seat].rowNum -= rowDifference;
    }
    data.nos = arr2.reverse(); //优化行
    var maxColIdReal = 0,
      maxColIdLogic = 0,
      minColIdLogic = 99999;
    var arrColNum = [];
    for (var seat in data.seats) {
      var tmp_colId = Number(data.seats[seat].colNum);
      //arrColNum.add(tmp_colId);
      if (arrColNum.indexOf(tmp_colId) == -1) {
        arrColNum.push(tmp_colId);
      }
      if (maxColIdLogic < tmp_colId) {
        maxColIdLogic = tmp_colId;
      }
      if (minColIdLogic > tmp_colId) {
        minColIdLogic = tmp_colId;
      }
    }
    maxColIdReal = arrColNum.length;
    var colDifference = Number(data.maxCol) - Number(maxColIdReal);
    if (colDifference < 0) {
      data.maxCol = maxColIdReal; //优化列
    }
    if ((data.maxCol != maxColIdLogic || minColIdLogic > 1) && colDifference < minColIdLogic) {
      for (var seat in data.seats) {
        data.seats[seat].colNum -= colDifference;
      }
      data.maxCol = maxColIdReal; //优化列
    }
    return data;
  },

  //ajax function
  ajaxFn: function() {
    var that = this,
      data; //用来承载request到的数据
    wx.createSelectorQuery().select('.seatsWrap').boundingClientRect(function(rect) {
      that.setData({
        seatsWrapWidth: rect.width
      })
    }).exec();

    //获取座位图信息
    wx.request({
      url: URL,
      method: 'GET',
      data: selTicketPara,
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      success: function(res) {
        // console.log(res);
        if (res.data.resultDesc == 'TOKEN_INVALID') {
          logoutToken(); //退出登录时清除用户缓存信息         
          that.setData({
            hideWin5: false
          });
        }

        data = res.data.resultData;
        that.FormatSeat(data);
        if (data == null) {
          return false
        }
        var nos = data.nos,
          nosLen = nos.length,
          seats = data.seats,
          maxCol = data.maxCol,
          rowWidth = (maxCol + 1) * 58,
          middleHeigh = 50 * nosLen,
          left = (that.data.seatsWrapWidth - (rowWidth - 287)) / 2;
        if (rowWidth > that.data.seatsWrapWidth) {
          left = left
        } else if (rowWidth < that.data.seatsWrapWidth) {
          left = left
        }
        var seatsMap = []; //座位图
        that.setData({
          rowWidth,
          left,
          middleWidth: (rowWidth / 2) + 29,
          middleHeigh,
          nos: nos,
          limitTicketAmount: data.limitTicketAmount
        });
        needPayOrderNo = data.needPayOrderNo;
        if (nos == undefined) {
          that.setData({
            hideWin1: false
          });
        } else {
          for (var i = 1; i < nos.length + 1; i++) { //循环行
            var rowData = [];
            for (var j = 1; j <= maxCol; j++) { //循环列
              var mapID = {
                seatStatus: '-',
                id: ''
              };
              for (var k = 0; k < seats.length; k++) {
                if (seats[k].rowNum == i && seats[k].colNum == j) {
                  mapID.seatStatus = seats[k].seatStatus;
                  mapID.id = seats[k].rowId + "_" + seats[k].colId + "_" + seats[k].seatNo + "_" + seats[k].sectionId;
                  break;
                }
              }
              rowData[j] = mapID;
            }
            seatsMap.push(rowData);
          }
        }
        that.setData({
          seatsMap: seatsMap
        });
      },
      complete: function() {
        var eventCode = listInfo.eventCode;
        var eventEndTime = new Date(listInfo.eventEndTime.replace(/-/g, "/")),
          eventStopTime = listInfo.eventEndTime;
        var now = new Date(eventEndTime);
        if (listInfo.eventCode != "" && listInfo.eventIsSatart == true) { //活动相关
          // console.log('活动开始了')
          //活动期间
          that.setData({
            eventPrice: listInfo.eventPrice
          });
          if (eventEndTime.getTime() > now.getTime()) {
            that.showCountDown(eventEndTime); //计算倒计时
            setInterval(function() {
              that.showCountDown(eventEndTime);
            }, 1000);
          }
          that.setData({
            // countDownFlag: false,  //页面倒计时部分不再隐藏
            price: Number(listInfo.eventPrice)
          });
          var usedNum = data.usedNum,
            discountNum = data.discountNum,
            eventTicketNum = data.eventLimitTicketAmount;
          that.setData({
            eventTicketNum: eventTicketNum
          });
          if (discountNum == undefined) {
            discountNum = '';
          }
          if (discountNum != '' && discountNum != '0') {
            if (eventTicketNum <= 0) {
              that.setData({
                toastItem: {
                  text: "活动票已抢光，将按" + discountPrice + "元支付",
                  toast_visible: !0
                }
              });
              setTimeout(function() {
                that.setData({
                  toastItem: {
                    toast_visible: !1
                  }
                });
              }, 2000);

            } else {
              var hintStr1 = "本次特惠活动限购" + discountNum + "张/人，您还可享" + eventTicketNum + "张特惠票，超出将按非活动价收费";
              wx.showModal({
                title: '提示',
                content: hintStr1,
                showCancel: false,
                confirmText: '知道了',
                success: function(res) {
                  if (res.confirm) {}
                }
              });
            }
          } else {
            usedNum = 0;
          }
        }
				//  else if (now.getTime() < eventStartTime.getTime()) {
        //   console.log('活动还没有开始')
        //   eventCode = '';
        //   var hintStr = "活动还未开始，购票价格为" + discountPrice + "元，活动开始时间" + listInfo.eventStartTime.substring(11, 16) + ",可享" + that.data.eventPrice + "元特惠观影";
        //   wx.showModal({
        //     title: '提示',
        //     content: hintStr,
        //     showCancel: false,
        //     confirmText: '知道了',
        //     success: function(res) {
        //       if (res.confirm) {}
        //     }
        //   });
        // }
      }
    });

  },

  /*生命周期函数--监听页面初次渲染完成*/
  onReady: function() {

    var that = this;
    wx.setNavigationBarTitle({
      title: that.data.filmName,
    });
  },

  /*生命周期函数--监听页面显示*/
  onShow: function() {
    this.setData({
      seatInfo: {
        seat: []
      },
      NUM: 0,
      totalPrice: 0
    });
    this.ajaxFn();
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    showTime = '';
  },

  /*页面相关事件处理函数--监听用户下拉动作*/
  onPullDownRefresh: function() {
    this.setData({
      seatInfo: {
        seat: []
      },
      totalPrice: 0,
      hideLegend: false,
      NUM: 0
    });
    this.ajaxFn();
    wx.stopPullDownRefresh();
  },

  /*用户点击右上角分享*/
  onShareAppMessage: function() {
    var that = this;
    that.ajaxFn();
    wx.stopPullDownRefresh();
  },

  //页面跳转函数
  go: function(e, url) {
    wx.navigateTo({
      url: url
    })
  },
  redirectTo: function(e, url) {
    wx.redirectTo({
      url: url,
    })
  },
  //倒计时
  showCountDown: function(endTime) {
    var the = this,
      hideDay = the.data.hideDay, //取出data数据对象里的hideDay值
      countTime = the.data.countTime, //取出data数据对象里的countTime值
      now = new Date(),
      endDate = new Date(endTime),
      leftTime = endDate.getTime() - now.getTime(),
      dd = parseInt(leftTime / 1000 / 60 / 60 / 24, 10), //计算剩余的天数
      hh = parseInt(leftTime / 1000 / 60 / 60 % 24, 10), //计算剩余的小时数
      mm = parseInt(leftTime / 1000 / 60 % 60, 10), //计算剩余的分钟数
      ss = parseInt(leftTime / 1000 % 60, 10); //计算剩余的秒数
    if (dd <= 0 && hh <= 0 && mm <= 0 && ss <= 0) {
      $(".sitT").hide();
    }
    dd = the.checkTime(dd);
    hh = the.checkTime(hh);
    mm = the.checkTime(mm);
    ss = the.checkTime(ss); //小于10的话加0
    if (dd == "00") {
      hideDay = true;
    }
    countTime.dd = dd;
    countTime.hh = hh;
    countTime.mm = mm;
    countTime.ss = ss;
    the.setData({
      hideDay: hideDay,
      countTime: countTime,
    });
  },
  //重置时间数字
  checkTime: function(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  },
  //选座
  selectTicket: function(e) {
    // console.log(e)
    var that = this,
      seatInfo = that.data.seatInfo,
      seats = that.data.seatInfo.seat, // 含有已选座信息的数组
      selectSeat = {}, //已选座位信息
      limitTicketAmount = that.data.limitTicketAmount, //最多可选座位数
      target = e.currentTarget.dataset, //data属性
      i = target.rowindex, //行序号
      j = target.colindex, //列序号
      id = target.id.split('_'), //座位的各种id
      seatsMap = this.data.seatsMap, //座位图
      seatState = seatsMap[i][j].seatStatus, //座位状态
      // flag_01 = seatsMap[i][j].seatStatus == 'F', //第一个座位是否可选
      endNum = seatsMap[i].length,
      flag_r1, //所选座位右一是否可选
      flagR1b, //所选座位右一是否已售
      flagR1s, //所选座位右一是否已选
      flagR1Null, //所选座位右一是否为过道
      flag_l1, //所选座位左一是否可选
      flagL1b, //所选座位左一是否已售
      flagL1s, //所选座位左一是否已选
      flagL1Null, //所选座位左一是否为过道
      flag_l2, //所选座位左二是否已售或已选
      flagL2Null, //所选座位左二是否为过道
      flag_r2, //所选座位右二是否已售或已选
      flagR2Null, //所选座位右二是否为过道
      NUM = that.data.NUM,
      price = Number(that.data.price), //获取data数据对象里的票价
      totalPrice = that.data.totalPrice, //获取data数据对象里购票所需总金额
      eventTicketNum = that.data.eventTicketNum;

    // flag_end = seatsMap[i][endNum - 1].seatStatus == 'F', //最后一个座位是否可选
    if (j < endNum - 1) {
      flag_r1 = seatsMap[i][j + 1].seatStatus == 'F';
      flagR1b = seatsMap[i][j + 1].seatStatus == 'B';
      flagR1s = seatsMap[i][j + 1].seatStatus == 'S';
      flagR1Null = seatsMap[i][j + 1].seatStatus == '-';
    }
    if (j > 1) {
      flag_l1 = seatsMap[i][j - 1].seatStatus == 'F';
      flagL1b = seatsMap[i][j - 1].seatStatus == 'B';
      flagL1s = seatsMap[i][j - 1].seatStatus == 'S';
      flagL1Null = seatsMap[i][j - 1].seatStatus == '-';
    }
    if (j < endNum - 2) {
      flag_r2 = seatsMap[i][j + 2].seatStatus == 'B' || seatsMap[i][j + 2].seatStatus == 'S';
      flagR2Null = seatsMap[i][j + 2].seatStatus == '-';
    }
    if (j > 2) {
      flag_l2 = seatsMap[i][j - 2].seatStatus == 'B' || seatsMap[i][j - 2].seatStatus == 'S';
      flagL2Null = seatsMap[i][j - 2].seatStatus == '-';
    }
    selectSeat.seatNo = id[2]; //座位编号
    selectSeat.seatRow = id[0]; //物理行号:影厅实际行号 
    selectSeat.seatRowId = id[0];
    selectSeat.seatCol = id[1]; //物理列号:影厅实际列号
    selectSeat.seatColId = id[1];
    selectSeat.sectionId = id[3];
    selectSeat.handlingFee = '0'; //手续费
    selectSeat.ticketPrice = listInfo.filmPrice + ''; //filmPrice是原价
    var terraceFilmPrice = listInfo.terraceFilmPrice;
    if (typeof(terraceFilmPrice) == 'undefined' || terraceFilmPrice == '' || terraceFilmPrice == listInfo.filmPrice) {
      terraceFilmPrice = "0";
    }
    selectSeat.strategyPrice = terraceFilmPrice + ''; //策略价 
    var eventp = listInfo.eventPrice;
    if (eventp == '' || eventp == undefined) {
      eventp = "0";
    }
    selectSeat.eventPrice = eventp + ''; //活动价
    // console.log(endNum);
    if (seatState == 'F') { //如果所选是空座位
      var flag = (j == 2 && flag_l1 && flag_r1) || (j == endNum - 2 && flag_l1 && flag_r1) || (flag_l1 && flag_l2 && flag_r1) || (flag_l1 && flag_r1 && flag_r2) || (flag_r1 && flag_l1 && flagL2Null) || (flag_r1 && flag_l1 && flagR2Null);
      if (flag) {
        that.setData({
          toastItem: {
            text: '抱歉，旁边不能有空的座位!',
            toast_visible: !0
          }
        });

        setTimeout(function() {
          that.setData({
            toastItem: {
              toast_visible: !1
            }
          });
        }, 2000);
        return false;
      }
      NUM++;
      if (NUM > limitTicketAmount) {
        that.setData({
          toastItem: {
            text: "最多只能选择" + limitTicketAmount + "张票！",
            toast_visible: !0
          }
        });
        setTimeout(function() {
          that.setData({
            toastItem: {
              toast_visible: !1
            }
          });
        }, 2000);
        NUM--;
        return false;
      }
      seatsMap[i][j].seatStatus = 'S';
      if (eventTicketNum > 0 && eventTicketNum != '') {
        price = eventp;
        selectSeat.strategyPrice = '0'; //实际价格
      } else {
        selectSeat.eventPrice = '0';
        price = Number(discountPrice);
      }
      eventTicketNum--;
      price = Number((price * 100).toFixed()) / 100;
      totalPrice += price;
      //在选中座位数组中添加所点击的座位
      seats.push(selectSeat);
      that.setData({
        hideSelected: false,
        hideLegend: true
      });
    } else if (seatState == 'S') { //如果所选是已选座位
      var flag1 = (j == 0 && flagR1s) || (j == endNum - 1 && flagL1s) || (flagR1b && flagL1s) || (flagL1b && flagR1s) || (flagR1s && flagL1s);
      if (flag1) {
        that.setData({
          toastItem: {
            text: '抱歉，旁边不能有空的座位!',
            toast_visible: !0
          }
        });
        setTimeout(function() {
          that.setData({
            toastItem: {
              toast_visible: !1
            }
          });
        }, 2000);
        return false;
      }
      NUM--;
      seatsMap[i][j].seatStatus = 'F';
      if (!isNaN(eventTicketNum)) {
        if (eventTicketNum < 0 && eventTicketNum != '') {
          price = Number(discountPrice); //非活动
        } else {
          price = eventp; //活动
        }
        eventTicketNum++;
      } else {
        price = discountPrice;
      }
      totalPrice -= price;
      //从选中座位数组中删除所点击的座位
      for (var n = 0; n < seats.length; n++) {
        if (seats[n].seatCol == selectSeat.seatCol && seats[n].seatRow == selectSeat.seatRow) {
          seats.splice(n, 1);
        }
      }
      if (seats.length == 0) {
        that.setData({
          hideSelected: true,
          hideLegend: false
        });
      }
    }
    totalPrice = Number((totalPrice * 100).toFixed()) / 100;
    that.setData({
      seatsMap: seatsMap,
      seatInfo: seatInfo,
      NUM: NUM,
      totalPrice: totalPrice,
      eventTicketNum: eventTicketNum
    });
  },
  createOrder: function(e) {
    var THAT = this,
      startDateTime = THAT.data.showDate + " " + listInfo.startTime,
      showStart = new Date(startDateTime.replace(/-/g, "/")),
      minutes = Number((showStart.getTime() - new Date().getTime()) / 1000),
      seatInfo = THAT.data.seatInfo,
      eventStopTime = listInfo.eventEndTime;
    if (seatInfo.seat.length == "" || seatInfo.seat.length == 0) {
      THAT.setData({
        toastItem: {
          text: '请选择座位',
          toast_visible: !0
        }
      });
      setTimeout(function() {
        THAT.setData({
          toastItem: {
            toast_visible: !1
          }
        });
      }, 2000);
    } else {
      if (needPayOrderNo != "" && needPayOrderNo != null) {
        // THA
        wx.showModal({
          title: '提示',
          content: '有未支付订单',
          cancelText: '去支付',
          confirmText: '支付本单',
          success: function(res) {
            // console.log(res)
            if (res.cancel) { //点击了去支付
              var url = '../confirmOrder/confirmOrder?orderNo=' + needPayOrderNo;
              THAT.redirectTo(e, url); //关闭当前页面，前往确认订单页面
            } else if (res.confirm) { //点击了支付本单
              THAT.toCreatOrder();
            }
          },
          fail: function() {},
          complete: function() {}
        })
      } else {
        if (eventStopTime != '' && new Date().getTime() > eventStopTime) {
          THAT.setData({
            hideWin4: false
          });
        } else {
          THAT.toCreatOrder();
        }
      }
    }
  },
  toCreatOrder: function(e) {
    // console.log(e)
    var THE = this;
    var startDateTime = THE.data.showDate + " " + listInfo.startTime,
      createOrderParam = {};
    //创建订单传的参数
    createOrderParam.token = member.token;
    createOrderParam.CVersion = wx.getStorageSync('CVersion');
    createOrderParam.OS = wx.getStorageSync('OS');
    createOrderParam.memberCode = memberCode;
    createOrderParam.oldOrderNo = needPayOrderNo;
    createOrderParam.cinemaCode = cinemaCode;
    createOrderParam.showTime = startDateTime;
    createOrderParam.eventCode = listInfo.eventCode;
    createOrderParam.hallCode = selTicketPara.hallCode;
    createOrderParam.showCode = selTicketPara.showCode;
    createOrderParam.filmCode = selTicketPara.filmCode;
    createOrderParam.filmNo = selTicketPara.filmNo;
    createOrderParam.payType = "3"; //微信支付    
    createOrderParam.recvpPhone = memberPhone;
    createOrderParam.seatInfo = JSON.stringify(THE.data.seatInfo.seat);
    createOrderParam.channel = "5";

    //创建订单
    wx.request({
      url: URL2,
      method: 'GET',
      data: createOrderParam,
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      success: function(res) {
        var createOrderData = res.data;
        if (createOrderData.resultCode == '2202') {
          wx.navigateTo({
            url: '../Binding/binding',
          });
          return false
        }
        if (createOrderData.resultCode == '0') {
          url = '../goodsList/goodsList?showCode=' + selTicketPara.showCode + '&orderNo=' + createOrderData.resultData.orderNo;
          THE.go(e, url);
        } else {
          if (createOrderData.resultDesc == 'TOKEN_INVALID') {
            logoutToken(); //退出登录时清除用户缓存信息          
            THE.setData({
              hideWin5: false
            });
          }
        }
      }
    })
  },
  //换一场
  changeSession: function(e) {
    wx.navigateBack({
      delta: 1
    });
  },

  //以下是弹框的事件
  confirm1: function(e) {
    this.setData({
      hideWin1: true
    });
    var url = "../home/index";
    this.redirectTo(e, url);
  },

  confirm4: function(e) {
    this.setData({
      hideWin4: true
    });

    this.toCreatOrder();
  },

  cancel4: function(e) {
    this.setData({
      hideWin4: true
    });

    var url = "../home/index";
    this.redirectTo(e, url);
  },
  confirm5: function(e) {
    this.setData({
      hideWin5: true
    });
    var url = '../login/login';
    this.redirectTo(e, url);
  },

  mytouchstart: function(e) {
    this.setData({
      startPoint: [e.touches[0].pageX, e.touches[0].pageY]
    })
  },

  mytouchmove: function(e) {
    var corPoint = [e.touches[0].pageX, e.touches[0].pageY],
      startPoint = this.data.startPoint;

    if (Math.abs(corPoint[0] - startPoint[0]) >= Math.abs(corPoint[1] - startPoint[1])) {
      if (this.data.left < 0) {
        this.setData({
          left: 0
        })
      }
    }
  }
});