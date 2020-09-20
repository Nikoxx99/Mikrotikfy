/* eslint-disable no-undef */
const RouterOSAPI = require('node-routeros').RouterOSAPI
module.exports.mkCreateClient = async function (input) {
  const conn = new RouterOSAPI({
    host: input.newCity[0].ip,
    user: 'API_ARNOP',
    password: 'weare991010rootnortetv',
    port: 8087
  })
  const comment = `${input.code} ${input.name} ${input.dni} ${input.address} ${input.newNeighborhood[0].name} ${input.newCity[0].name} ${input.phone} ${input.newPlan[0].name} ${input.wifi_ssid} ${input.wifi_password} ${input.newTechnology[0].name} ${input.mac_address} ${input.comment}`
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

module.exports.mkClientStatus = async function (input) {
  const conn = new RouterOSAPI({
    host: input.newCity,
    user: 'API_ARNOP',
    password: 'weare991010rootnortetv',
    port: 8087
  })
  await conn.connect()
  try {
    if (input.model === 1) {
      var com1 = await conn.write('/interface/print', [
        '=.proplist=tx-byte,rx-byte,last-link-up-time',
        '?=name=<pppoe-' + input.code + '>',
      ])
      var com2 = await conn.write('/ppp/active/print', [
        '=.proplist=caller-id,uptime,address',
        '?=name='+input.code,
      ])
    } else {
      // eslint-disable-next-line no-redeclare
      var com1 = await conn.write('/interface/print', [
        '=.proplist=tx-byte,rx-byte,last-link-up-time',
        '?=name=<pppoe-' + input.dni + '>',
      ])
      // eslint-disable-next-line no-redeclare
      var com2 = await conn.write('/ppp/active/print', [
        '=.proplist=caller-id,uptime,address',
        '?=name='+input.dni,
      ])
    } 
    if (com1.length > 0 && com2.length > 0) {
      let client = {}
      client.status = true
      client.download = com1[0]['tx-byte']
      client.upload = com1[0]['rx-byte']
      client.offlineTime = com1[0]['last-link-up-time']
      client.address = com2[0]['address']
      client.mac_address = com2[0]['caller-id']
      client.uptime = com2[0].uptime
      conn.close()
      return client
    } else {
      if (input.model === 1) {
        var com3 = await conn.write('/ppp/secret/print', [
          '=.proplist=last-logged-out',
          '?=name='+input.code,
        ])
      } else {
        // eslint-disable-next-line no-redeclare
        var com3 = await conn.write('/ppp/secret/print', [
          '=.proplist=last-logged-out',
          '?=name='+input.dni,
        ])
      }
      if (com3.length > 0) {
        let client = {}
        client.status = true
        client.offlineTime = com3[0]['last-logged-out']
        conn.close()
        return client
      }
      let client = {}
      client.status = false
      conn.close()
      return client
    }
  } catch (error) {
    console.log(error)
    conn.close()
  }
}

module.exports.mkGetActiveClients = async function (input) {
  const conn = new RouterOSAPI({
    host: input.newCity,
    user: 'API_ARNOP',
    password: 'weare991010rootnortetv',
    port: 8087
  })
  await conn.connect()
  const com1 = await conn.write('/ppp/active/print', [
    '=.proplist=name',
  ])
  conn.close()
  return com1
}

module.exports.mkSetClientPlanInformation = async function (input) {
  const conn = new RouterOSAPI({
    host: input.newCity,
    user: 'API_ARNOP',
    password: 'weare991010rootnortetv',
    port: 8087
  })
  try {
    await conn.connect()
    if (input.model === 1) {
      // eslint-disable-next-line no-unused-vars
      var com1 = await conn.write('/ppp/secret/getall', [
        '=.proplist=.id',
        '?=name='+input.code,
      ])
      var removeActive = await conn.write('/ppp/active/getall', [
        '=.proplist=.id',
        '?=name='+input.code,
      ])
    } else {
      // eslint-disable-next-line no-redeclare
      var com1 = await conn.write('/ppp/secret/getall', [
        '=.proplist=.id',
        '?=name='+input.dni,
      ])
      // eslint-disable-next-line no-redeclare
      var removeActive = await conn.write('/ppp/active/getall', [
        '=.proplist=.id',
        '?=name='+input.dni,
      ])
    }
    if (com1.length > 0) {
      await conn.write('/ppp/secret/set', [
        '=.id=' + com1[0]['.id'],
        '=profile='+input.newPlan,
      ])
      if (input.removeActive) {
        if (removeActive.length > 0) { 
          // eslint-disable-next-line no-redeclare
          var removeActive = await conn.write('/ppp/active/remove', [
            '=.proplist=.id',
            '=.id='+removeActive[0]['.id'],
          ])
        }
      }
      conn.close()
      return true
    } else {
      console.log('Failed setting client information')
      conn.close()
      return false
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports.mkGetComment = async function (input) {
  const conn = new RouterOSAPI({
    host: input.newCity,
    user: 'API_ARNOP',
    password: 'weare991010rootnortetv',
    port: 8087
  })
  await conn.connect()
  if (input.model === 1) {
    console.log(input.code)
    // eslint-disable-next-line no-unused-vars
    var com1 = await conn.write('/ppp/secret/print', [
      '=.proplist=comment',
      '?=name=' + input.code
    ])
  } else {
    // eslint-disable-next-line no-redeclare
    var com1 = await conn.write('/ppp/secret/print', [
      '=.proplist=comment',
      '?=name=' + input.dni
    ])
  }
  conn.close()
  return com1[0]
}
module.exports.mkSetComment = async function (input) {
  const conn = new RouterOSAPI({
    host: input.newCity,
    user: 'API_ARNOP',
    password: 'weare991010rootnortetv',
    port: 8087
  })
  await conn.connect()
  if (input.model === 1) {
    // eslint-disable-next-line no-unused-vars
    var com1 = await conn.write('/ppp/secret/set', [
      '=.id=' + input.code,
      '=comment=' + input.comment
    ])
  } else {
    // eslint-disable-next-line no-redeclare
    var com1 = await conn.write('/ppp/secret/set', [
      '=.id=' + input.dni,
      '=comment=' + input.comment
    ])
  }
  conn.close()
  return com1[0]
}
