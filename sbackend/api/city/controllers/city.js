'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const RouterOSAPI = require('node-routeros').RouterOSAPI
const { mkGetMikrotikInfo } = require('../../../mikrotik/functions');
module.exports = {
  async getMikrotikClients(ctx) {
    const cityQuery = await strapi.services.city.findOne({ _id: ctx.query._city });
    const cityIpArray = cityQuery.mikrotiks[0].ip
    const conn = new RouterOSAPI({
      host: cityIpArray,
      user: 'API_ARNOP',
      password: strapi.config.get('server.admin.mikrotik.secret', 'null'),
      port: 8087
    })
    await conn.connect()
    const result2 = await conn.write('/ppp/secret/print', [
      '=.proplist=name,comment',
    ])
    conn.close()
    return result2
  },
  async getActiveClients(ctx) {
    const cityQuery = await strapi.services.city.findOne({ _id: ctx.query.city });
    const cityIpArray = cityQuery.mikrotiks
    if (cityIpArray.length > 1) {
      const cityActiveClients = []
      for (let i = 0; i < cityIpArray.length; i++) {
        const conn = new RouterOSAPI({
          host: cityIpArray[i].ip,
          user: 'API_ARNOP',
          password: strapi.config.get('server.admin.mikrotik.secret', 'null'),
          port: 8087
        })
        await conn.connect()
        const result = await conn.write('/ppp/active/print', [
          '=.proplist=name',
        ])
        conn.close()
        cityActiveClients.push(result)
      }
      return cityActiveClients[0].concat(cityActiveClients[1])
    } else {
      const conn = new RouterOSAPI({
        host: cityIpArray[0].ip,
        user: 'API_ARNOP',
        password: strapi.config.get('server.admin.mikrotik.secret', 'null'),
        port: 8087
      })
      await conn.connect()
      const result2 = await conn.write('/ppp/active/print', [
        '=.proplist=name',
      ])
      conn.close()
      return result2
    }

  },
  async getMikrotikStatus(ctx) {
    const city = ctx.query.city
    const searchCity = await strapi.services.city.find({ id: city })
    const mikrotiks = searchCity[0].mikrotiks
    const ipList = await mikrotiks.map((mikrotik) => {
      return mikrotik.ip
    })
    return await Promise.all(
      ipList.map(async (ip) => {
        const res = await mkGetMikrotikInfo(ip)
        const mikrotikSearch = await strapi.services.mikrotik.find({ 'name': res.name })
        const actualMikrotik = mikrotikSearch[0].id
        const update = await strapi.services.mikrotik.update({ 'id': String(actualMikrotik)}, res)
        return update
      })
    )
  }
};
