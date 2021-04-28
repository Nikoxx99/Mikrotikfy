import axios from 'axios'
import Cookie from 'js-cookie'
const cookieparser = process.server ? require('cookieparser') : undefined
export default async function ({ store, req }) {
  const parsed = cookieparser.parse(req.headers.cookie)
  try {
    const auth = JSON.parse(parsed.auth)
    const res = await axios.$get(`/users?id=${auth.id}`)
    if (res.resetSession) {
      await axios.$put(`/users/${auth.id}`, { resetSession: false })
      Cookie.remove('auth')
      Cookie.remove('authToken')
      localStorage.clear()
      store.commit('setAuth', null)
      window.location.href = '/login'
    }
  } catch (err) {
    // No valid cookie found
  }
}
