
export const state = () => ({
  roles: [],
  allowedcomponents: []
})
export const mutations = {
  getRolesFromDatabase (state, { roleName, allowedcomponents }) {
    try {
      state.roles = roleName
      state.allowedcomponents = allowedcomponents
    } catch (error) {
      throw new Error(`ROLE MUTATE ${error}`)
    }
  }
}
export const actions = {
  getRolesFromDatabase ({ commit }, payload) {
    try {
    } catch (error) {
      throw new Error(`ROLE ACTION ${error}`)
    }
  }
}
