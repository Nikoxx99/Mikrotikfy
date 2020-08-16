import { Schema, model } from 'mongoose'

const clientSchema = new Schema({
  code: {
    type: Number,
    required: true
  },
  name: {
    type: String,
  },
  dni: {
    type: String,
  },
  address: {
    type: String,
  },
  neighborhood: {
    type: Number,
  },
  city: {
    type: Number
  },
  phone: String,
  plan: Number,
  wifi_ssid: String,
  wifi_password: String,
  technology: Number,
  mac_address: String,
  comment: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date
  },
  operator: Number,
  newModel: Number
})

export default model('Client', clientSchema)