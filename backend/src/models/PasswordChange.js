import { Schema, model } from 'mongoose'

const passwordChangeSchema = new Schema({
  id: Number,
  client_id: String,
  dni: String,
  old_password: String,
  new_password: String,
  closed: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now()
  }
})

export default model('PasswordChange', passwordChangeSchema)