'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async getTestPasswordChange(ctx) {
    const entity = await strapi.services.passwordchange.findOne({ dni: ctx.query._dni });
    return entity
  },
  async PasswordChangeCtrl(ctx) {
    const entity = await strapi.services.passwordchange.find({ dni: ctx.query._dni });
    console.log(entity)
    return entity
  }
};
