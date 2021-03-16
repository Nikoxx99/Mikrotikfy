'use strict';
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require('strapi-utils');
const { mkCreateClient, mkDeleteClient, mkSetClientPlanInformation, mkClientStatus, mkGetComment, mkSetComment, mkDxClient, simpleTelegramCreate, simpleTelegramAdminCreate, simpleTelegramDelete, simpleTelegramUpdate, simpleTelegramUpdatePlan, createComment } = require('../../../mikrotik/functions');
module.exports = {
  async create(ctx) {
    const sendToMikrotik = ctx.request.body.sendToMikrotik
    const operator_role = ctx.request.body.operator_role
    if (operator_role === 'admin' || operator_role === 'superadmin') {
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
        if (searchCity[0].ip.length > 1) {
          for (let i = 0; i < searchCity[0].ip.length; i++) {
            const mikrotikHost = searchCity[0].ip[i]
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
          const mikrotikHost = searchCity[0].ip[0]
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
    if (searchCity[0].ip.length > 1) {
      for (let i = 0; i < searchCity[0].ip.length; i++) {
        const mikrotikHost = searchCity[0].ip[i]
        const plan = searchPlan[0].mikrotik_name
        const planName = searchPlan[0].name
        const cityName = searchCity[0].name
        const neighborhoodName = searchNeighborhood[0].name
        const technologyName = searchTechnology[0].name
        mkCreateClient(mikrotikHost, plan, ctx.request.body.input, cityName, planName, neighborhoodName, technologyName)
      }
    } else {
      const mikrotikHost = searchCity[0].ip[0]
      const plan = searchPlan[0].mikrotik_name
      const planName = searchPlan[0].name
      const cityName = searchCity[0].name
      const neighborhoodName = searchNeighborhood[0].name
      const technologyName = searchTechnology[0].name
      console.log('this')
      mkCreateClient(mikrotikHost, plan, ctx.request.body.input, cityName, planName, neighborhoodName, technologyName)
      return true
    }
    return true
  },
  async adminCreateFromRequest(ctx) {
    const id = ctx.request.body.input.id
    const id_client = ctx.request.body.input.client.id
    const newMac_address = ctx.request.body.input.client.mac_address
    const newNap_onu_address = ctx.request.body.input.client.nap_onu_address
    const newOpticalPower = ctx.request.body.input.client.opticalPower
    const entity = await strapi.services.client.update({ id: id_client }, { 'active': true, mac_address: newMac_address, nap_onu_address: newNap_onu_address, opticalPower: newOpticalPower})
    await strapi.services.activationrequest.update({ id }, { 'active': false })
    const searchCity = await strapi.services.city.find({ id: ctx.request.body.input.client.city })
    const searchPlan = await strapi.services.plan.find({ id: ctx.request.body.input.client.plan })
    const searchNeighborhood = await strapi.services.neighborhood.find({ id: ctx.request.body.input.client.neighborhood })
    const searchTechnology = await strapi.services.technology.find({ id: ctx.request.body.input.client.technology })
    const telegrambot = await strapi.services.telegrambot.find({city: ctx.request.body.input.client.city})
    simpleTelegramAdminCreate(entity, telegrambot[0])
    if (searchCity[0].ip.length > 1) {
      for (let i = 0; i < searchCity[0].ip.length; i++) {
        const mikrotikHost = searchCity[0].ip[i]
        const plan = searchPlan[0].mikrotik_name
        const planName = searchPlan[0].name
        const cityName = searchCity[0].name
        const neighborhoodName = searchNeighborhood[0].name
        const technologyName = searchTechnology[0].name
        mkCreateClient(mikrotikHost, plan, ctx.request.body.input.client, cityName, planName, neighborhoodName, technologyName)
      }
    } else {
      const mikrotikHost = searchCity[0].ip[0]
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
    const clientObj = search[0]
    const dni = clientObj.dni
    const code = clientObj.code
    const model = clientObj.newModel
    const reqCityIpArray = clientObj.city.ip
    const comment = await createComment(clientObj)
    if (reqCityIpArray.length > 1) {
      const successfulMikrotikResponses = []
      for (let i = 0; i < reqCityIpArray.length; i++) {
        const mikrotikHost = reqCityIpArray[i]
        const res = await mkSetComment(mikrotikHost, dni, code, model, comment)
        successfulMikrotikResponses.push(res)
      }
    } else {
      const mikrotikHost = reqCityIpArray[0]
      await mkSetComment(mikrotikHost, dni, code, model, comment)
    }
    const res = sanitizeEntity(entity, { model: strapi.models.client })
    return res
  },
  async setClientComment(ctx) {
    const { clientid, comment } = ctx.request.body
    const search = await strapi.services.client.find({ _id: clientid })
    const clientObj = search[0]
    const dni = clientObj.dni
    const code = clientObj.code
    const model = clientObj.newModel
    const reqCityIpArray = clientObj.city.ip
    if (reqCityIpArray.length > 1) {
      for (let i = 0; i < reqCityIpArray.length; i++) {
        const mikrotikHost = reqCityIpArray[i]
        await mkSetComment(mikrotikHost, dni, code, model, comment)
        if (reqCityIpArray.length - 1 === i) {
          console.log('this ', model, comment)
          return true
        }
      }
    } else {
      const mikrotikHost = reqCityIpArray[0]
      await mkSetComment(mikrotikHost, dni, code, model, comment)
      console.log('other ')
      return true
    }
    console.log('how')
  },
  async delete(ctx) {
    const { id } = ctx.params;
    const search = await strapi.services.client.find({ _id: id })
    const clientObj = search[0]
    const dni = clientObj.dni
    const code = clientObj.code
    const model = clientObj.newModel
    const reqCityIpArray = clientObj.city.ip
    if (reqCityIpArray.length > 1) {
      const successfulMikrotikResponses = []
      for (let i = 0; i < reqCityIpArray.length; i++) {
        const mikrotikHost = reqCityIpArray[i]
        const res = await mkDeleteClient(mikrotikHost, dni, code, model)
        successfulMikrotikResponses.push(res)
      }
    } else {
      const mikrotikHost = reqCityIpArray[0]
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
    const clientObj = search[0]
    const dni = clientObj.dni
    const code = clientObj.code
    const model = clientObj.newModel
    const reqCityIpArray = clientObj.city.ip
    if (reqCityIpArray.length > 1) {
      const successfulMikrotikResponses = []
      for (let i = 0; i < reqCityIpArray.length; i++) {
        const mikrotikHost = reqCityIpArray[i]
        const res = await mkDeleteClient(mikrotikHost, dni, code, model)
        successfulMikrotikResponses.push(res)
      }
    } else {
      const mikrotikHost = reqCityIpArray[0]
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
    const clientObj = search[0]
    const dni = clientObj.dni
    const code = clientObj.code
    const model = clientObj.newModel
    const reqCityIpArray = clientObj.city.ip
    if (reqCityIpArray.length > 1) {
      const successfulMikrotikResponses = []
      for (let i = 0; i < reqCityIpArray.length; i++) {
        const mikrotikHost = reqCityIpArray[i]
        const res = await mkDeleteClient(mikrotikHost, dni, code, model)
        successfulMikrotikResponses.push(res)
      }
    } else {
      const mikrotikHost = reqCityIpArray[0]
      await mkDeleteClient(mikrotikHost, dni, code, model)
      return true
    }
    return true
  },
  async count(ctx) {
    return await strapi.services.client.count({ city: ctx.query._city });
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
    const disconnected = await strapi.services.client.count({ city: ctx.query._city, plan: '5f52a7572824f015ac8ceb5e' })
    const retired = await strapi.services.client.count({ city: ctx.query._city, plan: '5f52a75f2824f015ac8ceb5f' })
    return retired + disconnected
  },
  async getClientComment(ctx) {
    const id = ctx.query.id
    const search = await strapi.services.client.find({ _id: id })
    const clientObj = search[0]
    const code = clientObj.code
    const dni = clientObj.dni
    const model = clientObj.newModel

    const reqCityIpArray = clientObj.city.ip
    if (reqCityIpArray.length > 1) {
      const successfulMikrotikResponses = []
      for (let i = 0; i < reqCityIpArray.length; i++) {
        const mikrotikHost = reqCityIpArray[i]
        const res = await mkGetComment(mikrotikHost, dni, code, model)
        successfulMikrotikResponses.push(res)
      }
      return successfulMikrotikResponses[0]
    } else {
      const mikrotikHost = reqCityIpArray[0]
      const res = await mkGetComment(mikrotikHost, dni, code, model)
      return res
    }
  },
  async searchClient(ctx) {
    const search = ctx.query._search
    const city = ctx.query._city
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
    const clientObj = search[0]
    const dni = clientObj.dni
    const code = clientObj.code
    const model = clientObj.newModel
    const removeActive = true
    const reqCityIpArray = clientObj.city.ip
    const successfulMikrotikResponses = []
    const entity = await strapi.services.client.update({ id }, { plan: newClientPlanSearch })
    const telegrambot = await strapi.services.telegrambot.find({city: entity.city.id})
    simpleTelegramUpdatePlan(entity, operator, isRx, telegrambot[0])
    // console.log(clientObj)
    // await strapi.services.history.create(clientObj);
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
      if (res) {
        return true
      } else {
        return false
      }
    }
  },
  async getClientStatus(ctx) {
    const search = await strapi.services.client.findOne({ id: ctx.query.id })
    const mikrotikHost = search.city.ip[0]
    const code = search.code
    const dni = search.dni
    const model = search.newModel
    const res = await mkClientStatus(mikrotikHost, code, dni, model)
    return res
  },
  async dxClient(ctx) {
    const process = []
    const input = ctx.request.body.input
    const search = await strapi.services.client.findOne({ 'code': input.dx.code, 'city': input.dxCity })
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
    const reqCityIpArray = clientObj.city.ip
    if (reqCityIpArray.length > 1) {
      for (let i = 0; i < reqCityIpArray.length; i++) {
        const cityIp = reqCityIpArray[i]
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
      const cityIp = reqCityIpArray[0]
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
    const search = ctx.query
    if (ctx.query._q) {
      entities = await strapi.services.client.search(ctx.query);
    } else {
      entities = await strapi.services.client.search(ctx.query);
    }

    return entities.map(entity => sanitizeEntity(entity, { model: strapi.models.client }));
  },
};
