const WeekdayMap = {
  "1": "星期一",
  "2": "星期二",
  "3": "星期三",
  "4": "星期四",
  "5": "星期五",
  "6": "星期六",
  "0": "星期日",
}
Page({
  data: {
    weekWeather:"",
    city:"上海市"
  },
  onPullDownRefresh(){
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },
  onLoad(options){
    this.setData({
      city:options.city
    })
    this.getNow();
  },
  getNow(callback){
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
        let weekWeather = []
        let weekdayNum = new Date().getDay()
        for (let i = 0; i < 7; i += 1) {
          let num = weekdayNum + i
          if (num > 6)
            num = num - 7
          weekWeather.push({
            day: WeekdayMap[num],
            weatherIcon: '/images/' + weekdayWeather[i].weather + "-icon.png",
            temp: weekdayWeather[i].minTemp + '°~' + weekdayWeather[i].maxTemp + "°"
          })
        }
        this.setData({
          weekWeather: weekWeather
        })
      },
      complete: () => {
        callback && callback()//callback不是no的话执行callback
      }
    })
  }
})