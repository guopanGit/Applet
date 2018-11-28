var url = require('../../utils/url.js'),
    movieUrl = url.movieUrl,
    CinemaLogoUrl = url.getCinemaLogo,
    movieCode,
    moviePram = {};
    // var cinemaListPara = { 'movieCode': movieCode};

Page({
    data: {
        title: '定位中...', //当前定位的城市
        cityName:'定位中...', //选中的城市
        flag:false,
        // downPullFlag:false,
        rolocation: true,
        toastItem: { //template data
            text: 'sucess!',
            toast_visible: !1
        }
    },
    showList:function(){
        this.setData({
            flag : true
        });
    },
    hideList:function(){
      this.setData({
        flag: false
      });
    },
    //事件处理函数
    onLoad: function (options) {
        wx.hideShareMenu(); 
        var that = this;
            movieCode = wx.getStorageSync('movieCode');
        var CVersion = wx.getStorageSync('CVersion'),
            OS = wx.getStorageSync('OS');

        that.getLogo();
        

        // that.ajaxFn();    

        moviePram.movieCode = movieCode;
        moviePram.CVersion = CVersion;
        moviePram.OS = OS;

        var movieAdress = wx.getStorageSync('movieAdress'),
            longitude = movieAdress.longitude,
            latitude = movieAdress.latitude;

        if (movieAdress != undefined && movieAdress != '') {
            moviePram.lon = longitude;
            moviePram.lat = latitude;

            that.ajaxFn();
            that.loadCity(longitude, latitude);
        } else {
            that.loadInfo();
        }
    },
    getLogo: function() {
        var _this = this;
        wx.request({
            url: CinemaLogoUrl, 
            method: 'GET',
            data: {
                'companyCode': movieCode
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
              // console.log(res)
                var data = res.data;
                if (data.resultCode == '0') {
                    _this.setData({
                        logoSrc: data.resultData.logo
                    });
                }
            },
            fail: function(){},
            complete: function(){}
        })
    },
    loadInfo: function () {
         var page = this
        wx.getLocation({
             type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标 
            success: function (res) {
                 // success 
                // console.log(res);
                 var longitude = res.longitude;
                 var latitude = res.latitude;
                 page.loadCity(longitude, latitude);
                
                var movieAdress = {
                    'longitude': longitude,
                    'latitude': latitude
                }
                wx.setStorageSync('movieAdress', movieAdress);
                
                 moviePram.lon = longitude;
                 moviePram.lat = latitude;


                 page.ajaxFn();
            },
            fail: function () {
                page.setData({
                    toastItem: {
                        text: '定位失败,请查看定位是否开启',
                        toast_visible: !0
                    }
                });

                setTimeout(function () {
                    page.setData({
                        toastItem: {
                            toast_visible: !1
                        }
                    });
                }, 3000);
                
            },
            complete: function () {
                 // complete 
                
            }
        })
    }, 
    //调起百度地图，查询定位城市名
    loadCity: function (longitude, latitude) {
        var page = this
        wx.request({
            url: 'https://api.map.baidu.com/geocoder/v2/',
            method: 'GET',
            data: {
                'ak': 'pyZEvn2WBIxfvGMBjs01AmwKPu7IP5it',
                'location': latitude + ',' + longitude,
                'output': 'json',
                'pois':1
            },
            header: {
                'Content-Type': 'application/json'
            },
            success: function (res) {
                // success  
                // console.log(res);
                var city = res.data.result.addressComponent.city;
                page.setData({ title: city });
            },
            fail: function () {
                // fail  
                wx.showToast({
                    title: '定位失败',
                });

                page.ajaxFn('fail');
            },
            complete: function () {
                // complete  
                page.setData({
                    rolocation: false
                });
            }
        });
    },
    reLocation: function () {
        this.loadInfo();
        this.setData({
            rolocation: true
        });
    },
    //ajax function
    ajaxFn:function(flag) {
        var that = this;
        wx.request({
            url: movieUrl,
            method: 'GET',
            data: moviePram,
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
               // console.log(res);
                var data = res.data.resultData;

                if (data != undefined && data != ''){
                    var pageData = that.data,
                        curCityTitle = pageData.title,
                        cities,
                        cityName,
                        cinemaList = '',
                        n1 = 0,
                        m1 = 0;        

                    if (flag == 'fail') { //如果定位失败
                        cities = data[0].cities[0];
                        cinemaList = cities.cinemaList;
                        cityName = cities.cityName;
                        that.cinemaDisFn(cinemaList);
                    } 

                    //定位成功
                    for (var n = 0, len = data.length; n < len; n++) {
                        // n1 = n;
                        cities = data[n].cities;
                        var loop = true;
                        for (var m = 0, mLen = cities.length; m < mLen; m++) {
                            m1 = m;
                            cityName = cities[m].cityName;

                            if (cityName == curCityTitle) {
                                cinemaList = cities[m].cinemaList;

                                that.setData({
                                    cityName: cityName,
                                    // cinemaList: cinemaList
                                });

                                that.cinemaDisFn(cinemaList);

                                loop = false;
                                break;
                            }
                        }
                        if (!loop) {
                            break;
                        }
                    }
                    //定位成功，但城市列表里没有当前定位的城市
                    var a = 0 ;
                    // if (n1 == data.length && cinemaList == '') {
                    if (cinemaList == '') {
                        var nearestCity = { distance: 0, cityName: '', cinemaList: [] };
                        nearestCity.distance = Number(data[0].cities[0].cinemaList[0].distance);
                        nearestCity.cityName = data[0].cities[0].cityName;
                        nearestCity.cinemaList = data[0].cities[0].cinemaList;
                        for(var j = 0; j < len; j ++){
                            cities = data[j].cities;
                            var loops = true;
                            for (var k = 0, kLen = cities.length; k < kLen; k++) {
                                cinemaList = cities[k].cinemaList;
                                for(var c = 0, cLen = cinemaList.length; c < cLen; c++) {
                                    var distance = Number(cinemaList[c].distance);
                                    if (distance < nearestCity.distance){
                                        nearestCity.distance = distance;
                                        nearestCity.cityName = cities[k].cityName;
                                        nearestCity.cinemaList = cinemaList;
                                    }
                                }
                            }
                        }

                        that.setData({
                            cityName: nearestCity.cityName,
                        });
                        that.cinemaDisFn(nearestCity.cinemaList);
                    }    

                    that.setData({
                        data: data,
                        // cityName: cityName,
                        // cinemaList: cinemaList
                    });
                } else {
                    that.setData({
                        toastItem: {
                            text: '没有相关影院',
                            toast_visible: !0
                        }
                    });

                    setTimeout(function () {
                        that.setData({
                            toastItem: {
                                toast_visible: !1
                            }
                        });
                    }, 2000);
                }
                // that.data.items = data[0];
            },
            complete: function () {
                // if (that.downPullFlag) {
                //     wx.stopPullDownRefresh() //停止下拉刷新
                //     that.setData({
                //         downPullFlag: false
                //     });
                // }
            }
        });
    },

    //修改影城距离信息
    cinemaDisFn: function (cinemaList){
        var that = this;
        if (cinemaList != undefined && cinemaList.length > 0) {
            for (var i = 0; i < cinemaList.length; i++) {
                var distance = cinemaList[i].distance;
                if (distance != null && distance != undefined) {
                    if (distance > 1000) {
                        distance = (distance / 1000).toFixed(1);
                        cinemaList[i].distance = '<' + distance + 'km';
                    } else {
                        distance = distance.toFixed(1);
                        cinemaList[i].distance = '<' + distance + 'm';
                    }
                } else {
                    distance = 0;
                }
            }
        }

        that.setData({
            cinemaList: cinemaList
        });
    },

    onReady: function () {
        wx.setNavigationBarTitle({
            title: '选择影院'
        });
    },

    //下拉刷新
    onPullDownRefresh: function () {
        // this.ajaxFn();
        // this.setData({
        //     data: []
        // });
        this.ajaxFn();
        wx.stopPullDownRefresh();
    },

    // 选择某影城并跳转页面
    selCinema:function(e){
        var targets = e.currentTarget.dataset,
            cinemaCode = targets.cinemacode,
            cinemaName = targets.cinemaname, 
			// url = '../home/index?cinemaCode=' + cinemaCode + '&cinemaName=' + cinemaName;
            url = '../home/index';
      
        wx.setStorageSync('cinemaCode', cinemaCode);
        wx.setStorageSync('cinemaName', cinemaName);
		// this.go(e, url);
		wx.switchTab({
			url: url
		})
    },

    //选择城市
    selCityFn:function(e){
      // console.log(e)
        var that = this,
            target = e.currentTarget.dataset,
            letterIndex = target.index,
            cityIndex = target.cindex,
            cinemaList = that.data.cinemaList,
            data = that.data.data,
            cityName = target.cityname;

        that.setData({
            cityName: cityName
        });

        cinemaList = data[letterIndex].cities[cityIndex].cinemaList;

        if (cinemaList != undefined && cinemaList.length > 0) {
            for (var i = 0; i < cinemaList.length; i++) {
                var distance = cinemaList[i].distance;
                if (typeof (distance) == 'number') {
                    if (distance != null && distance != undefined) {
                        if (distance > 1000) {
                            distance = (distance / 1000).toFixed(1);
                            cinemaList[i].distance = '<' + distance + 'km';
                        } else {
                            distance = distance.toFixed(1);
                            cinemaList[i].distance = '<' + distance + 'm';
                        }
                    } else {
                        distance = 0;
                    }

                }
            }
        }
        
        // console.log(cinemaList);
        that.setData({
            cinemaList: cinemaList,
            flag: false
        });

    },
    
    //页面跳转函数
    go: function (e, url) {
        wx.redirectTo({
            url: url
        })
    }
    
})
