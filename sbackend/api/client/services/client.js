'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  async findClient (params) {
    return await strapi.query('client').model.find(params)
  },
};
