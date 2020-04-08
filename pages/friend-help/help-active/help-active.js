const helpListFn = () => {
  let arr = []
  const num = 7
  for (let index = 0; index < num; index++) {
    arr.push({
      userName: 'Zero' + index,
      userIcon: 'http://img1.imgtn.bdimg.com/it/u=1844931321,2482666670&fm=26&gp=0.jpg',
      time: `2020-02-09 0${index}:20`,
    })
  }
  return arr
}

Page({
  // 页面的初始数据
  data: {
    userInfo: {
      userIcon: 'http://img1.imgtn.bdimg.com/it/u=1844931321,2482666670&fm=26&gp=0.jpg',
      userName: 'Zero',
    },
    countDownTime: '00:00:00:00',
    helpList: helpListFn(),
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    // this.setData({
    //   helpList: helpListFn()
    // })
  },

  // 生命周期函数--监听页面初次渲染完成
  onReady() {
    wx.setNavigationBarTitle({
      title: "我发起的助力",
    });
  },

  // 生命周期函数--监听页面显示
  onShow() {

  },

  // 分享
  onShareAppMessage(res) {
    return {
      title: '选家影院看电影吧',
      path: 'pages/cinema/cinema'
    }
  },
  // 去我的活动页
  goHelpList() {
    wx.navigateTo({
      url: '/pages/friend-help/help-list/help-list'
    })
  },

  // 活动详情
  getDetail() {
    wx.navigateTo({
      url: '/pages/friend-help/help-detail/help-detail'
    })
  },

  // 去注册会员
  getRegister() {
    wx.navigateTo({
      url: '/pages/sign-in/authorize/authorize'
    })
  },

})
