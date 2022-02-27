'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  async find (params) {  
    const {active, city, _limit} = params
    if(active) {
      const res = await strapi.query('ticket').find(params, ["client","client.neighborhood", "tickettype","ticketdetails","assiganted"])
      const resdetails = await Promise.all(
        res.map(async (item) => {
          console.log(item)
          if (item.ticketdetails.length > 0) {
            const detailsquery = await strapi.query('ticketdetail').find({_id: item.ticketdetails.slice(-1)[0]._id})
            item.ticketdetails = detailsquery
            return item
          } else {
            return item
          }
        })
      )
      const resclient = await Promise.all(
        resdetails.map(async (item) => {
          const clientquery = await strapi.query('client').findOne({_id: item.client._id})
          item.client = clientquery
          return item
        })
      )
      return resclient
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