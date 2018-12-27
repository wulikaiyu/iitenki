//index.js
//获取应用实例
const app = getApp()
const weatherMap = {
  'sunny': '晴れ',
  'cloudy': '雲り',
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

Page({
  data:{
    nowTemp:"",
    nowWeather : "",
    nowWeatherBackground:"",
    nowCityColor:"",
    todayDate:"",
    todayTemp:"",
    city:"上海市",
    locationTipsText:"更新の都市をクリックしてください",
    locationAuthType:UNPROMPTED,
    locationTipsText:UNPROMPTED_TIPS,
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
      url: 'https://test-miniprogram.com/api/weather/now',
      data:{
        city:this.data.city},
      header:{
        'content-type':
        'application/json'},
      success:res=>{    
        let result = res.data.result
        this.setNow(result)
        //console.log(nowHour)
        this.setHourlyWeather(result)
        this.setDay(result)
      },
      complete:()=>{
       callback && callback()//callback不是no的话执行callback
      }
    })
  },
  setNow(result) {
    let temp = result.now.temp
    let weather = result.now.weather//之前的参数
    this.setData({
      nowTemp: temp + '℃',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: "/images/" + weather + "-bg.png",
      nowCityColor: weatherColorMap[weather],   
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },
  setHourlyWeather(result) {
    let hourlyWeather = []
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    this.setData({
      hourlyWeather: hourlyWeather
    })  
  },
  setDay(result){
    let date = new Date()
    let year =date.getFullYear();let month=date.getMonth()+1;let day =date.getDate()
    let maxTemp = result.today.maxTemp
    let minTemp = result.today.minTemp
    let tempDiff = result.today.maxTemp - result.today.minTemp
    this.setData({
      todayDate: year+"-"+month+"-"+day,
      todayTemp:minTemp + "℃~" + maxTemp + "℃\t" // + "\t温度差：" + tempDiff + "℃",
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
        fail:res=>{
          console.log(res)
        }
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
          location: { latitude, longitude },
          success: res=>{
            let city = res.result.address_component.city
            let locationTipsText = ""
            //console.log(res)
            if(city=="")
              {city="なに"
              locationTipsText = "どこにあるのか(ﾉﾟοﾟ)"}
            this.setData({
              city: city,
              locationTipsText: locationTipsText
            })     
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

