import jwt from 'jsonwebtoken'
export const auth = {

  getToken: ({_id}, SECRET) => {
    const token = jwt.sign({user: _id},SECRET, {expiresIn: '1y'})
    return token
  },
  login: async (input,User, SECRET) => {
    const userFind = await User.findOne({username: input.username})
    if(!userFind){
      return { success: false, errors: [{path:'username',message: 'Username does not exist'}]}
    }
    const newUser = new User(userFind)
    const hashPassword = await newUser.matchPassword(input.password,newUser.password)
    if (!hashPassword) {
      return { success: false, errors: [{path:'password',message: 'Password incorrect'}]}
    }
    const token = auth.getToken(newUser, SECRET)
    const username = newUser.username
    const role = newUser.role
    return {
      success: true,
      token,
      role,
      username,
      errors: []
    }
  }
}
