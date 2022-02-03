export const state = () => ({
  role: []
})
export const mutations = {
  getRoleFromUserData (state, roleData) {
    try {
      state.role = roleData
    } catch (error) {
      throw new Error(`ROLE BRANDS MUTATE ${error}`)
    }
  }
}
export const actions = {
  async getRoleFromUserData ({ commit }, { token }) {
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}users/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(({ role }) => {
          localStorage.setItem('role', JSON.stringify(role))
          commit('getRoleFromUserData', role)
        })
    } catch (error) {
      throw new Error(`ROLE BRANDS ACTION ${error}`)
    }
  }
}
