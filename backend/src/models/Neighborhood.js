import { Schema, model } from 'mongoose'

const neighborhoodSchema = new Schema({
  id: Number,
  name: String,
  city: Number
})

export default model('Neighborhood', neighborhoodSchema)