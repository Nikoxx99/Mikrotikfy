'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const { sanitizeEntity } = require('strapi-utils');
const { simpleTelegramCreateTicketAdvance, simpleTelegramSendActiveTicketList } = require('../../../mikrotik/functions');

module.exports = {
  async create(ctx) {
    let entity;
    entity = await strapi.services.ticketdetail.create(ctx.request.body);
    const res = await sanitizeEntity(entity, { model: strapi.models.ticketdetail });
    const idclient = res.ticket.client
    const idtickettype = res.ticket.tickettype
    const client = await strapi.services.client.findOne({ id: idclient });
    const tickettype = await strapi.services.tickettype.findOne({ id: idtickettype });
    const assiganted = res.operator.username
    const telegrambot = await strapi.services.telegrambot.find({city: entity.ticket.city})
    simpleTelegramCreateTicketAdvance(res, client, tickettype, assiganted, telegrambot[0])
    // if (res.ticket.active) {
    //   console.log('activo')
    // } else {
    //   console.log('cerrado')
    //   simpleTelegramCreateTicketAdvance(res, client, tickettype, assiganted, telegrambot[0])
      // const ticketlist = await strapi.services.ticket.find({city: entity.ticket.city, active: true })
      // simpleTelegramSendActiveTicketList(ticketlist, telegrambot[0])
    
  }
}