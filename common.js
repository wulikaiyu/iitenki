function getPeakHeight() {
  let screenRate = wx.getSystemInfoSync().windowHeight / wx.getSystemInfoSync().windowWidth
  let peakHeight = 0
  if (screenRate > 1.8)
    peakHeight = screenRate * 50
  else
    peakHeight = 0
  return peakHeight
}

module.exports.getPeakHeight = getPeakHeight