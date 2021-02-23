'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require('strapi-utils');
const { simpleTelegramCreateTicket } = require('../../../mikrotik/functions');

module.exports = {
  async create(ctx) {
    let entity;
    entity = await strapi.services.ticket.create(ctx.request.body);
    const neighborhood = await strapi.services.neighborhood.findOne({ id: entity.client.neighborhood })
    simpleTelegramCreateTicket(entity, neighborhood.name)
    return sanitizeEntity(entity, { model: strapi.models.ticket });
  }
}