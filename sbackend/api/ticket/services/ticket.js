'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  find (params) {
    const {active, city, _limit} = params
    if(active) {
      return strapi.query('ticket').model.find({'city':city, 'active': active}).limit(parseInt(_limit)).sort({'createdAt':'desc'})
      .populate({
        path: 'client tickettype ticketdetails assiganted',
        populate: {
          path: 'neighborhood technology operator'
        }
      })
    } else {
      return strapi.query('ticket').model.find({city}).limit(parseInt(_limit)).sort({'createdAt':'desc'})
      .populate({
        path: 'client tickettype assiganted',
        populate: {
          path: 'neighborhood technology'
        }
      })
    }
  }
};
