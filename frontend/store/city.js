import gql from 'graphql-tag'
export const state = () => ({
  cities: []
})
export const mutations = {
  getCitiesFromDatabase (state, cityList) {
    try {
      state.cities = cityList
    } catch (error) {
      throw new Error(`CITY MUTATE ${error}`)
    }
  }
}
export const actions = {
  async getCitiesFromDatabase ({ commit }, payload) {
    try {
      const apollo = await this.app.apolloProvider.defaultClient
      apollo.query({
        query: gql`query{
          cities{
            id
            name
          }
        }
      `,
        variables: {
          id: payload
        }
      }).then((input) => {
        commit('getCitiesFromDatabase', input.data.cities)
      })
    } catch (error) {
      throw new Error(`CITY ACTION ${error}`)
    }
  }
}
