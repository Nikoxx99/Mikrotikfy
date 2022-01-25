'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  async find (params) {  
    const {active, city, _limit} = params
    if(active) {
      console.log(params)
      const res = await strapi.query('ticket').find(params, ["client","tickettype","ticketdetails","assiganted"])
      if (res.length > 0) {
        if (res[0].ticketdetails.length > 0) {
          const resdetails = await strapi.query('ticketdetail').find({_id: res[0].ticketdetails[0]._id})
          res[0].ticketdetails = resdetails
          return res
        } else {
          return res
        }
      } else {
        return []
      }

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