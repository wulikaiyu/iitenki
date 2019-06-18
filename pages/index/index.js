//index.js
//获取应用实例
const app = getApp()
const weatherImage = {
  '晴':'sunny',
  "阴":'overcast', 
  "多云":'cloudy',
  "雨夹雪":'snow',
  "小雨":'lightrain',
  "中雨":'lightrain',
  "阵雨":'lightrain', 
  "小雪":'snow', 
  "中雪":'snow', 
  "大雪":'snow', 
  "大雨":'heavyrain', 
  "雾":'cloudy', 
  "暴雨": 'heavyrain',
  "雷阵雨":'heavyrain', 
  "阵雪":'snow', 
  "暴雪": 'snow', 
  "扬沙": 'snow', 
  "大暴雨":'heavyrain', 
  "霾":'overcast', 
  "浮尘":'cloudy'
}
const weatherMap = {
  '晴': '晴れ',
  '多云': '雲り',
  'overcast': '大雲',
  'lightrain': '小ぬか雨',
  'heavyrain': '強い雨',
  'snow': '雪'}
const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'}
const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

const UNPROMPTED_TIPS = "クリックして現在地を確認"
const UNAUTHORIZED_TIPS = "クリックして場所の許可を開く"
const AUTHORIZED_TIPS = ""

const common = require("../../common.js")
Page({
  data:{
    nowTemp:"",
    nowWeather : "",
    nowWeatherBackground:"",
    nowCityColor:"",
    todayDate:"",
    todayTemp:"",
    city:"",
    locationTipsText:"更新の都市をクリックしてください",
    locationAuthType:UNPROMPTED,
    locationTipsText:UNPROMPTED_TIPS,
    peakHeight:0,
    },
  onPullDownRefresh(){
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },
  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key:'FY3BZ-BZX3O-IRRWS-SU4DG-ZKQPT-BQBCJ'
    }),
    this.getNowSetting()
    let peakHeight = common.getPeakHeight()
    this.setData({
      peakHeight:peakHeight
    })
  },
  onShow(){
    wx.getSetting({
      success:res=>{
        let auth = res.authSetting["scope.userLocation"]
        if (auth && this.data.locationAuthType != AUTHORIZED) {
          //权限从无到有
          this.setData({
            locationAuthType: AUTHORIZED,
            locationTipsText: AUTHORIZED_TIPS
          })
          this.getNowLocation()
        }
      }    
    })  
  },
  getNow(callback){
    wx.request({
      url: 'https://www.tianqiapi.com/api/?version=v1',
      data:{
        city: this.data.city.substring(0,2)},
      header:{
        'content-type':
        'application/json'},
      success:res=>{  
        let result = res.data
        let city = result.city +'市'
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setDay(result)
        this.setData({
          city:city
        })
      },
      complete:()=>{
       callback && callback()//callback不是no的话执行callback
      }
    })

  },
  setNow(result) {
    let forecast = result.data[0].hours
    for (let i = 0; i < 8; i += 1){
      let hour = parseInt(forecast[i].day.substring(3, 5))    
      let nowHourB = new Date().getHours()
      if(Math.abs(nowHourB - hour)<3){
        var temp = result.data[0].hours[i].tem
        var weather = result.data[0].hours[i].wea
        break;
      }
    }  //之前的参数
    this.setData({
      nowTemp: temp,
      nowWeather: weather,
      nowWeatherBackground: "/images/" + weatherImage[weather] + "-bg.png",
      nowCityColor: weatherColorMap[weatherImage[weather]],   
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weatherImage[weather]],
    })
  },
  setHourlyWeather(result) {
    let hourlyWeather = []
    let forecast = result.data[0].hours
    console.log(forecast)
    let nowHourB = new Date().getHours()
    let nowHour = parseInt(forecast[0].day.substring(3, 5))
    for (let i = 0; i < forecast.length; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + weatherImage[forecast[i].wea] + '-icon.png',
        temp: forecast[i].tem
      })
    }

    this.setData({
      hourlyWeather: hourlyWeather
    })  
  },
  setDay(result){
    let date = new Date()
    let year =date.getFullYear();let month=date.getMonth()+1;let day =date.getDate()
    let maxTemp = result.data[0].tem1
    let minTemp = result.data[0].tem2
    let tempDiff = maxTemp - minTemp
    this.setData({
      todayDate: year+"-"+month+"-"+day,
      todayTemp:minTemp + "~" + maxTemp + "\t" // + "\t温度差：" + tempDiff + "℃",
    }) 
    
  },
  onTapDayWeather(){
    wx.navigateTo({
      url:"/pages/list/list?city="+this.data.city,
    })
  },
  onTapLocation() {
    if(this.data.locationAuthType===UNAUTHORIZED)
      wx.openSetting({
        success:res=>{
          //console.log(res)
          let auth = res.authSetting["scope.userLocation"]
          if(auth){
            wx.showToast({
              title: '位置情報を取得する',
            })
            this.getNowLocation()
          }
        },
      })
    else
      this.getNowLocation() 
    console.log(this.data.locationAuthType)
  },
  getNowLocation(){
    wx.getLocation({
      success: res=>{
        this.setData({
          locationAuthType: AUTHORIZED,
          locationAuthTypeText: AUTHORIZED_TIPS
        })
        let latitude = res.latitude
        let longitude = res.longitude
        this.qqmapsdk.reverseGeocoder({
          location: { 
            latitude,
            longitude
             },
          success: res=>{
            //console.log(res)
            let nation_code = res.result.ad_info.nation_code
            let city = ""
            if (nation_code === "392" || nation_code === "410")
              city = res.result.address_component.locality
            if (nation_code === "156")
              city = res.result.address_component.city
            let locationTipsText = ""       
            if(city=="")
              {city="なに"
              locationTipsText = "どこにあるのか(ﾉﾟοﾟ)"}
            this.setData({
              city: city,
              locationTipsText: locationTipsText
            }) 
            console.log(city)    
            this.getNow()  
          } ,         
          fail:res =>{
            console.log(res)
            this.setData({
              locationTipsText: "エラーが発生しました｡ﾟ･ (>﹏<) ･ﾟ｡" 
            })
            this.getNow()   
          }   
        })       
      },
      fail:res=>{
        this.setData({
          locationAuthType:UNAUTHORIZED,
          locationAuthTypeText:UNAUTHORIZED_TIPS
        })
      }
    })
  },
  getNowSetting() {
    wx.getSetting({
      success: res => {
        let auth = res.authSetting['scope.userLocation']
        let locationAuthType = auth ? AUTHORIZED
          : (auth === false) ? UNAUTHORIZED : UNPROMPTED
        let locationTipsText = auth ? AUTHORIZED_TIPS
          : (auth === false) ? UNAUTHORIZED_TIPS : UNPROMPTED_TIPS
        this.setData({
          locationAuthType: locationAuthType,
          locationTipsText: locationTipsText
        })
        if (auth)
          this.getNowLocation()
        else
          this.getNow() //使用默认城市
      },
      fail: () => {
        console.log("初始化失败")
        this.getNow() //使用默认城市
      }
    })
  }
})




