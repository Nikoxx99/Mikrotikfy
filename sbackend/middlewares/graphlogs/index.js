module.exports = strapi => {
  return {
    // can also be async
    initialize() {
      strapi.app.use(async (ctx, next) => {
        // apply only if it's a GrahQL request
        if (ctx.request.url === '/graphql') {
          // execute the middleware stack
          await next();

          //then logs info
          // if (ctx.request.body.query[1] !== 'IntrospectionQuery'){
          //   console.log('REQUEST:')
          //   console.info(ctx.request.body.query);
          //   // console.log('RESPONSE:')
          // }
          
          // console.error(ctx.body);
        } else {
          // just exec the mileware stack for other requests
          await next();
        }
      });
    },
  };
};