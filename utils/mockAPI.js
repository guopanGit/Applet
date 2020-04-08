import {
  URL,
} from './config.js';
const {
  getFriendFilmInfo,
  getFriendSellProduct,
  createFriendActivity,
  getMyPowerWin,
  getFriendPowerWin,
  getActivityDesc,
  getPowerMemberJoinList,
  getPowerRecord,
  giveHimAHand
} = URL
const Mock = require('./mock')
const Random = Mock.Random;

//近期热映接口
const getFriendFilmInfoData = Mock.mock({
  "resultCode": "0",
  "resultDesc": "成功",
  "resultData": {
    "filmInfoList": [
      {
        "filmName": "唐人街探案3",
        "filmPoster": "https://oss.cdn.ingcore.com/movie/imagecache/c622ef32cd204f7e64d6ec62150be096.jpg",
        "isSale": "1"
      }
    ]
  }
})

//热销卖品接口
const getFriendSellProductData = Mock.mock({
  "resultCode": "0",
  "resultDesc": "成功",
  "resultData": {
    "sellProductList|20": [
      {
        "sellName": ()=>Random.cword(3, 5),
        "images": () =>Random.image(),
        "storefrontPrice": "150",
        "singePrice": "100"
      }
    ]
  }
})

//免费拿好礼发起接口
const createFriendActivityData = Mock.mock({
  "resultCode": "0",
  "resultDesc": "成功",
  "resultData": {
    "memberJoinId": "000d1c8704a611e8871200163e2e452e"
  }
})


//获取活动详情
const getActivityDescData = Mock.mock({
  "resultCode": "0",
  "resultDesc": "成功",
  "resultData": {
    "currentTime": 1586240793374,
    "friendActivity": {
      "activityId": "1",
      "activityCode": "1",
      "activityName": "测试获取名称",
      "expireStartTime": 1585128505000,
      "expireEndTime": 1584350908000,
      "activityRule": "1",
      "styleType": 1,
      "activityPicUrl": "",
      "rgbCode": "1",
      "inviteType": 1,
      "effectLength": 1,
      "singleCustomerInviteNum": 1,
      "singleDaySendNum": 1,
      "singleCustomerReceiveNum": 1,
      "status": 3,
      "activeStatus": 1,
      "activeBy": "1",
      "activeTime": 1585128567000,
      "delFlag": 0,
      "companyCode": "1",
      "createBy": "1",
      "createTime": 1585128567000,
      "updateBy": null,
      "updateTime": 1585558184000,
      "prizeName": "1",
      "prizeCountNum": 1,
      "prizeSendNum": 1,
      "stockNum": 0,
      "prizeDescription": "1",
      "helpCount": 0
    }
  },
  "success": true
})

//用户参与的助力活动列表接口
const getPowerMemberJoinListData = Mock.mock({
  "resultCode": "0",
  "resultDesc": "success",
  "resultData": {
    "memberJoinList": [
      {
        "memberJoinId": "56777285370850311566",
        "prizeName": "",
        "powerStatus": "0",
        "createTime": "1585128567000",
        "effectLength": "1585128567000"
      }
    ],
    "currentTime": "1585128567000"
  }
})

//我的奖品
const getMyPowerWinData = Mock.mock({
  "resultCode": "0",
  "resultDesc": "success",
  "resultData": {
    "prizeType": "0"
  }
})

//获取助力活动中奖记录接口
const getFriendPowerWinData = Mock.mock({
  "resultCode": "0",
  "resultDesc": "success",
  "resultData": {
    "powerWinList|1-5": [
      {
        "createTime": "刚刚",
        "prizeName": "免费观影券",
        "wechatImage": () => Random.image(),
        "wechatName": () => Random.name()
      }
    ]
  }
})

//获取助力记录接口
const getPowerRecordData = Mock.mock({
  "resultCode": "0",
  "resultDesc": "success",
  "resultData": {
    "powerRecordList": [
      {
        "helpWechatImage": "20160100000000H",
        "helpWechatName": "",
        "createTime": "2020-04-03 14:35:09"
      }
    ],
    "activityMemberName": "",
    "activityMemberImage": "20160100000000H",
    "activityDesc": {},
    "powerNum": "0",
    "memberCode": "000090996dc3487b86d2870f2fa7c2e1",
    "currentTime": "2020-04-03 14:35:09",
    "memberJoinId": "000090996dc3487b86d2870f2fa7c2e1"
  }
})

//帮他一把接口
const giveHimAHandData = Mock.mock({
  "resultCode": "0",
  "resultDesc": "成功",
  "resultData": {
    "memberJoinId": "00c62b67f6ba47008c36a721e18b80c0"
  }
})


export default {
  [getActivityDesc]: getActivityDescData,
  [getPowerMemberJoinList]: getPowerMemberJoinListData,
  [getFriendFilmInfo]: getFriendFilmInfoData,
  [getFriendSellProduct]: getFriendSellProductData,
  [createFriendActivity]: createFriendActivityData,
  [getMyPowerWin]: getMyPowerWinData,
  [getFriendPowerWin]: getFriendPowerWinData,
  [getPowerRecord]: getPowerRecordData,
  [giveHimAHand]: giveHimAHandData
};