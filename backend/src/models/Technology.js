import { Schema, model } from 'mongoose'

const technologySchema = new Schema({
  id: Number,
  name: String,
})

export default model('Technology', technologySchema)