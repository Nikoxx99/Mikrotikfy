module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '838e675f8d1fcdc9edee2db7b47e3593'),
    },
    mikrotik: {
      secret: env('MK_ACCESS_SECRET', 'weare991010rootnortetv'),
    }
  },
});
