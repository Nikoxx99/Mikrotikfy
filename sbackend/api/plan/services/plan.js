'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  find (params) {
    if (params
      && Object.keys(params).length === 0
      && Object.getPrototypeOf(params) === Object.prototype){
        return strapi.query('plan').model.find(params)
      } else {
        return strapi.query('plan').find(params)
      }
  }
};
