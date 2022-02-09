'use strict';

/**
 * A set of functions called "actions" for `admincreate`
 */
const { mkCreateClient } = require('../../../mikrotik/mkCreateClient');
const { simpleTelegramAdminCreate } = require('../../../mikrotik/telegram');
module.exports = {
  async adminCreate(ctx) {
    const client = ctx.request.body.data
    const id = client.id
    await strapi.service('api::client.client').update(id, { data: {'active': true }})
    const searchCity = await strapi.service('api::city.city').findOne(client.city.id, {populate: 'mikrotiks'})
    const telegrambot = await strapi.service('api::telegrambot.telegrambot').find({city: client.city.id})
    simpleTelegramAdminCreate(client, telegrambot.results[0], client.operator)
    if (searchCity.mikrotiks.length > 1) {
      for (let i = 0; i < searchCity.mikrotiks.length; i++) {
        const mikrotikHost = searchCity.mikrotiks[i].ip
        mkCreateClient(mikrotikHost, client)
      }
    } else {
      const mikrotikHost = searchCity.mikrotiks[i].ip
      mkCreateClient(mikrotikHost, client)
      return true
    }
    return true
  }
};