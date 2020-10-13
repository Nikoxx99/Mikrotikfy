'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const RouterOSAPI = require('node-routeros').RouterOSAPI
module.exports = {
  async getActiveClients(ctx) {
    const entity = await strapi.services.city.findOne({ _id: ctx.query._city });
    const currentHost = entity.ip
    const conn = new RouterOSAPI({
      host: currentHost,
      user: 'API_ARNOP',
      password: strapi.config.get('server.admin.mikrotik.secret', 'null'),
      port: 8087
    })
    await conn.connect()
    const com1 = await conn.write('/ppp/active/print', [
      '=.proplist=name',
    ])
    conn.close()
    return com1
  },
};
