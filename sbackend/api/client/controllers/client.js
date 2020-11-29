'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const RouterOSAPI = require('node-routeros').RouterOSAPI
module.exports = {
  async count(ctx) {
    return await strapi.services.client.count({city: ctx.query._city});
  },
  async countActive(ctx) {
    return await strapi.services.client.count({city: ctx.query._city, active: true});
  },
  async countDisable(ctx) {
    return await strapi.services.client.count({ city: ctx.query._city, active: false } )
  },
  async searchClient (ctx) {
    const search = ctx.query._search
    const city = ctx.query._city
    if (search) {
      const neighborhood = await strapi.services.neighborhood.find({'name': { $regex: new RegExp(search, 'i') }})
      return await strapi.services.client.findClient({
        $or:[
          {'code':{ $regex: new RegExp(search, 'i') }},
          {'name':{ $regex: new RegExp(search, 'i') }},
          {'address':{ $regex: new RegExp(search, 'i') }},
          {'neighborhood': neighborhood._id},
          {'dni':{ $regex: new RegExp(search, 'i') }},
          {'phone':{ $regex: new RegExp(search, 'i') }}
        ]
      })
    } else {
      return [{init: 'initial request'}]
    }
  },
  async getClientStatus(ctx) {
    const search = await strapi.services.client.findOne({ _id: ctx.query._id })
    const currentHost = search.city.ip
    const code = search.code
    const dni = search.dni
    const model = search.newModel
    const conn = new RouterOSAPI({
      host: currentHost,
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
          '?=name='+code,
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
          '?=name='+dni,
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
        if (model === 1) {
          var com3 = await conn.write('/ppp/secret/print', [
            '=.proplist=last-logged-out',
            '?=name='+code,
          ])
        } else {
          // eslint-disable-next-line no-redeclare
          var com3 = await conn.write('/ppp/secret/print', [
            '=.proplist=last-logged-out',
            '?=name='+dni,
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
  },
};
