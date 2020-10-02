import { Schema, model } from 'mongoose'

const ticketSchema = new Schema({
  id: Number,
  client: String,
  type: Number,
  comment: String,
  attachments: Array,
  geolocation: Array,
  created_at: String,
  updated_at: String,
  closed_at: String,
  created_by: Number,
  updated_by: Number,
  closed_by: Number
})

export default model('Ticket', ticketSchema)