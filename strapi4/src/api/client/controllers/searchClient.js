'use strict';

/**
 * A set of functions called "actions" for `searchClient`
 */
const { sanitize } = require('@strapi/utils');
module.exports = {


  /* BUSCAR CLIENTE CUSTOM ACTION */
  async searchclient(ctx) {
    const {city, search } = ctx.query;
    if (search) { // SI LA BUSQUEDA NO ES NULA
      if (search.length === 5) { //SI LA BUSQUEDA TIENE 5 CARACTERES
        const toNumber = parseInt(search)
        if (!isNaN(toNumber)) { // SI SON NUMEROS ESOS 5 CARACTERES
          const res = await strapi.service('api::client.client').find({
            $or: [
              { 'city': city, 'code': { $regex: new RegExp(search, 'i') } }
            ],
            populate: '*'
          })
          const sanitizedEntity = await sanitize.contentAPI.output(res);
          return { data: sanitizedEntity };
        } else { // SI NO SON NUMEROS, PUEDEN SER UN BARRIO
          const neighborhood = await strapi.service('api::neighborhood.neighborhood').find({ 'name': { $regex: new RegExp(search, 'i') } })
          if (neighborhood.length > 0) { // SI ES UN BARRIO
            const res = await strapi.service('api::client.client').find({
              $or: [
                { 'city': city, 'code': { $regex: new RegExp(search, 'i') } },
                { 'city': city, 'name': { $regex: new RegExp(search, 'i') } },
                { 'city': city, 'address': { $regex: new RegExp(search, 'i') } },
                { 'city': city, 'neighborhood': neighborhood[0]._id },
                { 'city': city, 'dni': { $regex: new RegExp(search, 'i') } },
                { 'city': city, 'phone': { $regex: new RegExp(search, 'i') } }
              ]
            })
            const sanitizedEntity = await sanitize.contentAPI.output(res);
          return { data: sanitizedEntity };
          } else { // SINO ES UN BARRIO, PUEDE SER OTRO DATO
            const res = await strapi.service('api::client.client').find({
              $or: [
                { 'city': city, 'code': { $regex: new RegExp(search, 'i') } },
                { 'city': city, 'name': { $regex: new RegExp(search, 'i') } },
                { 'city': city, 'address': { $regex: new RegExp(search, 'i') } },
                { 'city': city, 'dni': { $regex: new RegExp(search, 'i') } },
                { 'city': city, 'phone': { $regex: new RegExp(search, 'i') } }
              ]
            })
            const sanitizedEntity = await sanitize.contentAPI.output(res);
            return { data: sanitizedEntity };
          }
        }
      } else { // SI LA BUSQUEDA TIENE MENOS O MAS DE 5 CARACTERES
        const neighborhood = await strapi.service('api::neighborhood.neighborhood').find({ 'name': { $regex: new RegExp(search, 'i') } })
        if (neighborhood.length > 0) { // SI ES UN BARRIO
          const res = await strapi.service('api::client.client').find({
            $or: [
              { 'city': city, 'code': { $regex: new RegExp(search, 'i') } },
              { 'city': city, 'name': { $regex: new RegExp(search, 'i') } },
              { 'city': city, 'address': { $regex: new RegExp(search, 'i') } },
              { 'city': city, 'neighborhood': neighborhood[0]._id },
              { 'city': city, 'dni': { $regex: new RegExp(search, 'i') } },
              { 'city': city, 'phone': { $regex: new RegExp(search, 'i') } }
            ]
          })
          const sanitizedEntity = await sanitize.contentAPI.output(res);
          return { data: sanitizedEntity };
        } else { // SINO ES UN BARRIO, PUEDE SER OTRO DATO
          const res = await strapi.service('api::client.client').find({
            $or: [
              { 'city': city, 'code': { $regex: new RegExp(search, 'i') }},
              { 'city': city, 'name': { $regex: new RegExp(search, 'i') } },
              { 'city': city, 'address': { $regex: new RegExp(search, 'i') } },
              { 'city': city, 'dni': { $regex: new RegExp(search, 'i') } },
              { 'city': city, 'phone': { $regex: new RegExp(search, 'i') } }
            ],
            orderBy: { code: 'asc' }})
          const sanitizedEntity = await sanitize.contentAPI.output(res);
          return { data: sanitizedEntity };
        }
      }
    } else {
      return [{ init: 'initial request' }]
    }
  }
};
