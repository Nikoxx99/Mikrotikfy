'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const RouterOSAPI = require('node-routeros').RouterOSAPI
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
};
