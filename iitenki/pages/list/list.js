const common = require('../../common.js')
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
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        time: new Date().getTime(),
        city: this.data.city
      },
      header: {
        'content-type':
          'application/json'
      },
      success: res => {
        let weekdayWeather = res.data.result
        let weekWeather2= []
        let weekdayNum = this.data.weekdayNum
        for (let i = 0; i < 7; i += 1) {
          let num = weekdayNum + i
          if (num > 6)
            num = num - 7
          weekWeather2.push({
            weatherIcon: '/images/' + weekdayWeather[i].weather + "-icon.png",
            temp: weekdayWeather[i].minTemp + '°~' + weekdayWeather[i].maxTemp + "°"
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

