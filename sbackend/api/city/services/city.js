'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  find (params) {
    console.log(params)
    if (Object.keys(params).length > 0){
      return strapi.query('city').model.find({'_id': params.id})
      .populate({
        path: 'mikrotiks',
        select: 'ip'
      })
    } else {
      return strapi.query('city').model.find()
      .populate({
        path: 'mikrotiks',
        select: 'ip'
      })
    }
  }
};
