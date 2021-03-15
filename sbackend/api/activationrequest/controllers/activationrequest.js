'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { sanitizeEntity } = require('strapi-utils');
const { simpleTelegramCreateRequest } = require('../../../mikrotik/functions');

module.exports = {
  async create(ctx) {
    let entity;
    entity = await strapi.services.activationrequest.create(ctx.request.body);
    const telegrambot = await strapi.services.telegrambot.find({city: entity.city.id})
    simpleTelegramCreateRequest(entity, telegrambot[0])
    return sanitizeEntity(entity, { model: strapi.models.activationrequest });
  }
}