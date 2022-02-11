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
      console.log(city)
          const res = await strapi.service('api::client.client').find({
            filters: {
              $and: [
                {
                  city: {
                    name: {
                      $eq: city
                    }
                  },
                },
                {
                  $or: [
                    {
                      code: search
                    },
                    {
                      neighborhood: {
                        name: search
                      }
                    },
                    {
                      name: {
                        $contains: search
                      }
                    },
                    {
                      address: {
                        $contains: search
                      }
                    },
                    {
                      technology: {
                        name: search
                      }
                    },
                    {
                      plan: {
                        name: search
                      }
                    },
                    {
                      dni: search
                    },
                    {
                      phone: search
                    }
                  ],
                }
              ],  
            },
            populate: ['city', 'plan', 'neighborhood', 'technology', 'clienttype'],
            orderBy: { code: 'asc' }})
            console.log(res)
          const sanitizedEntity = await sanitize.contentAPI.output(res);
          return { data: sanitizedEntity };
    } else {
      return [{ init: 'initial request' }]
    }
  }
};
