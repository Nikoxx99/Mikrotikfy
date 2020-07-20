/* eslint-disable no-undef */
const RouterOSAPI = require('node-routeros').RouterOSAPI
module.exports.mkCreateClient = async function (input) {
  const conn = new RouterOSAPI({
    host: input.newCity[0].ip,
    user: 'API_ARNOP',
    password: 'weare991010rootnortetv',
    port: 8087
  })
  const comment = `CODIGO: ${input.code} NOMBRE: ${input.name} CEDULA: ${input.dni} DIRECCION: ${input.address} BARRIO: ${input.newNeighborhood[0].name} CIUDAD: ${input.newCity[0].name} TELEFONO: ${input.phone} PLAN: ${input.newPlan[0].name} SSID: ${input.wifi_ssid} CLAVE: ${input.wifi_password} TECNOLOGIA: ${input.newTechnology[0].name} MAC: ${input.mac_address} COMENTARIO: ${input.comment} OPERADOR: ${input.operator}
  `
  await conn.connect().then(() => {
    console.log('Connected Successfully >>>')
  }).then(() => {
    conn.write('/ppp/secret/add', [
      '=name='+input.code,
      '=password=MAR'+input.code,
      '=profile='+input.newPlan[0].mikrotik_name,
      '=service=pppoe',
      '=comment='+comment,
    ]).then(() => {
      conn.close()
    })
  }).catch((err) => {
    console.log(err)
    conn.close()
  })
}