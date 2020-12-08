'use strict';
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const RouterOSAPI = require('node-routeros').RouterOSAPI
const { mkSetClientPlanInformation } = require('../../../mikrotik/functions')
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
  async editClientPlan(ctx) {
    const id = ctx.request.body.id
    const newClientPlanSearch = ctx.request.body.plan
    const searchPlan = await strapi.services.plan.find({id: newClientPlanSearch})
    const newClientPlan = searchPlan[0].mikrotik_name

    const search = await strapi.services.client.find({id: id})
    const clientObj = search[0]
    const dni = clientObj.dni
    const code = clientObj.code
    const model = clientObj.newModel
    const removeActive = true
    const reqCityIpArray = clientObj.city.ip
    const successfulMikrotikResponses = []

    if (reqCityIpArray.length > 1) {
      //for loop
      for (let i = 0; i < reqCityIpArray.length; i++) {
        const mikrotikHost = reqCityIpArray[i]
        const res = await mkSetClientPlanInformation(mikrotikHost, { newClientPlan, dni, code, model, removeActive })
        successfulMikrotikResponses.push(res)
      }
      //INPROVE: detect if the array elements are true or false
      if (successfulMikrotikResponses.length === reqCityIpArray.length) {
        return true
      } else {
        return false
      }
    } else {
      //normal req
      const mikrotikHost = reqCityIpArray[0]
      const res = await mkSetClientPlanInformation(mikrotikHost, { newClientPlan, dni, code, model, removeActive })
      if (res){
        return true
      } else {
        return false
      }
    }  
  },
  async getClientStatus(ctx) {
    const search = await strapi.services.client.findOne({ id: ctx.query.id })
    const currentHost = search.city.ip[0]
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
          if (currentHost === '191.102.86.50') {
            const conn = new RouterOSAPI({
              host: '191.102.86.54',
              user: 'API_ARNOP',
              password: 'weare991010rootnortetv',
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
  },
};
