import mongoose from 'mongoose'
// eslint-disable-next-line no-undef
require('dotenv').config()
// eslint-disable-next-line no-undef
const db_uri = process.env.DATABASE_URI
export async function connect() {
  try {
    await mongoose.connect(db_uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    })
    console.log('Database online')
  } catch (e) {
    console.log('Algo salió mal...')
    console.log(e)
  }
}