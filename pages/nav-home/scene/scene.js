/**
 * 导入封装函数
 */

import {
  ajaxPromise
} from '../../../utils/util.js';

import {
  URL
} from '../../../utils/config.js';
import {showToast} from "../../../utils/util";

// 赋值
const {
  sceneList,
  cardRecommend
} = URL;

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPref: false,
    isHasData: false,
    sun: false,
    moon: false,
    imageArr: [],
    sceneListData: [],
    swiperIndex: 0,
    toggleIndex: 0,
    filmInfo: {},
    renderData: {},
    renderShow: false,
    cardTitle:''
  },

  key: "",

  /**
   * 生命周期函数-监听页面初次渲染完成
   */
  onReady() {
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('cinemaName'),
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 非空判断
    const {
      source = '',
      companyCode = '',
      cinemaCode = '',
      cinemaName = '',
      filmCode = '',
      key = ''
    } = options || '';
    if (source) {

      this.key = filmCode;
      // console.log(filmCode + '--------');
      // app.globalData.melonSource = source;

      // 设置缓存过期时间 24小时
      let timestamp = Date.parse(new Date());
      let expiration = timestamp + 86400;

      wx.setStorageSync("melonSource", expiration);
      wx.setStorageSync('companyCode', companyCode);
      wx.setStorageSync('cinemaCode', cinemaCode);
      wx.setStorageSync('cinemaName', cinemaName);
    } else {
      this.key = key
    }

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

    // 查询场次列表
    ajaxPromise(true, sceneList, {})
      .then((res) => {
        this.sceneListCall(res)
      })
      .catch(() => {
      })

    // 卡推荐
    ajaxPromise(false, cardRecommend, {
      sortType: 2
    })
      .then((res) => {
        this.cardRecommendCall(res)
      })
      .catch(() => {
      })
  },

  /**
   * 卡推荐成功回调
   */
  cardRecommendCall(res) {
    let recommendCard = res.resultData.recommendCard;
    if (recommendCard.gId) {
      let cardTitle = [];
      if (recommendCard.pType == 1) { // 显示卡推荐
        if (recommendCard.minPrice > 0) {
          cardTitle.push('持卡享特惠，');
          cardTitle.push('起');
          cardTitle.push(recommendCard.minPrice)
        } else {
          cardTitle.push('持卡享特惠')
        }
      } else {// 显示首单立减
        cardTitle.push('持卡享特惠，');
        if (recommendCard.number > 0){
          let num = Number(recommendCard.promotionFirstPrice) * Number(recommendCard.number);
          cardTitle.push(`首单${recommendCard.number}张立减${num}元`);
        }
      }
      this.setData({
        renderShow: true,
        recommendCard: recommendCard,
        cardTitle
      })
    } else {
      this.setData({
        renderShow: false,
      })
    }
  },

  /**
   * 场次列表请求成功回调
   */
  sceneListCall(res) {
    let key = this.key; // 首页把影片编码带过来
    let index = 0; // 影片索引
    let sceneIndex;
    let imageArr = res.resultData.films; // 影片数组

    // 通过影片编码对应索引
    for (let i = 0; i < imageArr.length; i++) {
      if (imageArr[i].fc == key) {
        index = i;
      }
    }
    if (this.data.toggleIndex > 0) {
      sceneIndex = this.data.toggleIndex;
    } else {
      sceneIndex = 0;
    }

    let washData = this.washData(res.resultData); // 重组获取到的数组
    let sceneData = washData && washData[index] && washData[index].schedule; // 影片对应的场次列表
    let filmInfo = washData[index]; // 影片信息
    let sceneListData = sceneData[sceneIndex].content; // 场次列表
    let isLen = washData[index].schedule[0].content.length; // 今天是否有场次

    // console.log(sceneData[sceneIndex]);
    // console.log(washData);

    this.setData({
      swiperIndex: index,
      imageArr: imageArr,
      sceneData: sceneData,
      filmInfo: filmInfo,
      washData: washData,
      sceneListData: sceneListData,
      toggleIndex: sceneIndex
    });

    if (sceneIndex == 0) {
      this.isHasScene(isLen);
    }

  },


  /**
   * 滑动影片更新数据
   */
  swiperChange(e) {
    this.setData({
      swiperIndex: e.detail.current,
    });
    let swiperIndex = this.data.swiperIndex;
    let swiperData = this.data.washData;
    let filmInfo = swiperData[swiperIndex];
    let sceneData = swiperData[swiperIndex].schedule;
    let sceneListData = sceneData[0].content;
    let isLen = sceneListData.length;
    let key = filmInfo.movieID; // 记录当前影片编码
    this.key = key;
    //  console.log(sceneData)
    //  console.log(filmInfo)

    // 重置日期的索引
    this.setData({
      filmInfo: filmInfo,
      sceneData: sceneData,
      sceneListData: sceneListData
    });

    if (isLen) {
      this.setData({
        toggleIndex: 0
      })
    } else {
      this.isHasScene(isLen);
    }
  },

  /**
   * 点击影片更新数据
   */
  changeSlider(e) {
    let index = e.currentTarget.id;
    let key = this.data.filmInfo.movieID; // 记录当前影片编码
    //  console.log(key);

    this.setData({
      key: key,
      isHasData:false
    })

    if (this.data.swiperIndex != index) { // 判断是否是的当前影片
      this.setData({
        swiperIndex: index,
      });
      let isLen = this.data.washData[index].schedule[0].content.length; // 当前是否有场次
      if (isLen > 0) {
        this.setData({
          toggleIndex: 0
        })
      } else {
        this.isHasScene(isLen);
      }
    } else {
      let toggleIndex = this.data.toggleIndex;
      this.setData({
        toggleIndex: toggleIndex
      })
      let filmCode = this.data.filmInfo.movieID;
      let url = '../detail/film-detail/film-detail?filmCode=' + filmCode;
      wx.navigateTo({
        url: url
      });
    }
  },

  /**
   * 切换日期
   */
  toggleDate(e) {
    let toggleIndex = e.currentTarget.dataset.index;
    let toggleDateData = this.data.sceneData[toggleIndex].content;
    if (toggleDateData.length) { // 切换日期的时候判断当前影片是否有场次
      this.setData({
        isHasData: false
      })
    } else {
      this.setData({
        isHasData: true
      })
    }
    this.setData({
      sceneListData: toggleDateData,
      toggleIndex: toggleIndex
    });
  },

  /**
   * 查看其他场次
   */
  chekcOther() {
    let isLen = this.data.sceneData[this.data.toggleIndex].content.length;
    if (!isLen) {
      this.isHasScene(isLen)
    } else {
      return false
    }
  },

  /**
   * 售罄
   */
  StopSell(e) {
    let id = e.currentTarget.dataset.id;
    if (id == 2) {
      showToast('该场次座位已售罄，请换个场次吧')
    } else if (id == 1) {
      showToast(' 该场次已停止网上售卖，请换个场次吧')
    }

  },

  /**
   * 去选座
   */
  selectSeat(e) {
    if (!wx.getStorageSync('member').memberCode) {
      wx.navigateTo({
        url: '../../sign-in/authorize/authorize',
      })
      return false
    }

    // 记录当前影片编码
    let key = this.data.filmInfo.movieID;
    let toggleIndex = this.data.toggleIndex;
    //  console.log(toggleIndex)
    this.setData({
      key: key,
      toggleIndex: toggleIndex
    })

    // 参数
    let tipsPara = {
      currentDate: this.data.sceneData[this.data.toggleIndex].day,
      rightDate: this.data.sceneData[this.data.toggleIndex].date,
      tagContent: this.data.sceneData[this.data.toggleIndex].tagContent,
      startTime: e.currentTarget.dataset.item.startTime,
      isMorrow: e.currentTarget.dataset.item.ismorrow
    }

    // 去选座页需要用到的数据
    let filmName = this.data.filmInfo.name;
    let currentScene = e.currentTarget.dataset.item;
    let sceneArr = this.data.washData[this.data.swiperIndex].schedule;

    // 赋值给全局变量
    app.globalData.currentScene = currentScene;
    app.globalData.sceneArr = sceneArr;
    app.globalData.tipsPara = tipsPara;

    wx.navigateTo({
      url: `/pages/nav-home/seat/seat?filmName=${filmName}`,
    });

    // 神策埋点
    let filmPlaytime = currentScene.showDate.substring(0, 10) + ' ' + currentScene.startTime;
    app.sensors.track('selectNumber', {
      platform_type: '小程序',
      cinemaName: wx.getStorageSync('cinemaName'),
      filmName: filmName,
      filmPlayID: currentScene.showCode,
      filmPlaytime: new Date(filmPlaytime),
      filmOriginalPrice: Number(currentScene.filmPrice),
      filmActualPrice: Number(currentScene.terraceFilmPrice)
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(res) {
    let key = this.data.key;
    // console.log(key);
    let filmName = this.data.filmInfo.name;
    let companyCode = wx.getStorageSync('companyCode');
    let cinemaCode = wx.getStorageSync('cinemaCode');
    let cinemaName = wx.getStorageSync('cinemaName');
    return {
      title: '一起看《' + filmName + '》吧',
      path: `pages/nav-home/scene/scene?key=${key}&companyCode=${companyCode}&cinemaCode=${cinemaCode}&cinemaName=${cinemaName}`
    }
  },

  /**
   * 判断是否有场次函数
   */
  isHasScene(len) {
    if (len) {
      this.setData({
        isHasData: false
      })
    } else {
      let redirectIndex = 1;
      if (this.data.sceneData[redirectIndex]) {
        let redirectScene = this.data.sceneData[redirectIndex].content;
        let len = redirectScene.length;

        this.setData({
          sceneListData: redirectScene,
          toggleIndex: redirectIndex
        })

        if (len) {
          this.setData({
            isHasData: false
          })
        } else {
          this.setData({
            isHasData: true
          })
        }

        //  console.log(this.data.sceneData[redirectIndex]);
      }

    }
  },


  /**
   * 重组数据
   */
  washData(data) {
    let films = data.films;
    let homefilms = [];
    let suffixImg = '?x-oss-process=image/format,jpg,resize,m_fill,h_550,w_416,limit_0';

    for (let j = 0; j < films.length; j++) {
      let sFilm = {
        name: films[j].fn,
        movieID: films[j].fc,
        imgsrc: films[j].fpn + suffixImg,
        filmType: films[j].ft,
        isActivity: films[j].ia,
        filmDeartion: films[j].fd,
        schedule: []
      }

      //场次日期
      let days = films[j].sdv.split(',');
      let dates = films[j].sd.split(',');
      let dayLen = days.length;

      for (let n = 0; n < dayLen; n++) {
        let sch = {
          day: days[n],
          date: dates[n],
          content: []
        };
        sFilm.schedule.push(sch);
      }
      homefilms.push(sFilm);
    }

    homefilms.forEach((value, index, array) => {
      let filmCode = value.movieID;
      let filmSchedule = array[index].schedule;
      let movieDate = data.shows[filmCode];

      for (let n = 0; n < filmSchedule.length; n++) {
        let schContent = filmSchedule[n].content;
        let dateCode = filmSchedule[n].date;
        let dateContentList = movieDate[dateCode];
        let tag = 0;

        if (dateContentList == undefined) {
          schContent = [];
        } else {
          let sunOrMoon = 'moon';
          for (let j = 0; j < dateContentList.length; j++) {
            let contentI = {
              sm: '',
              price: 0,
              endPrice: 0,
              haltSales: '',
              availableSeats: '0',
              isStopSell: dateContentList[j].o == '0',
              isSellOut: dateContentList[j].d == 0,
              eventPrice: Number(dateContentList[j].m) || 0,
              activityCardPrice: Number(dateContentList[j].v) || 0,
              showCode: dateContentList[j].g,
              ismorrow: dateContentList[j].ism,
              eventIsSatart: dateContentList[j].eis,
              filmCode: dateContentList[j].a,
              filmLang: dateContentList[j].e,
              filmNo: dateContentList[j].h,
              hallCode: dateContentList[j].j,
              hallName: dateContentList[j].t,
              showDate: dateContentList[j].k,
              startTime: dateContentList[j].q,
              endTime: dateContentList[j].s,
              tagType: dateContentList[j].y,
              tagName: dateContentList[j].w,
              tagContent: dateContentList[j].x,
              movieType: dateContentList[j].e + dateContentList[j].r,
              finalPrice: 0,
              cardPrice: 0,
              throughPrice: 0,
            };

            let subTime = Number(contentI.startTime.split(':')[0]);

            // 判断什么时候显示太阳和月亮
            // debugger
            if (j == 0) {
              if (subTime > 5 && subTime < 19) {
                sunOrMoon = 'sun';
                contentI.sm = 'sun';
              } else {
                sunOrMoon = 'moon';
                contentI.sm = 'moon';
              }
            } else {
              if (subTime > 5 && subTime < 19) {
                if (sunOrMoon == 'sun') {
                  contentI.sm = '';
                } else {
                  contentI.sm = 'sun';
                }
              } else {
                if (sunOrMoon == 'moon') {
                  contentI.sm = '';
                } else {
                  sunOrMoon = 'moon';
                  contentI.sm = 'moon';
                }
              }
            }

            if (dateContentList[j].b && dateContentList[j].b != "" && dateContentList[j].b > 0) {
              contentI.price = Number(dateContentList[j].b); //price打折之后的价格
            } else {
              contentI.price = Number(dateContentList[j].n); //price打折之后的价格
            }

            contentI.terraceFilmPrice = Number(dateContentList[j].b); //策略价
            contentI.endPrice = Number(dateContentList[j].n);

            if (!filmSchedule[n].tagName) {
              if (dateContentList[j].y == 3) {
                filmSchedule[n].tagName = dateContentList[j].w.slice(0, 1);
              } else {
                if (tag != 1) {
                  if (dateContentList[j].y == 2) {
                    tag = 1;
                  } else if (dateContentList[j].y == 1) {
                    if (tag == 0) {
                      tag = 2;
                    }
                  }
                }
              }
            }

            // 售价
            if (contentI.eventPrice) {
              contentI.finalPrice = contentI.eventPrice
            } else if (contentI.terraceFilmPrice) {
              contentI.finalPrice = contentI.terraceFilmPrice
            } else {
              contentI.finalPrice = contentI.endPrice
            }

            // 开卡享
            if (contentI.finalPrice > contentI.activityCardPrice) {
              contentI.cardPrice = contentI.activityCardPrice
            }

            // 划线价
            if (contentI.eventPrice) {
              contentI.throughPrice = contentI.price;
            } else if (contentI.price < contentI.endPrice) {
              contentI.throughPrice = contentI.endPrice;
            }

            if (dateContentList[j].p == undefined || dateContentList[j].p == '') {
              contentI.haltSales = '0';
            } else {
              contentI.haltSales = dateContentList[j].p; //值为'1'时为停售，'0'未停售
            }

            contentI.eventIsSatart = dateContentList[j].eis;
            schContent.push(contentI);
          }
        }
        if (!filmSchedule[n].tagName) {
          if (tag == 1) {
            filmSchedule[n].tagName = '点';
          } else if (tag == 2) {
            filmSchedule[n].tagName = '惠';
          }
        }
      }
    });
    return homefilms;
  }
})
