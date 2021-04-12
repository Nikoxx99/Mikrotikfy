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
      const apollo = this.app.apolloProvider.defaultClient
      await apollo.query({
        query: gql`query{
          cities{
            id
            name
            color
          }
        }
      `,
        variables: {
          id: payload
        }
      }).then((input) => {
        localStorage.setItem('cities', JSON.stringify(input.data.cities))
        commit('getCitiesFromDatabase', input.data.cities)
      })
    } catch (error) {
      throw new Error(`CITY ACTION ${error}`)
    }
  }
}
