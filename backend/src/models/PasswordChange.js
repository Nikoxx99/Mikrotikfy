import { Schema, model } from 'mongoose'

const passwordChangeSchema = new Schema({
  id: Number,
  client_id: String,
  dni: String,
  old_password: String,
  new_password: String,
  closed: {
    type: Object,
    default: {
      name: 'Cerrado',
      value: false
    }
  },
  created_at: {
    type: Number,
    default: 0
  }
})

export default model('PasswordChange', passwordChangeSchema)