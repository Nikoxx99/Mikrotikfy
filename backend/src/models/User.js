import { Schema, model } from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email:String,
  date: {
    type: Date,
    default: Date.now
  },
  role: Number
})

userSchema.methods.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  const hash = bcrypt.hash(password, salt)
  return hash
}

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

export default model('User', userSchema)