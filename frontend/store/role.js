import gql from 'graphql-tag'
export const state = () => ({
  roles: []
})
export const mutations = {
  getRolesFromDatabase (state, roleList) {
    try {
      state.roles = roleList
    } catch (error) {
      throw new Error(`ROLE MUTATE ${error}`)
    }
  }
}
export const actions = {
  async getRolesFromDatabase ({ commit }, payload) {
    try {
      const apollo = await this.app.apolloProvider.defaultClient
      apollo.query({
        query: gql`query($id: ID!){
          role(id: $id){
            name
            allowed_components{
              name
            }
          }
        }
      `,
        variables: {
          id: payload
        }
      }).then((input) => {
        commit('getRolesFromDatabase', input.data.role)
      })
    } catch (error) {
      throw new Error(`ROLE ACTION ${error}`)
    }
  }
}
