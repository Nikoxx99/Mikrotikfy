'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require('strapi-utils');
module.exports = {
  async TestPasswordChange(ctx) {
    const entity = await strapi.services.passwordchange.findOne({ dni: ctx.query._dni })
    console.log(entity)
    if (entity.closed.value === false) {
      return false
    } else {
      return true
    }
  },
  async updatePasswordChangeRequest(ctx) {
    const id = ctx.request.body.input._id
    const payload = ctx.request.body.input
    await strapi.services.passwordchange.update({ id }, payload);
    return true
  },
  async createPasswordChangeRequest(ctx) {
    const payload = ctx.request.body.input
    const dni = payload.dni
    const entity = await strapi.services.client.findOne({ dni: dni });
    if (!entity) {
      await strapi.services.passwordchange.create(payload);
      return true
    } else {
      const client = entity._id
      await strapi.services.passwordchange.create({ client, ...payload });
      return true
    }
  }
};
