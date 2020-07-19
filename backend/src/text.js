const conn = require('./conn')
conn.connect().then(() => {
  console.log('Connected Successfully >>>')
}).then(() => {
  conn.close()
}).catch((err) => {
  console.log(err)
});