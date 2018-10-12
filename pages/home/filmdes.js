// pages/home/filmdes.js
//获取应用实例
var url = require('../../utils/url.js'),
    URL = url.movieInfo,
    cinemaCode,
    filmCode,
    memberCode,
    member;

Page({
    /**
     * 页面的初始数据
     */
    data: {
        slideFlag: true,
        largeFlag: true,
        curIndex: 0,
        filmName: '',
        downPullFlag: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var opts = options,
            name = opts.filmName,
            that = this;

        filmCode = opts.filmCode, //从地址栏里取出filmCode值
        cinemaCode = wx.getStorageSync('cinemaCode');
        member = wx.getStorageSync('member');
        memberCode = member.memberCode;

        // console.log(opts);
        that.setData({
            filmName: name
        });
        // console.log(filmCode);
        that.ajaxFn();
    },

    //ajax function
    ajaxFn: function(){
        var that = this;
        wx.request({
            url: URL,
            method: 'GET',
            data: { 'cinemaCode': cinemaCode, 'filmCode': filmCode, 'memberCode': memberCode }, /*'035a00522017'*/
            header: {
                'Content-Type': 'text/plain',
                'Accept': 'application/json'
            },
            success: function (res) {
                var data = res.data.resultData,
                    filmVideoArray = data.filmVideoNew,
                    posterNew = data.filmPosterNew.split(','),
                    images = data.filmImgNew;
                     
                if (filmVideoArray.length > 0) {
                    data.filmVideoUrl = filmVideoArray[0].videoUrl;
                    data.filmVideoImg = filmVideoArray[0].imgUrl;
                } else {
                    data.filmVideoUrl = '';
                    data.filmVideoImg = '';
                }

                if (posterNew.length > 0) { //没有预告片的时候，到海报第一张图片
                  posterNew[0] = posterNew[0].replace("?x-oss-process=image/format,jpg", "");
                    data.filmPosterNew = posterNew[0] + '?x-oss-process=image/resize,m_fill,h_424,w_710,limit_0';
                } else {
                    data.filmPosterNew = '';
                }

                data.filmImgNew = images.split(',');

                var typeArr = data.filmType.split('|');
                data.label = typeArr[0];
                data.typeF = typeArr[1];
                data.typeT = typeArr[2];

                that.setData({
                    items: data
                });
                // console.log(data);
            },
            complete: function () {
                if (that.downPullFlag) {
                    wx.stopPullDownRefresh() //停止下拉刷新
                    that.setData({
                        downPullFlag: false
                    });
                }
            }
        });
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        var that = this,
            datas = that.data,
            name = decodeURIComponent(encodeURIComponent(that.data.filmName));
        
        // console.log(datas.items);
        wx.setNavigationBarTitle({
            title: name,//页面标题为路由参数
        })
    },


    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.setData({
            downPullFlag: true
        });
        this.ajaxFn();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {
        var that = this,
            name = that.data.filmName;
        
        return {
            title: name,
            path: 'pages/home/filmdes?filmCode=' + filmCode + '&filmName=' + name,
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
        
    },
    // 点击展开更多影片简介
    showMoreInfos: function(e){
        var flag = this.data.slideFlag;
        
        this.setData({
            slideFlag: !flag
        });
    },
    
    // 点击查看剧照大图
    showLargeImg:function(e){
        var target = e.currentTarget.dataset,
            index = target.index;

        this.setData({
            largeFlag: false,
            curIndex: index
        });
    },

    // 关闭剧照大图窗口
    closeLargeWin: function(){
        this.setData({
            largeFlag: true
        });
    },

    //选择场次
    selTicketFn:function(e){
        // wx.redirectTo({
        //     url: 'index'
        // })
        wx.switchTab({
            url: 'index'
        })
    }
})