/* eslint-disable no-undef */
const RouterOSAPI = require('node-routeros').RouterOSAPI
module.exports.mkSetClientPlanInformation = async function (mikrotikHost, input) {
  const conn = new RouterOSAPI({
    host: mikrotikHost,
    user: 'API_ARNOP',
    password: strapi.config.get('server.admin.mikrotik.secret', 'null'),
    port: 8087
  })
  try {
    await conn.connect()
    if (input.model === 1) {
      // eslint-disable-next-line no-unused-vars
      var com1 = await conn.write('/ppp/secret/getall', [
        '=.proplist=.id',
        '?=name=' + input.code,
      ])
      var removeActive = await conn.write('/ppp/active/getall', [
        '=.proplist=.id',
        '?=name=' + input.code,
      ])
    } else {
      // eslint-disable-next-line no-redeclare
      var com1 = await conn.write('/ppp/secret/getall', [
        '=.proplist=.id',
        '?=name=' + input.dni,
      ])
      // eslint-disable-next-line no-redeclare
      var removeActive = await conn.write('/ppp/active/getall', [
        '=.proplist=.id',
        '?=name=' + input.dni,
      ])
    }
    if (com1.length > 0) {
      await conn.write('/ppp/secret/set', [
        '=.id=' + com1[0]['.id'],
        '=profile=' + input.newClientPlan,
      ])
      if (input.removeActive) {
        if (removeActive.length > 0) {
          // eslint-disable-next-line no-redeclare
          var removeActive = await conn.write('/ppp/active/remove', [
            '=.proplist=.id',
            '=.id=' + removeActive[0]['.id'],
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
module.exports.mkClientStatus = async function (mikrotikHost, code, dni, model) {
  const conn = new RouterOSAPI({
    host: mikrotikHost,
    user: 'API_ARNOP',
    password: strapi.config.get('server.admin.mikrotik.secret', 'null'),
    port: 8087
  })
  await conn.connect()
  try {
    if (model === 1) {
      var com1 = await conn.write('/interface/print', [
        '=.proplist=tx-byte,rx-byte,last-link-up-time',
        '?=name=<pppoe-' + code + '>',
      ])
      var com2 = await conn.write('/ppp/active/print', [
        '=.proplist=caller-id,uptime,address',
        '?=name=' + code,
      ])
    } else {
      // eslint-disable-next-line no-redeclare
      var com1 = await conn.write('/interface/print', [
        '=.proplist=tx-byte,rx-byte,last-link-up-time',
        '?=name=<pppoe-' + dni + '>',
      ])
      // eslint-disable-next-line no-redeclare
      var com2 = await conn.write('/ppp/active/print', [
        '=.proplist=caller-id,uptime,address',
        '?=name=' + dni,
      ])
    }
    if (com1.length > 0 && com2.length > 0) {
      let client = {}
      client.status = true
      client.mikrotik = false
      client.download = com1[0]['tx-byte']
      client.upload = com1[0]['rx-byte']
      client.offlineTime = com1[0]['last-link-up-time']
      client.address = com2[0]['address']
      client.mac_address = com2[0]['caller-id']
      client.uptime = com2[0].uptime
      conn.close()
      return client
    } else {
      if (model === 1) {
        var com3 = await conn.write('/ppp/secret/print', [
          '=.proplist=last-logged-out',
          '?=name=' + code,
        ])
      } else {
        // eslint-disable-next-line no-redeclare
        var com3 = await conn.write('/ppp/secret/print', [
          '=.proplist=last-logged-out',
          '?=name=' + dni,
        ])
      }
      if (com3.length > 0) {
        var client_old_mk = {}
        client_old_mk.status = true
        client_old_mk.offlineTime = com3[0]['last-logged-out']
        conn.close()
        if (mikrotikHost === '191.102.86.50') {
          const conn = new RouterOSAPI({
            host: '191.102.86.54',
            user: 'API_ARNOP',
            password: strapi.config.get('server.admin.mikrotik.secret', 'null'),
            port: 8087
          })
          await conn.connect()
          try {
            if (model === 1) {
              // eslint-disable-next-line no-redeclare
              var com1 = await conn.write('/interface/print', [
                '=.proplist=tx-byte,rx-byte,last-link-up-time',
                '?=name=<pppoe-' + code + '>',
              ])
              // eslint-disable-next-line no-redeclare
              var com2 = await conn.write('/ppp/active/print', [
                '=.proplist=caller-id,uptime,address',
                '?=name=' + code,
              ])
            } else {
              // eslint-disable-next-line no-redeclare
              var com1 = await conn.write('/interface/print', [
                '=.proplist=tx-byte,rx-byte,last-link-up-time',
                '?=name=<pppoe-' + dni + '>',
              ])
              // eslint-disable-next-line no-redeclare
              var com2 = await conn.write('/ppp/active/print', [
                '=.proplist=caller-id,uptime,address',
                '?=name=' + dni,
              ])
            }
            if (com1.length > 0 && com2.length > 0) {
              let client = {}
              client.status = true
              client.mikrotik = true
              client.download = com1[0]['tx-byte']
              client.upload = com1[0]['rx-byte']
              client.offlineTime = com1[0]['last-link-up-time']
              client.address = com2[0]['address']
              client.mac_address = com2[0]['caller-id']
              client.uptime = com2[0].uptime
              conn.close()
              return client
            } else {
              if (model === 1) {
                // eslint-disable-next-line no-redeclare
                var com3 = await conn.write('/ppp/secret/print', [
                  '=.proplist=last-logged-out',
                  '?=name=' + code,
                ])
              } else {
                // eslint-disable-next-line no-redeclare
                var com3 = await conn.write('/ppp/secret/print', [
                  '=.proplist=last-logged-out',
                  '?=name=' + dni,
                ])
              }
              if (com3[0]['last-logged-out'] !== 'jan/01/1970 00:00:00') {
                console.log('this', client_old_mk)
                let client = {}
                client.status = true
                client.offlineTime = com3[0]['last-logged-out']
                conn.close()
                return client
              }
              if (client_old_mk['offlineTime:'] !== 'jan/01/1970 00:00:00') {
                conn.close()
                return client_old_mk
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
        } else {
          return client_old_mk
        }
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
module.exports.mkGetComment = async function (mikrotikHost, dni, code, model) {
  try {
    const conn = new RouterOSAPI({
      host: mikrotikHost,
      user: 'API_ARNOP',
      password: strapi.config.get('server.admin.mikrotik.secret', 'null'),
      port: 8087
    })
    await conn.connect()
    if (model === 1) {
      // eslint-disable-next-line no-unused-vars
      var com1 = await conn.write('/ppp/secret/print', [
        '=.proplist=comment',
        '?=name=' + code
      ])
    } else {
      // eslint-disable-next-line no-redeclare
      var com1 = await conn.write('/ppp/secret/print', [
        '=.proplist=comment',
        '?=name=' + dni
      ])
    }
    conn.close()
    return com1[0]
  } catch (error) {
    conn.close()
    return error
  }
}
module.exports.mkSetComment = async function (mikrotikHost, dni, code, model, comment) {
  const conn = new RouterOSAPI({
    host: mikrotikHost,
    user: 'API_ARNOP',
    password: strapi.config.get('server.admin.mikrotik.secret', 'null'),
    port: 8087
  })
  await conn.connect()
  if (comment !== '' && comment != '0' && comment != null && comment != 'null') {
    console.log(typeof comment)
    if (model === 1) {
      // eslint-disable-next-line no-unused-vars
      var com1 = await conn.write('/ppp/secret/set', [
        '=.id=' + code,
        '=comment=' + comment
      ])
    } else {
      // eslint-disable-next-line no-redeclare
      var com1 = await conn.write('/ppp/secret/set', [
        '=.id=' + dni,
        '=comment=' + comment
      ])
    }
  } else {
    conn.close()
    return true
  }
  conn.close()
  if (com1.length > 0){
    return true
  } else {
    return false
  }
}