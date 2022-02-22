export default (_, inject) => {
  inject('simpleTelegramCreate', input => simpleTelegramCreate(input))
  inject('simpleTelegramUpdate', input => simpleTelegramUpdate(input))
  inject('simpleTelegramUpdatePlan', input => simpleTelegramUpdatePlan(input))
}

function simpleTelegramCreate ({ client, operator, telegramBots }) {
  const fetch = require('node-fetch')
  try {
    const bot = telegramBots.token
    const chatid = telegramBots.log
    const message = `CREADO\n${client.code}\n${client.name}\n${client.dni}\n${client.address}\n${client.phone}\n${client.wifi_ssid}\n${client.wifi_password}\n${operator}\n${client.createdAt}`
    const req =
      'https://api.telegram.org/bot' +
      bot +
      '/sendMessage?chat_id=' +
      chatid +
      '&text=' +
      encodeURIComponent(sanitizeString(message))
    fetch(req)
      .catch(function (err) {
        return err
      })
  } catch (error) {
    return error
  }
};

function simpleTelegramUpdate ({ client, operator, telegramBots }) {
  const fetch = require('node-fetch')
  const bot = telegramBots.token
  const chatid = telegramBots.log
  const message = `ACTUALIZADO\n${client.code}\n${client.name}\n${client.dni}\n${client.address}\n${client.neighborhood.name}\n${client.phone}\n${client.city.name}\n${client.plan.name}\n${client.wifi_ssid}\n${client.wifi_password}\n${client.technology.name}\nNAP-ONU: ${client.nap_onu_address}\nPOTENCIA: ${client.opticalPower}dBm\n${operator}\n${client.createdAt}`
  const req =
    'https://api.telegram.org/bot' +
    bot +
    '/sendMessage?chat_id=' +
    chatid +
    '&text=' +
    encodeURIComponent(sanitizeString(message))
  fetch(req)
    .catch(function (err) {
      return err
    })
};

function simpleTelegramUpdatePlan ({ client, operator, isRx, telegramBots }) {
  const fetch = require('node-fetch')
  const bot = telegramBots.token
  const chatid = telegramBots.binnacle
  let line1 = ''
  if (isRx) {
    line1 = 'RECONEXIÓN'
  } else {
    line1 = 'CAMBIO DE PLAN'
  }
  const line2 = client.code
  const line3 = client.name
  const line4 = client.plan.name
  const line5 = operator
  const message = `${line1}\n${line2}\n${line3}\n${line4}\n${line5}`
  const req =
    'https://api.telegram.org/bot' +
    bot +
    '/sendMessage?chat_id=' +
    chatid +
    '&text=' +
    encodeURIComponent(sanitizeString(message))
  fetch(req)
    .catch(function (err) {
      return err
    })
};

function sanitizeString (str) {
  const res1 = str.normalize('NFD').replace(/[\u0300-\u036F]/g, '')
  const res2 = res1.replace(/[^a-z0-9áéíóúñü \n@ñ,_-]/gim, '')
  return res2
}
