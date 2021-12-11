'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  find () {
    return strapi.query('city').model.find()
    .populate({
      path: 'mikrotiks',
      select: 'ip'
    })
  }
};
