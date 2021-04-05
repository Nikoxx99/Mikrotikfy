import gql from 'graphql-tag'
export const state = () => ({
  neighborhoods: []
})
export const mutations = {
  getNeighborhoodsFromDatabase (state, neighborhoodList) {
    try {
      state.neighborhoods = neighborhoodList
    } catch (error) {
      throw new Error(`NEIGHBORHOOD MUTATE ${error}`)
    }
  }
}
export const actions = {
  async getNeighborhoodsFromDatabase ({ commit }, payload) {
    try {
      const apollo = await this.app.apolloProvider.defaultClient
      apollo.query({
        query: gql`query{
          neighborhoods{
            id
            name
          }
        }
      `,
        variables: {
          id: payload
        }
      }).then((input) => {
        commit('getNeighborhoodsFromDatabase', input.data.neighborhoods)
      })
    } catch (error) {
      throw new Error(`NEIGHBORHOOD ACTION ${error}`)
    }
  }
}
