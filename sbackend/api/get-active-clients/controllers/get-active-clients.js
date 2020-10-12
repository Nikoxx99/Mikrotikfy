'use strict';

module.exports = {
  async getActiveClients(ctx) {
    const res = strapi.services.city.find()
    return [{
      active: ctx.query
    }]
  },
};
