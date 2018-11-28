//index.js
//获取应用实例
// var WXBizDataCrypt = require('../../utils/RdWXBizDataCrypt.js'),
var url = require('../../utils/url.js'),
  configJson = require('../../utils/bin.js').config,
  sessionID = url.sessionID,
  userInfoUrl = url.userInfoUrl,
  app = getApp(),
  bannerUrl = url.bannerUrl,
  filmUrl = url.index,
  wxBindPhoUrl = url.wxBindPho,
  cinemaCode,
  member,
  memberCode,
  movieCode,
  OS,
  CVersion,
  cinemaname,
  shows, //影片排期
  wxLoginUrl = url.wxLogin,
  // appId = 'wx356ead1662fd96f1',
  // AppSecret = '9e2e4efd4993408d364db98a69ebcb71',
  wxLoginPara,
  loginFlag = true; //禁止频繁多次登录：第一次登录示完成时不允许再次点击登录

Page({
  data: {
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 50,
    // tabFlag: true,
    dotColor: 'rgba(255, 255, 255, .5)', //banner dot 的色值
    dotCurColor: '#f35643', //banner dot 的当前色值
    circular: true,
    flag: true,
    cinemaName: '',
    loading: true,
    toastItem: {
      text: 'sucess!',
      toast_visible: !1
    },
    loadOverFlag: false, //
    // tabIndex: 0
  },

  onLoad: function(options) {
    var that = this
    // 获取系统信息
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          // second部分高度 = 利用窗口可使用高度 - first部分高度（这里的高度单位为px，所有利用比例将300rpx转换为px）
          scrollHeight: res.windowHeight - res.windowWidth / 750 * 88
        });
      }
    });


  },
  onShow: function() {
    var that = this;
    loginFlag = true;
    if (member == null || member == undefined) {
      member = '';
    }
    //页面从hide到show的时候，更新一下member的值
    member = wx.getStorageSync('member');
    // console.log(member);
    var memberCode = member.memberCode;
    wx.setStorageSync('memberCode', memberCode)
    wx.setStorageSync('userData', '');
    cinemaCode = wx.getStorageSync('cinemaCode'); //添加tabBar之后，cinemaCode是通过缓存拿的
    memberCode = member.memberCode;
    cinemaname = wx.getStorageSync('cinemaName');
    if (cinemaname.length > 6) {
      cinemaname = cinemaname.slice(0, 6) + '...';
    }

    OS = wx.getStorageSync('OS');
    movieCode = wx.getStorageSync('movieCode');
    CVersion = wx.getStorageSync('CVersion');

    that.setData({
      cinemaName: cinemaname
    });

    // that.getBanner();
    that.ajaxFn();

    // console.log('index 页面 onshow function');
    //  console.log(member);
  },
  onReady: function() {
    wx.setNavigationBarTitle({
      title: configJson.movieName,
    });
  },
  // getBanner: function() {
  //   var _this = this;
  //   wx.request({
  //     url: bannerUrl,
  //     method: 'GET',
  //     data: {
  //       'OS': OS,
  //       'companyCode': movieCode,
  //       'CVersion': CVersion,
  //       'cinemaCode': cinemaCode,
  //       'token': member.token,
  //       'adType': 0
  //     },
  //     header: {
  //       'Content-Type': 'text/plain',
  //       'Accept': 'application/json'
  //     },
  //     success: function(res) {
  //       // console.log(res);
  //       if (res.data.resultCode == '0') {
  //         var imgs = res.data.resultData;

  //         for (var j = 0; j < imgs.length; j++) {
  //           imgs[j].adImgNew = imgs[j].adImgNew + '?x-oss-process=image/resize,m_fixed,h_234,w_710,limit_0/quality,q_80';
  //         }

  //         _this.setData({
  //           images: imgs,
  //         });
  //       }
  //     },
  //     fail: function() {},
  //     complete: function() {}
  //   })
  // },
  ajaxFn: function() {
    var that = this;
    wx.request({
      url: filmUrl,
      method: 'GET',
      data: {
        'cinemaCode': cinemaCode,
        'filmType': 1,
        'memberCode': memberCode
      },
      /**/
      header: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json'
      },
      success: function(res) {
        // console.log(res);
        var array = res.data.resultData;
        if (array != '') {
          shows = array.shows;

          var films = array.films,
            filmLen = films.length;

          for (var i = 0; i < filmLen; i++) {
            films[i].filmPosterNew = films[i].filmPosterNew.replace("?x-oss-process=image/format,jpg", "");
            // console.log(films[i].filmPosterNew)
            //  films[i].flag = true; //给每一个电影添加一个字段，来控制场次的展示
            films[i].filmPosterNew = films[i].filmPosterNew + '?x-oss-process=image/resize,m_fill,h_258,w_196,limit_0/format,jpg/quality,q_80';
            films[i].showDateView1 = films[i].showDateView.split(',');
            films[i].showDate1 = films[i].showDate.split(',');
            films[i].tabIndex = 0;
            // films[i].idIndex = i;
            // films[i].filmLen = filmLen;
            films[i].filmLeading = films[i].filmLeading.split(',').join(' / ');

            //添加一个排片list的字段，把shows里的数据传进去，方便展示数据
            var theFilmCode = films[i].filmCode,
              scheduleList = shows[theFilmCode],
              showDate = films[i].showDate1[0];
            //给每个schList 加一个showDate字段
            var curScheList = scheduleList[showDate];
            // console.log(curScheList)
            if (curScheList != undefined) { //设置开播时间前的太阳（月亮、空）
              var timeFlag = 'moon';

              for (var m = 0; m < curScheList.length; m++) {
                //如果策略价为0或者为''，则使用原价
                if (curScheList[m].terraceFilmPrice == '' || curScheList[m].terraceFilmPrice == 0 || curScheList[m].terraceFilmPrice == undefined) {
                  curScheList[m].terraceFilmPrice = curScheList[m].filmPrice;
                }
                curScheList[m].showDate = showDate;
                var startTnum = Number(curScheList[m].startTime.split(':')[0]);
                if (m == 0) {
                  if (startTnum > 5 && startTnum < 19) {
                    timeFlag = 'sun';
                    curScheList[m].startTFlag = 'sun';
                  } else {
                    timeFlag = 'moon';
                    curScheList[m].startTFlag = 'moon';
                  }
                } else {
                  if (startTnum > 5 && startTnum < 19) {
                    if (timeFlag == 'sun') {
                      curScheList[m].startTFlag = '';
                    } else {
                      curScheList[m].startTFlag = 'sun';
                      timeFlag = 'sun';
                    }
                  } else {
                    if (timeFlag == 'moon') {
                      curScheList[m].startTFlag = '';
                    } else {
                      timeFlag = 'moon';
                      curScheList[m].startTFlag = 'moon';
                    }
                  }
                }

                var eventCode = curScheList[m].eventCode;
                if (eventCode == undefined) {
                  eventCode = '';
                }
                var eventEnd = new Date(curScheList[m].eventEndTime.replace(/-/g, "/")),
                  eventTime = '';

                // if (curScheList[m].eventIsSatart && eventCode != '') {
                //     eventTime = curScheList[m].eventEndTime.substring(11, 16) + "结束";
                // } else if (eventCode != '' && eventEnd.getTime() > new Date().getTime()) {
                //     eventTime = curScheList[m].eventStartTime.substring(11, 16) + "开抢";
                // }

                curScheList[m].eventTime = eventTime;
              }
            }

            films[i].scheduleShowList = scheduleList[showDate];
            // console.log(films[i].scheduleShowList);
          }

          that.setData({
            filmLen: films.length,
            films: films,
            shows: shows,
            loading: false,
            loadOverFlag: true
          });

          wx.setStorageSync('shows', shows);
        }
        // console.log(that.data.films);
      },
      fail: function() {
        //fail
      },
      complete: function() {

      }
    });
  },

  haltSalesFn: function(e) {
    // console.log(e)
    var that = this;
    that.setData({
      toastItem: {
        text: '影片上映前15分钟停止在线售票，请重新选择！',
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
  },

  stopFn: function(e) {
    // console.log(e)
    this.setData({
      flag: true
    });
  },

  //ads： go to details
  adDetailFn: function(e) {
    // console.log(e)
    var that = this,
      target = e.currentTarget.dataset,
      ads = target.ads,
      adType = ads.adLinkType;
    // filmCode = ads
    // filmName = target.filmname;

    if (adType == 1 && loginFlag) {
      loginFlag = false;
      var filmCode = ads.adLink,
        filmName = ads.adContent,
        url = 'filmdes?filmCode=' + filmCode + '&filmName=' + filmName;

      wx.navigateTo({
        url: url
      });
    }
  },

  //go to film detail page
  filmDetailP: function(e) {
    // console.log(e)
    var target = e.currentTarget.dataset,
      filmCode = target.filmcode,
      filmName = target.filmname;

    var url = 'filmdes?filmCode=' + filmCode + '&filmName=' + filmName;

    wx.navigateTo({
      url: url
    });
  },

  //look other sessions
  lookThem: function(e) {
    // console.log(e)
    var that = this,
      target = e.currentTarget.dataset,
      index = target.index, //当前电影的index值
      filmsData = that.data.films,
      curFilm = filmsData[index],
      shows = that.data.shows, //所有电影的排片信息
      theFilmCode = curFilm.filmCode,
      showLists = shows[theFilmCode], //当前电影的所有排片信息
      showDates = curFilm.showDate1; //排片日期数组
    if (showDates != undefined && showDates.length > 0) {
      for (var i = 0; i < showDates.length; i++) {
        var date = showDates[i],
          showDate = showLists[date];
        if (showDate != undefined && showDate != '') {
          curFilm.tabIndex = i;
          curFilm.scheduleShowList = showDate;
          break;
        }
      }
      var n = curFilm.tabIndex;
      that.changeTab(undefined, index, n, showDates[i]);
    }
  },

  //slide up & down
  slideFn: function(e) {
    //  console.log(e)
    var targetData = e.currentTarget.dataset,
      index = targetData.index,
      flags = !targetData.flag,
      the = this;

    var filmsData = the.data.films;
    filmsData[index].flag = flags;

    the.setData({
      films: filmsData,
    });

  },
  changeTab: function(e, index, n, data) {
    // console.log(e)
    if (e) {
      var targets = e.currentTarget.dataset;
      var index = targets.index, //当前影片的index值
        n = targets.n,
        showDate = targets.day; //当前选中的日期
    } else {
      var index = index,
        n = n,
        showDate = data;
    }
    var filmsData = this.data.films,
      shows = this.data.shows,
      theFilmCode = filmsData[index].filmCode, //取出当前影片filmCode的value
      scheduleList = shows[theFilmCode], //当前电影排片信息
      curScheList = scheduleList[showDate]; //当前选中日期的排片列表

    if (curScheList != undefined) {
      var tFlag = 'moon';
      for (var i = 0; i < curScheList.length; i++) { //给排片信息加一个showDate字段
        //如果策略价为0或者为''，则使用原价
        if (curScheList[i].terraceFilmPrice == '' || curScheList[i].terraceFilmPrice == 0 || curScheList[i].terraceFilmPrice == undefined) {
          curScheList[i].terraceFilmPrice = curScheList[i].filmPrice;
        }
        curScheList[i].showDate = showDate;
        var startTnum = Number(curScheList[i].startTime.split(':')[0]);
        if (i == 0) {
          if (startTnum > 5 && startTnum < 19) {
            tFlag = 'sun';
            curScheList[i].startTFlag = 'sun';
          } else {
            tFlag = 'moon';
            curScheList[i].startTFlag = 'moon';
          }
        } else {
          if (startTnum > 5 && startTnum < 19) {
            if (tFlag == 'sun') {
              curScheList[i].startTFlag = '';
            } else {
              curScheList[i].startTFlag = 'sun';
              tFlag = 'sun';
            }
          } else {
            if (tFlag == 'moon') {
              curScheList[i].startTFlag = '';
            } else {
              tFlag = 'moon';
              curScheList[i].startTFlag = 'moon';
            }
          }
        }

        var eventCode = curScheList[i].eventCode;
        if (eventCode == undefined) {
          eventCode = '';
        }

        var eventEnd = new Date(curScheList[i].eventEndTime.replace(/-/g, "/")),
          eventTime = '';     
        curScheList[i].eventTime = eventTime;
      }
    }

    filmsData[index].tabIndex = n;
    filmsData[index].scheduleShowList = curScheList;

    this.setData({
      films: filmsData
    });
    //   console.log(filmsData);
  },
  changeCinema: function(e) {
    // console.log(e)
    wx.redirectTo({
      url: '../cinema/cinema',
    });
  },

  //选票
  selTicket: function(e) {
    // console.log(e)
    var that = this,
      targets = e.currentTarget.dataset,
      listInfo = JSON.stringify(targets.listinfo),
      filmName = targets.filmname,
      memberPhone = member.memberPhone,
      theOpenId = member.openid,
      url = '../chooseSeats/chooseSeats?listInfo=' + listInfo + '&filmName=' + filmName;
       if (loginFlag) {
      loginFlag = false;
      if ((memberPhone == undefined || memberPhone == '' || memberPhone == null) && (memberCode == undefined || memberCode == '' || memberCode == null) && theOpenId == undefined) {       
        that.go(e, '../getUserInfo/login');      
      } else {
        wx.checkSession({
          success: function() {
            //session 未过期，并且在本生命周期一直有效
            wx.navigateTo({
              url: url,
              success: function() {},
              fail: function() {},
              complete: function() {
                loginFlag = true;
              }
            });
          },
          fail: function() {           
            that.go(e, '../getUserInfo/login');           
          },
          complete: function() {
            loginFlag = true;
          }
        });
      }
    }
  },
  onHide: function() {},
  go: function(e, url) {
    wx.navigateTo({
      url: url,
      success: function() {
      }
    })
  },
  onPullDownRefresh: function() {
    this.ajaxFn();
    wx.stopPullDownRefresh();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    var that = this;

    return {
      // title: name,
      path: 'pages/home/index?cinemaCode=' + cinemaCode + '&cinemaName=' + cinemaname,
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }

  },

});