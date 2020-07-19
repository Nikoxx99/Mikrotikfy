import 'regenerator-runtime/runtime'
// eslint-disable-next-line no-undef
require('dotenv').config()
import express from 'express'
import graphqlHTTP from 'express-graphql'
import schema from './schema'
import cors from 'cors'
import { connect } from './database'
// eslint-disable-next-line no-undef
const SECRET = process.env.SECRET
const app = express()
connect()
app.get('/', (req,res) => {
  res.json({
    msg: 'Oh you checky wanker...'
  })
})
var corsOptions = {
  // eslint-disable-next-line no-undef
  origin: process.env.CORS_ORIGIN,
  methods: 'POST, PUT, OPTIONS, DELETE, GET',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
  optionsSuccessStatus: 200
}

// eslint-disable-next-line no-undef
if (process.env.GRAPHIQL === 'TRUE') {
  var isGraphiQLActivated = true
}else {
  // eslint-disable-next-line no-redeclare
  var isGraphiQLActivated = false
}
app.use(cors(corsOptions))
app.use('/graphql',graphqlHTTP({
  graphiql:isGraphiQLActivated,
  schema: schema,
  context: SECRET
}))
app.use(express.static('cdn'))

app.listen(4000, () =>{
  console.log('Server on port 4000')
})