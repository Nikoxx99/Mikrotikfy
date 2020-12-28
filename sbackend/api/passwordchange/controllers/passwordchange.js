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
  },
  async updatePasswordChangeRequest(ctx) {
    console.log(ctx.request.body)
    // const closed = input.closed
    // const updatePasswordChangeRequest = await PasswordChange.updateOne({ _id: input._id }, { closed }, { multi: false })
    // if (updatePasswordChangeRequest) {
    //   return simpleResponse(true, 'Update Password Change Request', 'Password Change Request updated successfully.')
    // } else {
    //   return simpleResponse(false, 'Update Password Change Request', 'Error updating Password Change Request.')
    // }
  }
};
