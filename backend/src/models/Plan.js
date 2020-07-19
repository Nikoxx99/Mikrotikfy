import { Schema, model } from 'mongoose'

const planSchema = new Schema({
  id: Number,
  name: String,
  mikrotik_name: String
})

export default model('Plan', planSchema)