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
        toastItem:{
            text: 'sucess!',
            toast_visible: !1
        },
        loadOverFlag: false, //
        // tabIndex: 0
	},

    onLoad: function (options) {
		var that = this
		// 获取系统信息
		wx.getSystemInfo({
			success: function (res) {
				// console.log(res);
				// 可使用窗口宽度、高度
			// 	console.log('height=' + res.windowHeight);
				// console.log('width=' + res.windowWidth);
				// 计算主体部分高度,单位为px
				that.setData({
					// second部分高度 = 利用窗口可使用高度 - first部分高度（这里的高度单位为px，所有利用比例将300rpx转换为px）
					scrollHeight: res.windowHeight - res.windowWidth / 750 * 88
				});
			}
		});

        // 这段代码放onshow 里每次页面重新show，都会重新拿一次缓存数据
       /* wx.setStorageSync('userData', '');
        // cinemaCode = options.cinemaCode; 添加tabBar之前cinemaCode是通过url带参拿过来的
        cinemaCode = wx.getStorageSync('cinemaCode'); //添加tabBar之后，cinemaCode是通过缓存拿的
        member = wx.getStorageSync('member');
        if(member){
          memberCode = member.memberCode;
        }
        
        // cinemaname = options.cinemaName;
        cinemaname = wx.getStorageSync('cinemaName');

        OS = wx.getStorageSync('OS');
        movieCode = wx.getStorageSync('movieCode');
        CVersion = wx.getStorageSync('CVersion'); */
        
        //添加tabBar之前，从选择影院页面进入首页地址可以带参，添加tabBar之后不可以了，两个参数都需要从缓存中取
        // if (cinemaCode) { //如果从选择影院页面进入首页，则地址中带有cinemaCode和cinemaName的值
        //     wx.setStorageSync('cinemaCode', cinemaCode);
        //     wx.setStorageSync('cinemaName', cinemaname);
        // } else { //如果不是从选择影院页面进入首页，cinemaCode和cinemaName的值就从缓存中取
        //     cinemaCode = wx.getStorageSync('cinemaCode');
        //     cinemaname = wx.getStorageSync('cinemaName');
        // }

        // that.setData({
        //     cinemaName: cinemaname
        // });

        // that.getBanner();    
        // that.ajaxFn();
	},
    onShow: function(){
        var that = this;
        loginFlag = true;
        if (member == null || member == undefined){
          member = '';
        }
        //页面从hide到show的时候，更新一下member的值
        member = wx.getStorageSync('member');
console.log(member);
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

        that.getBanner();    
        // that.ajaxFn();

        // console.log('index 页面 onshow function');
       //  console.log(member);
    },
    onReady: function () {
        wx.setNavigationBarTitle({
			title: configJson.movieName,
        });
        this.ajaxFn();
    },
    getBanner: function() {
        var _this = this;
        wx.request({
            url: bannerUrl,
            method: 'GET',
            data: {
                'OS': OS,
                'companyCode': movieCode,
                'CVersion': CVersion,
                'cinemaCode': cinemaCode,
                'token': member.token,
                'adType': 0
            },
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                // console.log(res);
                if (res.data.resultCode == '0'){
                    var imgs = res.data.resultData;

                    for (var j = 0; j < imgs.length; j++) {
                        imgs[j].adImgNew = imgs[j].adImgNew + '?x-oss-process=image/resize,m_fixed,h_234,w_710,limit_0/quality,q_80';
                    }

                    _this.setData({
                        images: imgs,
                    });
                }
            },
            fail: function(){},
            complete: function(){}
        })
    },
    ajaxFn: function(){
        var that = this;
        wx.request({
            url: filmUrl,
            method: 'GET',
            data: { 'cinemaCode': cinemaCode, 'filmType': 1, 'memberCode': memberCode}, /**/
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                console.log(res);
                var array = res.data.resultData;
                if(array != ''){
                    shows = array.shows;

                  var films = array.films,
                  filmLen = films.length;           

					for (var i = 0; i < filmLen; i++) {
            films[i].filmPosterNew = films[i].filmPosterNew.replace("?x-oss-process=image/format,jpg","");
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
                        if (curScheList != undefined){ //设置开播时间前的太阳（月亮、空）
                            var timeFlag = 'moon';
                          
                            for (var m = 0; m < curScheList.length; m++) {
                                //如果策略价为0或者为''，则使用原价
                                if (curScheList[m].terraceFilmPrice == '' || curScheList[m].terraceFilmPrice == 0 || curScheList[m].terraceFilmPrice == undefined) { 
                                    curScheList[m].terraceFilmPrice = curScheList[m].filmPrice;
                                }
                                curScheList[m].showDate = showDate;
                                var startTnum = Number(curScheList[m].startTime.split(':')[0]);
                                if(m == 0){
                                    if (startTnum > 5 && startTnum < 19) {
                                        timeFlag = 'sun';
                                        curScheList[m].startTFlag = 'sun';
                                    } else {
                                        timeFlag = 'moon';
                                        curScheList[m].startTFlag = 'moon';
                                    }
                                } else {
                                    if (startTnum > 5 && startTnum < 19) {
                                        if (timeFlag == 'sun'){
                                            curScheList[m].startTFlag = '';
                                        } else {
                                            curScheList[m].startTFlag = 'sun';
                                            timeFlag = 'sun';
                                        }
                                    } else {
                                        if (timeFlag == 'moon'){
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
                        loading:false,
                        loadOverFlag: true
                    });

                    wx.setStorageSync('shows', shows);
                }
				// console.log(that.data.films);
            },
            fail: function () {
                //fail
            }, 
            complete: function () {
                
            }
        });
    },
    
    haltSalesFn: function (e) {
      // console.log(e)
        var that = this;
        that.setData({
            toastItem: {
                text: '影片上映前15分钟停止在线售票，请重新选择！',
                toast_visible: !0
            }
        });

        setTimeout(function(){
            that.setData({
                toastItem: {
                    toast_visible: !1
                }
            });
        }, 2000);
    },

    stopFn:function(e){
      // console.log(e)
        this.setData({
            flag: true
        });
    },
    
    //ads： go to details
    adDetailFn: function (e){
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
    filmDetailP:function(e){
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
    lookThem: function (e) {
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
                if (showDate != undefined && showDate != ''){
                    curFilm.tabIndex = i;
                    curFilm.scheduleShowList = showDate;
                    break;
                }
            }

            // that.setData({
            //      films: filmsData
            // });

            var n = curFilm.tabIndex;
            that.changeTab(undefined, index, n, showDates[i]);
        }    


        
    },

    //slide up & down
    slideFn: function (e) {
    //  console.log(e)
        var targetData =  e.currentTarget.dataset,
            index = targetData.index,
            flags = !targetData.flag,
            the = this;
      
		// 	wordindex = targetData.wordindex;
		// this.setData({
		// 	toView: wordindex,
		// })

		// console.log(this.data.toView);

        var filmsData = the.data.films;
        filmsData[index].flag = flags;
      
        the.setData({
            films: filmsData,
           
        });
     
    },
    changeTab: function(e, index, n, data){
      // console.log(e)
        if (e){
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
            curScheList = scheduleList[showDate];  //当前选中日期的排片列表
            
        if (curScheList != undefined){
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
                // if (curScheList[i].eventIsSatart && eventCode != '') {
                //     eventTime = curScheList[i].eventEndTime.substring(11, 16) + "结束";
                // } else if (eventCode != '' && eventEnd.getTime() > new Date().getTime()) {
                //     eventTime = curScheList[i].eventStartTime.substring(11, 16) + "开抢";
                // }

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
    changeCinema: function (e) {
      // console.log(e)
        wx.redirectTo({
            url: '../cinema/cinema',
        });
    },
    /*goToUsers: function (e) {
        var that = this, 
            url = '../my/my',
            userName = wx.getStorageSync('userName'),
            userPhone = member.memberPhone,
            isBinding = member.isBinding; //是否绑定了手机号，0：未绑定，1：已绑定
        
        if(loginFlag){
            loginFlag = false;
			if ((userPhone != undefined && userPhone != '' && userPhone != null) && (memberCode != undefined && memberCode != '' && memberCode != null)) {
                // url = '../my/my';
                wx.checkSession({
                    success: function () {
                        //session 未过期，并且在本生命周期一直有效
                        wx.redirectTo({
                            url: url,
                        });
                    },
                    fail: function () {
                        //登录态过期
                        that.getUserInfo('', url);
                    }
                });
                
            } else {
                
                that.getUserInfo('', url);
            }
        }
    },
    getUserInfo: function (cb, src) {
        var that = this;
        if (app.globalData.userInfo) {
            typeof cb == "function" && cb(app.globalData.userInfo)
        } else {
            //调用登录接口
            wx.login({
                success: function (res) {
                    // console.log(res.code);

                    wx.request({
                        url: sessionID,
                        method: 'GET',
                        data: {
                            js_code: res.code,
							movieCode: movieCode
                        },
                        header: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            'Accept': 'application/json'
                        },
                        success: function(res){
                            // console.log(res);
                            var sessionId = res.data.resultData;

							wx.setStorageSync('sessionId', sessionId);

                            wx.getUserInfo({
                                success: function (res) { 
                                    // console.log(res);
                                    var encryptedData = res.encryptedData,
                                        iv = res.iv;

                                    wx.request({
                                        url: userInfoUrl,
                                        method: 'GET',
                                        data: {
                                            encryptedData: encryptedData,
                                            iv: iv,
                                            sessionId: sessionId
                                        },
                                        header: {
                                            "Content-Type": "application/x-www-form-urlencoded",
                                            'Accept': 'application/json'
                                        },
                                        success: function (res) {
                                            var data = JSON.parse(res.data.resultData),
                                                resultCode = res.data.resultCode,
                                                resultDesc = res.data.resultDesc;
                                            if (resultCode == '0'){
                                                wx.setStorageSync('userData', data);

												wxLoginPara = {
													city : data.city,
													country : data.country,
													companyCode : movieCode,
													headimgurl : data.avatarUrl,
													language : data.language,
													nickname : data.nickName,
													openid : data.openId,
													province : data.province,
													sex : data.gender,
													unionid: data.unionId,
													loginType : '6',
													source : '6'
												};

                                                that.wxLoginfn(src);
                                            } else {
                                                wx.showModal({
                                                    title: '提示',
                                                    content: resultDesc,
                                                    showCancel: false,
                                                    confirmText: '知道了',
                                                    success: function (res) {
                                                        if (res.confirm) {
                                                            // console.log('用户点击确定')
                                                        }
                                                    }
                                                });
                                            }
                                            // console.log(data);
                                        },
                                        fail:function(res){
                                            var data = res.data.
                                                resultCode = data.resultCode;
                                            
                                        }
                                    })    

                                    // var data = pc.decryptData(res.encryptedData, res.iv);
                                    // console.log('解密后 data: ', data);

                                    
                                },
                                fail:function(res){
                                    console.log(res)
                                }
                            })
                        },
                        fail:function(res){},
                        complete:function(res){}
                    });

                }
            });
        }
    },

    //wx login
    wxLoginfn: function (src) {
        var that = this;
		
        wx.request({
			url: wxLoginUrl, //wxCheckLogin
            method: 'GET',
            data: wxLoginPara,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                // loginFlag = true;
                var data = res.data.resultData, 
                    url = '';

                console.log(data)

                if (data.isBinding == '0') {//如果没有绑定手机号，则进入手动绑定手机号页面
                    url = '../login/login'; 
					wx.redirectTo({
                        url: url
                    });
                } else { //如果已经绑定了手机号，则更新缓存里member的数据
                    wx.setStorageSync('member', data);
                    // url = '../my/my';
                    if(src == '../my/my') {
                        wx.redirectTo({
                            url: src,
                        });
                    } else {
                        wx.navigateTo({
                            url: src,
                        });
                    }
                    
                }
                
            },
            fail: function () { },
            complete: function () { }
        })
    },  */

    //选票
    selTicket: function (e) {
      // console.log(e)
        var that = this,
            targets = e.currentTarget.dataset,
            listInfo = JSON.stringify(targets.listinfo),
            filmName = targets.filmname,
            memberPhone = member.memberPhone,
            theOpenId = member.openid,
            url = '../chooseSeats/chooseSeats?listInfo=' + listInfo + '&filmName=' + filmName;

     //  console.log(member, memberPhone, memberCode);
        if(loginFlag){
          loginFlag = false;
            if ((memberPhone == undefined || memberPhone == '' || memberPhone == null) && (memberCode == undefined || memberCode == '' || memberCode == null) && theOpenId == undefined){
                // that.getUserInfo('', url);
                // that.go(e, '../getUserInfo/login');
              //  console.log('but session_key expired');
                // session_key 已经失效，需要重新执行登录流程
                that.go(e, '../getUserInfo/login');
                // that.selTicket();
             
            } else {
                wx.checkSession({
                    success: function () {
                        //session 未过期，并且在本生命周期一直有效
                        wx.navigateTo({
                            url: url,
                            success: function (){
                            },
                            fail:function(){},
                            complete:function(){
                                loginFlag = true; 
                            }
                        });
                    },
                    fail: function () {
                     //   console.log('but session_key expired');
                        // session_key 已经失效，需要重新执行登录流程
                        that.go(e, '../getUserInfo/login');
                        // that.selTicket();
                    },
                    complete:function(){
                        loginFlag = true; 
                    }
                });
                
            } 
        }
    },
    onHide: function() {
    },
	go: function(e, url) {
		wx.navigateTo({
            url: url,
            success:function(){

            }
		})
	},
    onPullDownRefresh: function () {
        // this.ajaxFn();
        // this.setData({
        //     images: [],
        //     films: [],
        //     shows: []
        // });
        
        this.ajaxFn();
        wx.stopPullDownRefresh();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {
        var that = this;

        return {
            // title: name,
            path: 'pages/home/index?cinemaCode=' + cinemaCode + '&cinemaName=' + cinemaname,
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }

    },
  
});

