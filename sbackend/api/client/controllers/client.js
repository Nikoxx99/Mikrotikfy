'use strict';
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require('strapi-utils');
const RouterOSAPI = require('node-routeros').RouterOSAPI
const { mkCreateClient, mkDeleteClient, mkSetClientPlanInformation, mkClientStatus, mkActiveClientCount, mkGetComment, mkSetComment, mkDxClient, simpleTelegramCreate, simpleTelegramAdminCreate, mkGetSecrets, simpleTelegramDelete, simpleTelegramUpdate, simpleTelegramUpdatePlan, createComment } = require('../../../mikrotik/functions');
module.exports = {
  async create(ctx) {
    const sendToMikrotik = ctx.request.body.sendToMikrotik
    const operator_role = ctx.request.body.operator_role
    if (operator_role === 'superadmin') {
      let entity;
      
      let request = []
      request[0] = ctx.request.body
      const newClient = request.map(c => {
        c.active = true
        return c
      })

      entity = await strapi.services.client.create(newClient[0]);
      
      const telegrambot = await strapi.services.telegrambot.find({city: entity.city.id})

      simpleTelegramCreate(entity, telegrambot[0])
      if (sendToMikrotik) {
        const searchCity = await strapi.services.city.find({ id: ctx.request.body.city })
        const searchPlan = await strapi.services.plan.find({ id: ctx.request.body.plan })
        const searchNeighborhood = await strapi.services.neighborhood.find({ id: ctx.request.body.neighborhood })
        const searchTechnology = await strapi.services.technology.find({ id: ctx.request.body.technology })
        if (searchCity[0].mikrotiks.length > 1) {
          for (let i = 0; i < searchCity[0].mikrotiks.length; i++) {
            const mikrotikHost = searchCity[0].mikrotiks[i].ip
            const plan = searchPlan[0].mikrotik_name
            const planName = searchPlan[0].name
            const cityName = searchCity[0].name
            const neighborhoodName = searchNeighborhood[0].name
            const technologyName = searchTechnology[0].name
            mkCreateClient(mikrotikHost, plan, ctx.request.body, cityName, planName, neighborhoodName, technologyName)
          }
        } else {
          const searchCity = await strapi.services.city.find({ id: ctx.request.body.city })
          const searchPlan = await strapi.services.plan.find({ id: ctx.request.body.plan })
          const searchNeighborhood = await strapi.services.neighborhood.find({ id: ctx.request.body.neighborhood })
          const searchTechnology = await strapi.services.technology.find({ id: ctx.request.body.technology })
          const mikrotikHost = searchCity[0].mikrotiks[0].ip
          const plan = searchPlan[0].mikrotik_name
          const planName = searchPlan[0].name
          const cityName = searchCity[0].name
          const neighborhoodName = searchNeighborhood[0].name
          const technologyName = searchTechnology[0].name
          mkCreateClient(mikrotikHost, plan, ctx.request.body, cityName, planName, neighborhoodName, technologyName)
        }
      }
      return sanitizeEntity(entity, { model: strapi.models.client });
    } else {
      let entity;
      entity = await strapi.services.client.create(ctx.request.body);
      simpleTelegramCreate(entity)
      return sanitizeEntity(entity, { model: strapi.models.client });
    }
  },
  async adminCreate(ctx) {
    const id = ctx.request.body.input.id
    const entity = await strapi.services.client.update({ id }, { 'active': true })
    const searchCity = await strapi.services.city.find({ id: ctx.request.body.input.city })
    const searchPlan = await strapi.services.plan.find({ id: ctx.request.body.input.plan })
    const searchNeighborhood = await strapi.services.neighborhood.find({ id: ctx.request.body.input.neighborhood })
    const searchTechnology = await strapi.services.technology.find({ id: ctx.request.body.input.technology })
    const telegrambot = await strapi.services.telegrambot.find({city: ctx.request.body.input.city})
    simpleTelegramAdminCreate(entity, telegrambot[0])
    if (searchCity[0].mikrotiks.length > 1) {
      for (let i = 0; i < searchCity[0].mikrotiks.length; i++) {
        const mikrotikHost = searchCity[0].mikrotiks[i].ip
        const plan = searchPlan[0].mikrotik_name
        const planName = searchPlan[0].name
        const cityName = searchCity[0].name
        const neighborhoodName = searchNeighborhood[0].name
        const technologyName = searchTechnology[0].name
        mkCreateClient(mikrotikHost, plan, ctx.request.body.input, cityName, planName, neighborhoodName, technologyName)
      }
    } else {
      const mikrotikHost = searchCity[0].mikrotiks[0].ip
      const plan = searchPlan[0].mikrotik_name
      const planName = searchPlan[0].name
      const cityName = searchCity[0].name
      const neighborhoodName = searchNeighborhood[0].name
      const technologyName = searchTechnology[0].name
      mkCreateClient(mikrotikHost, plan, ctx.request.body.input, cityName, planName, neighborhoodName, technologyName)
      return true
    }
    return true
  },
  async adminCreateFromRequest(ctx) {
    const id = ctx.request.body.input.id
    const id_client = ctx.request.body.input.client.id
    const entity = await strapi.services.client.update({ id: id_client }, { 'active': true })
    const approvedBy = ctx.request.body.input.client.operator
    await strapi.services.activationrequest.update({ id }, { 'active': false })
    const searchCity = await strapi.services.city.find({ id: ctx.request.body.input.client.city })
    const searchPlan = await strapi.services.plan.find({ id: ctx.request.body.input.client.plan })
    const searchNeighborhood = await strapi.services.neighborhood.find({ id: ctx.request.body.input.client.neighborhood })
    const searchTechnology = await strapi.services.technology.find({ id: ctx.request.body.input.client.technology })
    const telegrambot = await strapi.services.telegrambot.find({city: ctx.request.body.input.client.city})
    simpleTelegramAdminCreate(entity, telegrambot[0], approvedBy)
    if (searchCity[0].mikrotiks.length > 1) {
      for (let i = 0; i < searchCity[0].mikrotiks.length; i++) {
        const mikrotikHost = searchCity[0].mikrotiks[i].ip
        const plan = searchPlan[0].mikrotik_name
        const planName = searchPlan[0].name
        const cityName = searchCity[0].name
        const neighborhoodName = searchNeighborhood[0].name
        const technologyName = searchTechnology[0].name
        mkCreateClient(mikrotikHost, plan, ctx.request.body.input.client, cityName, planName, neighborhoodName, technologyName)
      }
    } else {
      const mikrotikHost = searchCity[0].mikrotiks[0].ip
      const plan = searchPlan[0].mikrotik_name
      const planName = searchPlan[0].name
      const cityName = searchCity[0].name
      const neighborhoodName = searchNeighborhood[0].name
      const technologyName = searchTechnology[0].name
      mkCreateClient(mikrotikHost, plan, ctx.request.body.input.client, cityName, planName, neighborhoodName, technologyName)
      return true
    }
    return true
  },
  async update(ctx) {
    const { id } = ctx.params;
    let entity, history;
    entity = await strapi.services.client.update({ id }, ctx.request.body)
    const telegrambot = await strapi.services.telegrambot.find({city: entity.city.id})
    simpleTelegramUpdate(entity, telegrambot[0])
    await strapi.services.history.create(ctx.request.body)
    const search = await strapi.services.client.find({ _id: id })
    const searchCity = await strapi.services.city.find({ id: search[0].city.id })
    const clientObj = search[0]
    const dni = clientObj.dni
    const code = clientObj.code
    const model = clientObj.newModel
    const comment = await createComment(clientObj)
    if (searchCity[0].mikrotiks.length > 1) {
      const successfulMikrotikResponses = []
      for (let i = 0; i < searchCity[0].mikrotiks.length; i++) {
        const mikrotikHost = searchCity[0].mikrotiks[i].ip
        const res = await mkSetComment(mikrotikHost, dni, code, model, comment)
        successfulMikrotikResponses.push(res)
      }
    } else {
      const mikrotikHost = searchCity[0].mikrotiks[0].ip
      await mkSetComment(mikrotikHost, dni, code, model, comment)
    }
    const res = sanitizeEntity(entity, { model: strapi.models.client })
    return res
  },
  async setClientComment(ctx) {
    const { clientid, comment } = ctx.request.body
    const search = await strapi.services.client.find({ _id: clientid })
    const searchCity = await strapi.services.city.find({ id: search[0].city.id })
    const clientObj = search[0]
    const dni = clientObj.dni
    const code = clientObj.code
    const model = clientObj.newModel
    if (searchCity[0].mikrotiks.length > 1) {
      for (let i = 0; i < searchCity[0].mikrotiks.length; i++) {
        const mikrotikHost = searchCity[0].mikrotiks[i].ip
        await mkSetComment(mikrotikHost, dni, code, model, comment)
        if (searchCity[0].mikrotiks.length - 1 === i) {
          return true
        }
      }
    } else {
      const mikrotikHost = searchCity[0].mikrotiks[0].ip
      await mkSetComment(mikrotikHost, dni, code, model, comment)
      return true
    }
  },
  async delete(ctx) {
    const { id } = ctx.params;
    const search = await strapi.services.client.find({ _id: id })
    const searchCity = await strapi.services.city.find({ id: search[0].city.id })
    const clientObj = search[0]
    const dni = clientObj.dni
    const code = clientObj.code
    const model = clientObj.newModel
    if (searchCity[0].mikrotiks.length > 1) {
      const successfulMikrotikResponses = []
      for (let i = 0; i < searchCity[0].mikrotiks.length; i++) {
        const mikrotikHost = searchCity[0].mikrotiks[i].ip
        const res = await mkDeleteClient(mikrotikHost, dni, code, model)
        successfulMikrotikResponses.push(res)
      }
    } else {
      const mikrotikHost = searchCity[0].mikrotiks[0].ip
      await mkDeleteClient(mikrotikHost, dni, code, model)
    }
    const entity = await strapi.services.client.delete({ id });
    await strapi.services.activationrequest.delete({ client: id });
    const telegrambot = await strapi.services.telegrambot.find({city: entity.city.id})
    simpleTelegramDelete(entity, telegrambot[0])
    return sanitizeEntity(entity, { model: strapi.models.client });
  },
  async adminDelete(ctx) {
    const { id } = ctx.request.body.input
    await strapi.services.client.update({ id }, { 'active': false });
    const search = await strapi.services.client.find({ _id: id })
    const searchCity = await strapi.services.city.find({ id: search[0].city.id })
    const clientObj = search[0]
    const dni = clientObj.dni
    const code = clientObj.code
    const model = clientObj.newModel
    if (searchCity[0].mikrotiks.length > 1) {
      const successfulMikrotikResponses = []
      for (let i = 0; i < searchCity[0].mikrotiks.length; i++) {
        const mikrotikHost = searchCity[0].mikrotiks[i].ip
        const res = await mkDeleteClient(mikrotikHost, dni, code, model)
        successfulMikrotikResponses.push(res)
      }
    } else {
      const mikrotikHost = searchCity[0].mikrotiks[0].ip
      await mkDeleteClient(mikrotikHost, dni, code, model)
      return true
    }
    return true
  },
  async adminDeleteFromRequest(ctx) {
    const { id } = ctx.request.body.input
    const id_client = ctx.request.body.input.client.id
    await strapi.services.client.update({ id: id_client }, { 'active': false });
    await strapi.services.activationrequest.update({ id }, { 'active': true })
    const search = await strapi.services.client.find({ _id: id_client })
    const searchCity = await strapi.services.city.find({ id: search[0].city.id })
    const clientObj = search[0]
    const dni = clientObj.dni
    const code = clientObj.code
    const model = clientObj.newModel
    if (searchCity[0].mikrotiks.length > 1) {
      const successfulMikrotikResponses = []
      for (let i = 0; i < searchCity[0].mikrotiks.length; i++) {
        const mikrotikHost = searchCity[0].mikrotiks[i].ip
        const res = await mkDeleteClient(mikrotikHost, dni, code, model)
        successfulMikrotikResponses.push(res)
      }
    } else {
      const mikrotikHost = searchCity[0].mikrotiks[0].ip
      await mkDeleteClient(mikrotikHost, dni, code, model)
      return true
    }
    return true
  },
  async count(ctx) {
    return await strapi.services.client.count({ city: ctx.query._city })
  },
  async countActive(ctx) {
    const mb3 = await strapi.services.client.count({ city: ctx.query._city, plan: '5f52a7232824f015ac8ceb5a' })
    const mb4 = await strapi.services.client.count({ city: ctx.query._city, plan: '5f52a73c2824f015ac8ceb5c' })
    const mb4lte = await strapi.services.client.count({ city: ctx.query._city, plan: '60116a1396f2053b1bbc3e09' })
    const mb6 = await strapi.services.client.count({ city: ctx.query._city, plan: '5f52a7442824f015ac8ceb5d' })
    const mb8 = await strapi.services.client.count({ city: ctx.query._city, plan: '5f52a6fe2824f015ac8ceb58' })
    const mb10 = await strapi.services.client.count({ city: ctx.query._city, plan: '5f52a70a2824f015ac8ceb59' })
    const mb100 = await strapi.services.client.count({ city: ctx.query._city, plan: '5f52a72d2824f015ac8ceb5b' })
    return mb3 + mb4 + mb4lte + mb6 + mb8 + mb10 + mb100
  },
  async countDisable(ctx) {
    return await strapi.services.client.count({ city: ctx.query._city, plan: '5f52a7572824f015ac8ceb5e' })
  },
  async countRetired(ctx) {
    return await strapi.services.client.count({ city: ctx.query._city, plan: '5f52a75f2824f015ac8ceb5f' })
  },
  async refreshClientData (ctx) {
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
      var active = cityActiveClients[0].concat(cityActiveClients[1])
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
      var active = result2
    }

    const count = await strapi.services.client.count({ city: ctx.query.city });
    const mb3 = await strapi.services.client.count({ city: ctx.query.city, plan: '5f52a7232824f015ac8ceb5a' })
    const mb4 = await strapi.services.client.count({ city: ctx.query.city, plan: '5f52a73c2824f015ac8ceb5c' })
    const mb4lte = await strapi.services.client.count({ city: ctx.query.city, plan: '60116a1396f2053b1bbc3e09' })
    const mb6 = await strapi.services.client.count({ city: ctx.query.city, plan: '5f52a7442824f015ac8ceb5d' })
    const mb8 = await strapi.services.client.count({ city: ctx.query.city, plan: '5f52a6fe2824f015ac8ceb58' })
    const mb10 = await strapi.services.client.count({ city: ctx.query.city, plan: '5f52a70a2824f015ac8ceb59' })
    const mb100 = await strapi.services.client.count({ city: ctx.query.city, plan: '5f52a72d2824f015ac8ceb5b' })
    const countActive = mb3 + mb4 + mb4lte + mb6 + mb8 + mb10 + mb100
    const countDisable = await strapi.services.client.count({ city: ctx.query.city, plan: '5f52a7572824f015ac8ceb5e' })
    const countRetired = await strapi.services.client.count({ city: ctx.query.city, plan: '5f52a75f2824f015ac8ceb5f' })
    const activeRes = await strapi.services.static.update({ 'name': 'active', 'city': ctx.query.city}, {'data': String(active.length)})
    const countRes = await strapi.services.static.update({ 'name': 'count', 'city': ctx.query.city}, {'data': String(count)})
    const countActiveRes = await strapi.services.static.update({ 'name': 'countActive', 'city': ctx.query.city }, {'data': String(countActive)})
    const countDisableRes = await strapi.services.static.update({ 'name': 'countDisable', 'city': ctx.query.city }, {'data': String(countDisable)})
    const countRetiredRes = await strapi.services.static.update({ 'name': 'countRetired', 'city': ctx.query.city }, {'data': String(countRetired)})
    return activeRes + countRes + countActiveRes + countDisableRes + countRetiredRes
  },
  async getClientComment(ctx) {
    const id = ctx.query.id
    const search = await strapi.services.client.find({ _id: id })
    const searchCity = await strapi.services.city.find({ id: search[0].city.id })
    const clientObj = search[0]
    const code = clientObj.code
    const dni = clientObj.dni
    const model = clientObj.newModel

    if (searchCity[0].mikrotiks.length > 1) {
      const successfulMikrotikResponses = []
      for (let i = 0; i < searchCity[0].mikrotiks.length; i++) {
        const mikrotikHost = searchCity[0].mikrotiks[i].ip
        const res = await mkGetComment(mikrotikHost, dni, code, model)
        successfulMikrotikResponses.push(res)
      }
      return successfulMikrotikResponses[0]
    } else {
      const mikrotikHost = searchCity[0].mikrotiks[0].ip
      const res = await mkGetComment(mikrotikHost, dni, code, model)
      return res
    }
  },
  async getClientSecrets(ctx) {
    const city = ctx.query._city
    const search = await strapi.services.city.find({ _id: city })
    const searchCity = await strapi.services.city.find({ id: search[0].city.id })

    if (searchCity[0].mikrotiks.length > 1) {
      const successfulMikrotikResponses = []
      for (let i = 0; i < searchCity[0].mikrotiks.length; i++) {
        const mikrotikHost = searchCity[0].mikrotiks[i].ip
        const res = await mkGetSecrets(mikrotikHost)
        successfulMikrotikResponses.push(res)
      }
      let secretArray = []
      await successfulMikrotikResponses[0].map((s) => {
        if (s['last-caller-id']){
          s.mac_address = s['last-caller-id']
          secretArray.push(s)
        }
      })
      return secretArray
    } else {
      let secretArray = []
      const mikrotikHost = searchCity[0].mikrotiks[0].ip
      const res = await mkGetSecrets(mikrotikHost)
      await res.map((s) => {
        if (s['last-caller-id']){
          s.mac_address = s['last-caller-id']
          secretArray.push(s)
        }
      })
      return secretArray
    }
  },
  async searchClient(ctx) {
    const search = ctx.query.search
    const city = ctx.query.city
    if (search) {
      const neighborhood = await strapi.services.neighborhood.find({ 'name': { $regex: new RegExp(search, 'i') } })
      if (neighborhood.length > 0) {
        const res = await strapi.services.client.find({
          $or: [
            { 'city': city, 'code': { $regex: new RegExp(search, 'i') } },
            { 'city': city, 'name': { $regex: new RegExp(search, 'i') } },
            { 'city': city, 'address': { $regex: new RegExp(search, 'i') } },
            { 'city': city, 'neighborhood': neighborhood[0]._id },
            { 'city': city, 'dni': { $regex: new RegExp(search, 'i') } },
            { 'city': city, 'phone': { $regex: new RegExp(search, 'i') } }
          ]
        })
        const n = res.map(entity => sanitizeEntity(entity, { model: strapi.models.client }));
        return n
      } else {
        const res = await strapi.services.client.find({
          $or: [
            { 'city': city, 'code': { $regex: new RegExp(search, 'i') } },
            { 'city': city, 'name': { $regex: new RegExp(search, 'i') } },
            { 'city': city, 'address': { $regex: new RegExp(search, 'i') } },
            { 'city': city, 'dni': { $regex: new RegExp(search, 'i') } },
            { 'city': city, 'phone': { $regex: new RegExp(search, 'i') } }
          ]
        })
        const n = res.map(entity => sanitizeEntity(entity, { model: strapi.models.client }));
        return n
      }
    } else {
      return [{ init: 'initial request' }]
    }
  },
  async editClientPlan(ctx) {
    const id = ctx.request.body.id
    const newClientPlanSearch = ctx.request.body.plan
    const isRx = ctx.request.body.isRx
    const operator = ctx.request.body.operator
    const searchPlan = await strapi.services.plan.find({ _id: newClientPlanSearch })
    const newClientPlan = searchPlan[0].mikrotik_name
    const search = await strapi.services.client.find({ _id: id })
    const searchCity = await strapi.services.city.find({ id: search[0].city.id })
    const clientObj = search[0]
    const dni = clientObj.dni
    const code = clientObj.code
    const model = clientObj.newModel
    const removeActive = true
    const successfulMikrotikResponses = []
    const entity = await strapi.services.client.update({ id }, { plan: newClientPlanSearch })
    const telegrambot = await strapi.services.telegrambot.find({city: entity.city.id})
    simpleTelegramUpdatePlan(entity, operator, isRx, telegrambot[0])
    // console.log(clientObj)
    // await strapi.services.history.create(clientObj);
    if (searchCity[0].mikrotiks.length > 1) {
      //for loop
      for (let i = 0; i < searchCity[0].mikrotiks.length; i++) {
        const mikrotikHost = searchCity[0].mikrotiks[i].ip
        const res = await mkSetClientPlanInformation(mikrotikHost, { newClientPlan, dni, code, model, removeActive })
        successfulMikrotikResponses.push(res)
      }
      //INPROVE: detect if the array elements are true or false
      if (successfulMikrotikResponses.length === searchCity[0].mikrotiks.length) {
        return true
      } else {
        return false
      }
    } else {
      //normal req
      const mikrotikHost = searchCity[0].mikrotiks[0].ip
      const res = await mkSetClientPlanInformation(mikrotikHost, { newClientPlan, dni, code, model, removeActive })
      if (res) {
        return true
      } else {
        return false
      }
    }
  },
  async getClientStatus(ctx) {
    const searchClient = await strapi.services.client.findOne({ id: ctx.query.id })
    const searchCity = await strapi.services.city.find({ id: searchClient.city.id })
    const mikrotiks = searchCity[0].mikrotiks
    const ipList = await mikrotiks.map((mikrotik) => {
      return mikrotik.ip
    })
    const response = await Promise.all(
      ipList.map(async (ip) => {
        return await mkClientStatus(ip, searchClient.code, searchClient.dni, searchClient.newModel)
      })
    )
    if (response) {
      const mkResponse = response.filter(mikrotik => mikrotik.exists === true)
      const onlineRes = mkResponse.filter(mikrotik => mikrotik.online === true)
      if (onlineRes.length > 0) {
        return onlineRes[0]
      } else {
        const goodReponse = mkResponse.filter(client => client.offlineTime !== 'jan/01/1970 00:00:00')
        let mostRecentDate = new Date(Math.max.apply(null, goodReponse.map( e => {
          return new Date(e.offlineTime);
        })));
        let mostRecentClient = goodReponse.filter( e => { 
            const d = new Date( e.offlineTime ); 
            return d.getTime() == mostRecentDate.getTime();
        })[0];
        return mostRecentClient
      }
    } else {
      return response[0]
    }
  },
  async dxClient(ctx) {
    const process = []
    const input = ctx.request.body.input
    const search = await strapi.services.client.findOne({ 'code': input.dx.code, 'city': input.dxCity })
    const searchCity = await strapi.services.city.find({ id: search[0].city.id })
    const clientObj = search
    const code = clientObj.code
    if (search.length < 1) {
      process.push({ code: input.dx.code, name: 'NO ENCONTRADO', success: false })
      return process
    }
    const dni = clientObj.dni
    const model = clientObj.newModel
    const planDx = input.dxPlan.id
    const planDxMk = input.dxPlan.name
    const kick = input.dxKick
    if (searchCity[0].mikrotiks.length > 1) {
      for (let i = 0; i < searchCity[0].mikrotiks.length; i++) {
        const cityIp = searchCity[0].mikrotiks[i].ip
        const res = await strapi.services.client.update({ _id: clientObj._id }, { plan: planDx })
        const resMk = await mkDxClient({ dni, code, cityIp, model, planDxMk, kick })
        if (res && resMk) {
          process.push({ code: code, name: clientObj.name, success: true })
        } else {
          process.push({ code: code, name: clientObj.name, success: false })
        }
      }
      return process
    } else {
      const cityIp = searchCity[0].mikrotiks[0].ip
      const res = await strapi.services.client.update({ _id: clientObj._id }, { plan: planDx })
      const resMk = await mkDxClient({ dni, code, cityIp, model, planDxMk, kick })
      if (res && resMk) {
        process.push({ code: code, name: clientObj.name, success: true })
      } else {
        process.push({ code: code, name: clientObj.name, success: false })
      }
      return process
    }
  },
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.client.search(ctx.query);
    } else {
      entities = await strapi.services.client.search(ctx.query);
      return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.client }));
    }

  },
};
