/* eslint-disable no-undef */
const RouterOSAPI = require('node-routeros').RouterOSAPI
function removePunctuation(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}
module.exports.mkCreateClient = async function (mikrotikHost, plan, input, cityName, planName, neightborhood, technology) {
  const conn = new RouterOSAPI({
    host: mikrotikHost,
    user: 'API_ARNOP',
    password: strapi.config.get('server.admin.mikrotik.secret', 'null'),
    port: 8087
  })
  const comment = `${input.code} ${input.name} ${input.dni} ${input.address} ${neightborhood} ${cityName} ${input.phone} ${planName} ${input.wifi_ssid} ${input.wifi_password} ${technology} ${input.mac_address} ${input.comment}`
  await conn.connect().then(() => {
  }).then(() => {
    conn.write('/ppp/secret/add', [
      '=name=' + input.code,
      '=password=MAR' + input.code,
      '=profile=' + plan,
      '=service=pppoe',
      '=comment=' + comment,
    ]).then(() => {
      conn.close()
    }).catch((err) => {
      conn.close()
      console.log(err)
    })
  }).catch((err) => {
    conn.close()
    console.log(err)
  })
}
module.exports.mkDeleteClient = async function (mikrotikHost, dni, code, model) {
  const conn = new RouterOSAPI({
    host: mikrotikHost,
    user: 'API_ARNOP',
    password: strapi.config.get('server.admin.mikrotik.secret', 'null'),
    port: 8087
  })
  try {
    await conn.connect()
    if (model === 1) {
      var com1 = await conn.write('/ppp/secret/getall', [
        '=.proplist=.id',
        '?=name=' + code,
      ])
      await conn.write('/ppp/secret/remove', [
        '=.id=' + com1[0]['.id']
      ])
      conn.close()
      return true
    } else {
      var com1 = await conn.write('/ppp/secret/getall', [
        '=.proplist=.id',
        '?=name=' + dni,
      ])
      await conn.write('/ppp/secret/remove', [
        '=.id=' + com1[0]['.id']
      ])
      conn.close()
      return true
    }

  } catch (error) {
    conn.close()
    return false
  }
}
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
        '=.proplist=tx-byte,rx-byte,last-link-up-time,last-disconnect-reason,last-caller-id',
        '?=name=<pppoe-' + code + '>',
      ])
      var com2 = await conn.write('/ppp/active/print', [
        '=.proplist=caller-id,uptime,address',
        '?=name=' + code,
      ])
    } else {
      // eslint-disable-next-line no-redeclare
      var com1 = await conn.write('/interface/print', [
        '=.proplist=tx-byte,rx-byte,last-link-up-time,last-disconnect-reason,last-caller-id',
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
      client.disconnectReason = com1[0]['last-disconnect-reason']
      client.lastCallerId = com1[0]['last-caller-id']
      client.address = com2[0]['address']
      client.mac_address = com2[0]['caller-id']
      client.uptime = com2[0].uptime
      conn.close()
      return client
    } else {
      if (model === 1) {
        var com3 = await conn.write('/ppp/secret/print', [
          '=.proplist=last-logged-out,last-disconnect-reason,last-caller-id',
          '?=name=' + code,
        ])
      } else {
        // eslint-disable-next-line no-redeclare
        var com3 = await conn.write('/ppp/secret/print', [
          '=.proplist=last-logged-out,last-disconnect-reason,last-caller-id',
          '?=name=' + dni,
        ])
      }
      if (com3.length > 0) {
        var client_old_mk = {}
        client_old_mk.status = true
        client_old_mk.offlineTime = com3[0]['last-logged-out']
        client_old_mk.disconnectReason = com3[0]['last-disconnect-reason']
        client_old_mk.lastCallerId = com3[0]['last-caller-id']
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
                '=.proplist=tx-byte,rx-byte,last-link-up-time,last-disconnect-reason,last-caller-id',
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
                '=.proplist=tx-byte,rx-byte,last-link-up-time,last-disconnect-reason,last-caller-id',
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
              client.disconnectReason = com1[0]['last-disconnect-reason']
              client.lastCallerId = com1[0]['last-caller-id']
              client.address = com2[0]['address']
              client.mac_address = com2[0]['caller-id']
              client.uptime = com2[0].uptime
              conn.close()
              return client
            } else {
              if (model === 1) {
                // eslint-disable-next-line no-redeclare
                var com3 = await conn.write('/ppp/secret/print', [
                  '=.proplist=last-logged-out,last-disconnect-reason,last-caller-id',
                  '?=name=' + code,
                ])
              } else {
                // eslint-disable-next-line no-redeclare
                var com3 = await conn.write('/ppp/secret/print', [
                  '=.proplist=last-logged-out,last-disconnect-reason,last-caller-id',
                  '?=name=' + dni,
                ])
              }
              if (com3[0]['last-logged-out'] !== 'jan/01/1970 00:00:00') {
                let client = {}
                client.status = true
                client.offlineTime = com3[0]['last-logged-out']
                client.disconnectReason = com3[0]['last-disconnect-reason']
                client.lastCallerId = com3[0]['last-caller-id']
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
    if (model === 1) {
      // eslint-disable-next-line no-unused-vars
      try {
        var com1 = await conn.write('/ppp/secret/set', [
          '=.id=' + code,
          '=comment=' + comment
        ])
      } catch (error) {
        conn.close()
        return error
      }
    } else {
      try {
        // eslint-disable-next-line no-redeclare
        var com1 = await conn.write('/ppp/secret/set', [
          '=.id=' + dni,
          '=comment=' + comment
        ])
      } catch (error) {
        conn.close()
        return error
      }
    }
  } else {
    conn.close()
    return true
  }
  conn.close()
  if (com1.length > 0) {
    return true
  } else {
    return true
  }
}
module.exports.mkDxClient = async function (input) {
  const conn = new RouterOSAPI({
    host: input.cityIp,
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
      if (input.kick === 2) {
        var removeActive = await conn.write('/ppp/active/getall', [
          '=.proplist=.id',
          '?=name=' + input.code,
        ])
      }
    } else {
      // eslint-disable-next-line no-redeclare
      var com1 = await conn.write('/ppp/secret/getall', [
        '=.proplist=.id',
        '?=name=' + input.dni,
      ])
      if (input.kick === 2) {
        // eslint-disable-next-line no-redeclare
        var removeActive = await conn.write('/ppp/active/getall', [
          '=.proplist=.id',
          '?=name=' + input.dni,
        ])
      }
    }
    if (com1.length > 0) {
      await conn.write('/ppp/secret/set', [
        '=.id=' + com1[0]['.id'],
        '=profile=' + input.planDxMk,
      ])
      if (input.kick === 2) {
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
      conn.close()
      return false
    }
  } catch (error) {
    console.log(error)
  }
}
module.exports.simpleTelegramCreate = async function (input) {
  const fetch = require('node-fetch');
  require('dotenv').config()
  const bot = process.env.TELEGRAM_BOT
  const chatid = process.env.CHAT_ID2
  var message = `CREADO\n${input.code}\n${input.name}\n${input.dni}\n${input.address}\n${input.neighborhood.name}\n${input.phone}\n${input.city.name}\n${input.plan.name}\n${input.wifi_ssid}\n${input.wifi_password}\n${input.technology.name}\n${input.mac_address}\n${input.operator.username}\n${input.createdAt}`
  payload = message.replace('#', ' ')
  const req = 'https://api.telegram.org/bot' + bot + '/sendMessage?chat_id=' + chatid + '&text=' + payload
  fetch(req).then(function (response) {
    return true
  }).catch(function (err) {
    console.log(err);
  });
}
module.exports.simpleTelegramUpdate = async function (input) {
  const fetch = require('node-fetch');
  require('dotenv').config()
  const bot = process.env.TELEGRAM_BOT
  const chatid = process.env.CHAT_ID2
  var message = `ACTUALIZADO\n${input.code}\n${input.name}\n${input.dni}\n${input.address}\n${input.neighborhood.name}\n${input.phone}\n${input.city.name}\n${input.plan.name}\n${input.wifi_ssid}\n${input.wifi_password}\n${input.technology.name}\n${input.mac_address}\n${input.operator.username}\n${input.createdAt}`
  payload = message.replace('#', ' ')
  const req = 'https://api.telegram.org/bot' + bot + '/sendMessage?chat_id=' + chatid + '&text=' + payload
  fetch(req).then(function (response) {
    return true
  }).then(function (data) {
    console.log(data);
  }).catch(function () {
    console.log("Booo");
  });
}
module.exports.simpleTelegramUpdatePlan = async function (input, operator) {
  console.log(input)
  const fetch = require('node-fetch');
  require('dotenv').config()
  const bot = process.env.TELEGRAM_BOT
  const chatid = process.env.CHAT_ID2
  const line1 = 'CAMBIO DE PLAN'
  const line2 = input.code
  const line3 = input.name
  const line4 = input.plan.name
  const line5 = operator
  const message = `${line1}\n${line2}\n${line3}\n${line4}\n${line5}`
  const req = 'https://api.telegram.org/bot' + bot + '/sendMessage?chat_id=' + chatid + '&text=' + message
  fetch(req).then(function (response) {
    return true
  }).then(function (data) {
    console.log(data);
  }).catch(function () {
    console.log("Booo");
  });
}
module.exports.simpleTelegramDelete = async function (input) {
  const fetch = require('node-fetch');
  require('dotenv').config()
  const bot = process.env.TELEGRAM_BOT
  const chatid = process.env.CHAT_ID2
  const line1 = 'BORRADO'
  const line2 = input.code
  const line3 = input.name
  const line4 = input.operator.username
  const message = `${line1}\n${line2}\n${line3}\n${line4}`
  const req = 'https://api.telegram.org/bot' + bot + '/sendMessage?chat_id=' + chatid + '&text=' + message
  fetch(req).then(function (response) {
    return true
  }).then(function (data) {
    console.log(data);
  }).catch(function () {
    console.log("Booo");
  });
}
module.exports.simpleTelegramCreateTicket = async function (input) {
  const fetch = require('node-fetch');
  require('dotenv').config()
  const bot = process.env.TELEGRAM_BOT
  const chatid = process.env.CHAT_ID2
  const line1 = 'TICKET'
  const line2 = input.client.code
  const line3 = input.client.name
  const line4 = input.client.address
  const line5 = input.client.phone
  const line6 = input.tickettype.name
  const line7 = input.details
  const line8 = input.assiganted.username
  const line9 = input.createdAt
  const message = `${line1}\n${line2}\n${line3}\n${line4}\n${line5}\n${line6}\n${line7}\n\n${line8}\n${line9}`
  payload = message.replace('#', ' ')
  const req = 'https://api.telegram.org/bot' + bot + '/sendMessage?chat_id=' + chatid + '&text=' + removePunctuation(payload)
  fetch(req).then(function (response) {
    console.log(response)
    return true
  }).then(function (data) {
    console.log(data);
  }).catch(function (err) {
    console.log("Booo", err);
  });
}
module.exports.simpleTelegramCreateTicketAdvance = async function (input, client, tickettype, assiganted) {
  const fetch = require('node-fetch');
  require('dotenv').config()
  const bot = process.env.TELEGRAM_BOT
  const chatid = process.env.CHAT_ID2
  let line1 = ''
  if (!input.ticket.active) {
    line1 = 'TICKET CERRADO'
  } else {
    line1 = 'AVANCE DE TICKET'
  }
  const line2 = client.code
  const line3 = client.name
  const line4 = client.address
  const line5 = client.phone
  const line6 = tickettype.name
  const line7 = input.details
  let line8 = ''
  if (!input.ticket.active) {
    line8 = 'TICKET CERRADO'
  } else {
    line8 = 'TICKET ACTIVO'
  }
  const line9 = assiganted
  const line10 = input.createdAt
  const message = `${line1}\n${line2}\n${line3}\n${line4}\n${line5}\n${line6}\n\n${line7}\n${line8}\n\n${line9}\n${line10}`
  payload = message.replace('#', ' ')
  const req = 'https://api.telegram.org/bot' + bot + '/sendMessage?chat_id=' + chatid + '&text=' + removePunctuation(payload)
  fetch(req).then(function (response) {
    console.log(response)
    return true
  }).then(function (data) {
    console.log(data);
  }).catch(function () {
    console.log("Booo");
  });
}