'use strict';

/**
 * A set of functions called "actions" for `clientcomment`
 */
const { mkSetComment } = require('../../../mikrotik/mkSetComment')
module.exports = {
  async setclientcomment(ctx) {
    const client = ctx.request.body
    console.log(client)
    return
    const search = await strapi.service('api::client.client').find({
      filters: {
        code: client.code,
        city: {
          name: {
            $eq: client.city.name
          }
        }
      }, populate: ['city', 'city.mikrotiks']})
    const kick = input.dxKick
    if (searchCity.mikrotiks.length > 1) {
      for (let i = 0; i < searchCity.mikrotiks.length; i++) {
        const cityIp = searchCity.mikrotiks[i].ip
        const res = await strapi.service('api::client.client').update(clientObj.id, { data: {plan: input.dxPlan.id }})
        const resMk = await mkDxClient({ dni, code, cityIp, model, planDxMk, kick })
        if (res && resMk) {
          process.push({ code: code, name: clientObj.name, success: true })
        } else {
          process.push({ code: code, name: clientObj.name, success: false })
        }
      }
      return process
    } else {
      const cityIp = searchCity.mikrotiks[0].ip
      const res = await strapi.service('api::client.client').update(clientObj.id, { data: {plan: planDx.id }})
      const resMk = await mkDxClient({ dni, code, cityIp, model, planDxMk, kick })
      if (res && resMk) {
        process.push({ code: code, name: clientObj.name, success: true })
      } else {
        process.push({ code: code, name: clientObj.name, success: false })
      }
      return process
    }
  },
};
module.exports.createComment = async function (client) {
  const newComment = `${client.code} ${client.technology.name} ${client.neighborhood.name} ${client.address} ${client.name} ${client.dni} ${client.phone} ${client.plan.name} ${client.mac_address} NAP-ONU: ${client.nap_onu_address} POTENCIA: ${client.opticalPower} ${client.wifi_ssid} ${client.wifi_password}`;
  return newComment;
};
