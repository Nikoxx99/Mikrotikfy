/* eslint-disable no-undef */
const RouterOSAPI = require('node-routeros').RouterOSAPI
module.exports.mkCreateClient = async function (input) {
  const conn = new RouterOSAPI({
    host: input.newCity[0].ip,
    user: 'API_ARNOP',
    password: 'weare991010rootnortetv',
    port: 8087
  })
  const comment = `${input.code} ${input.name} ${input.dni} ${input.address} ${input.newNeighborhood[0].name} ${input.newCity[0].name} ${input.phone} ${input.newPlan[0].name} ${input.wifi_ssid} ${input.wifi_password} ${input.newTechnology[0].name} ${input.mac_address} ${input.comment} ${input.operator}`
  await conn.connect().then(() => {
    console.log('Connected to Mikrotik Successfully >>>')
  }).then(() => {
    conn.write('/ppp/secret/add', [
      '=name='+input.code,
      '=password=MAR'+input.code,
      '=profile='+input.newPlan[0].mikrotik_name,
      '=service=pppoe',
      '=comment='+comment,
    ]).then(() => {
      conn.close()
      console.log('Connection Closed <<<')
    })
  }).catch((err) => {
    conn.close()
    console.log(err)
  })
}

module.exports.mkDeleteClient = async function (input) {
  const conn = new RouterOSAPI({
    host: input.newCity,
    user: 'API_ARNOP',
    password: 'weare991010rootnortetv',
    port: 8087
  })
  await conn.connect().then(() => {
    console.log('Connected to Mikrotik Successfully >>>')
  }).then(() => {
    conn.write('/ppp/secret/getall', [
      '=.proplist=.id',
      '?=name='+input.client,
    ]).then((data) => {
      conn.write('/ppp/secret/remove', [
        '=.id='+data[0]['.id']
      ]).then(() => {
        conn.close()
        console.log('Connection Closed <<<')
        return true
      })
    })
  }).catch((err) => {
    conn.close()
    console.log(err)
  })
}