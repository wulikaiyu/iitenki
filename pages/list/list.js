const common = require('../../common.js')
const weatherImage = {
  '晴': 'sunny',
  "阴": 'overcast',
  "多云": 'cloudy',
  "雨夹雪": 'snow',
  "小雨": 'lightrain',
  "中雨": 'lightrain',
  "阵雨": 'lightrain',
  "小雪": 'snow',
  "中雪": 'snow',
  "大雪": 'snow',
  "大雨": 'heavyrain',
  "雾": 'cloudy',
  "暴雨": 'heavyrain',
  "雷阵雨": 'heavyrain',
  "阵雪": 'snow',
  "暴雪": 'snow',
  "扬沙": 'snow',
  "大暴雨": 'heavyrain',
  "霾": 'overcast',
  "浮尘": 'cloudy'
}
Page({
  data: {
    weekWeather1: "",
    weekWeather2:"",
    city:"上海市",
    peakHeight:0,
    WeekdayMap:[],
    weekdayNum:"",
  },
  onPullDownRefresh(){
  this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },
  onLoad(options){
    let weekdayNum = new Date().getDay()
    let peakHeight= common.getPeakHeight()
    this.getLan(3)
    this.setData({
      city:options.city,
      peakHeight:peakHeight,
      weekdayNum:weekdayNum,
    })
    this.getNow();
  },
  getLan(options){
    let weekWeather1= []
    let weekdayNum = this.data.weekdayNum
    if (options === 1)
      {var WeekdayMap = require('../../language/Chinese.js').WeekdayMap}
    if (options === 2)
      var WeekdayMap = require('../../language/English.js').WeekdayMap
    if (options === 3)
      var WeekdayMap = require('../../language/Japanese.js').WeekdayMap
    if (options === 4)
      var WeekdayMap = require('../../language/Korean.js').WeekdayMap 
    for (let i = 0; i < 7; i += 1) {
      let num = weekdayNum + i
      if (num > 6)
        num = num - 7
      weekWeather1.push({
        day: WeekdayMap[num],
      })
    }
    this.setData({
      WeekdayMap:WeekdayMap,
      weekWeather1:weekWeather1
    })

  },
  getNow(callback){
    let WeekdayMap = this.data.WeekdayMap
    wx.request({
      url: 'https://www.tianqiapi.com/api/?version=v1',
      data: {
        time: new Date().getTime(),
        city: this.data.city
      },
      header: {
        'content-type':
          'application/json'
      },
      success: res => {
        let weekdayWeather = res.data.data
        let weekWeather2= []
        let weekdayNum = this.data.weekdayNum
        for (let i = 0; i < 7; i += 1) {
          let num = i
          if (num > 6)
            num = num - 7
          weekWeather2.push({
            weatherIcon: '/images/' + weatherImage[weekdayWeather[i].hours[0].wea]+ "-icon.png",
            temp: weekdayWeather[i].tem2 + '~' + weekdayWeather[i].tem1
          })
        }
        this.setData({
          weekWeather2: weekWeather2
        })
      },
      complete: () => {
        callback && callback()//callback不是no的话执行callback
      }
    })
  },
  onTapGetBack(){
    wx.navigateTo({
      url: "/pages/index/index"
    })
  },
  onTapChinese() {
    this.getLan(1)
  },
  onTapEnglish() {
    this.getLan(2)
    this.getNow()
    
  },
  onTapJapanese() {
    this.getLan(3)
    this.getNow()
  
  },
  onTapKorean() {
    this.getLan(4)
  },
  chanMask: function () {
    var isShow = this.data.show ? false : true;
    var delay = isShow ? 30 : 1000;
    if (isShow) {
      this.setData({
        show: isShow
      });
    } else {
      this.setData({
        runAM: isShow
      });
    }
    setTimeout(function () {
      if (isShow) {
        this.setData({
          runAM: isShow
        });
      } else {
        this.setData({
          show: isShow
        });
      }
    }.bind(this), delay);
  }
})

