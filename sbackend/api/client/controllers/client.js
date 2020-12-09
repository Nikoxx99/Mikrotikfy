'use strict';
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require('strapi-utils');
const { mkSetClientPlanInformation, mkClientStatus, mkGetComment, mkSetComment } = require('../../../mikrotik/functions')
module.exports = {
  async update(ctx) {
    const { id } = ctx.params;
    let entity;
    entity = await strapi.services.client.update({ id }, ctx.request.body);
    
    const search = await strapi.services.client.find({id: id})
    const clientObj = search[0]
    const dni = clientObj.dni
    const code = clientObj.code
    const model = clientObj.newModel
    const comment = ctx.request.body.comment
    const reqCityIpArray = clientObj.city.ip
    if (reqCityIpArray.length > 1) {
      const successfulMikrotikResponses = []
      for (let i = 0; i < reqCityIpArray.length; i++){
        const mikrotikHost = reqCityIpArray[i]
        const res = await mkSetComment(mikrotikHost, dni, code, model, comment)
        successfulMikrotikResponses.push(res)
      }
    } else {
      const mikrotikHost = reqCityIpArray[0]
      await mkSetComment(mikrotikHost, dni, code, model, comment)
    }
    return sanitizeEntity(entity, { model: strapi.models.client });
  },
  async count(ctx) {
    return await strapi.services.client.count({city: ctx.query._city});
  },
  async countActive(ctx) {
    return await strapi.services.client.count({city: ctx.query._city, active: true});
  },
  async countDisable(ctx) {
    return await strapi.services.client.count({ city: ctx.query._city, active: false } )
  },
  async getClientComment (ctx) {
    const id = ctx.query._id
    const search = await strapi.services.client.find({ _id: id })
    const clientObj = search[0]
    const code = clientObj.code
    const dni = clientObj.dni
    const model = clientObj.newModel

    const reqCityIpArray = clientObj.city.ip
    if (reqCityIpArray.length > 1) {
      const successfulMikrotikResponses = []
      for (let i = 0; i < reqCityIpArray.length; i++){
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
  async searchClient (ctx) {
    const search = ctx.query._search
    const city = ctx.query._city
    if (search) {
      const neighborhood = await strapi.services.neighborhood.find({'name': { $regex: new RegExp(search, 'i') }})
      return await strapi.services.client.findClient({
        $or:[
          {'city': city, 'code':{ $regex: new RegExp(search, 'i') }},
          {'city': city, 'name':{ $regex: new RegExp(search, 'i') }},
          {'city': city, 'address':{ $regex: new RegExp(search, 'i') }},
          {'city': city, 'neighborhood': neighborhood._id},
          {'city': city, 'dni':{ $regex: new RegExp(search, 'i') }},
          {'city': city, 'phone':{ $regex: new RegExp(search, 'i') }}
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
    const mikrotikHost = search.city.ip[0]
    const code = search.code
    const dni = search.dni
    const model = search.newModel
    const res = await mkClientStatus(mikrotikHost, code, dni, model)
    return res
  },
};
