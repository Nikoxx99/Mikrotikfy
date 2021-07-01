const Sentry = require('@sentry/node');
Sentry.init({
  dsn: "https://b9c5f8f66aba4c638e6358de00e8e626@o905297.ingest.sentry.io/5843617",
  environment: strapi.config.environment,
});

module.exports = strapi => {
  return {
    initialize() {
      strapi.app.use(async (_, next) => {
        try {
          await next();
        } catch (error) {
          Sentry.captureException(error);
          throw error;
        }
      });
    },
  };
};