'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  find (params) {
    return strapi.query('client').model.find(params)
    .populate('city')
    .populate('plan')
    .populate('neighborhood')
    .populate('technology')
    .populate('mac_addresses')
  },
};
