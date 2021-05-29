const http = require('http')
const refresh1 = () => {
  http.get(`${process.env.BASE_URI}/refreshClientData?city=5f832e8fb0c43e2c64b37437`, function (response) {
    return response
  })
  http.get(`${process.env.BASE_URI}/refreshClientData?city=5fc3f0408e3de73d204cd430`, function (response) {
    return response
  })
  http.get(`${process.env.BASE_URI}/refreshMikrotikData?city=5f832e8fb0c43e2c64b37437`, function (response) {
    return response
  })
  http.get(`${process.env.BASE_URI}/refreshMikrotikData?city=5fc3f0408e3de73d204cd430`, function (response) {
    return response
  })
}

const setIntervalImmediately = (func, interval) => {
  func()
  return setInterval(func, interval)
}

setIntervalImmediately(refresh1, 60000)
