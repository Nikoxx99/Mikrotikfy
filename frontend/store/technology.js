import gql from 'graphql-tag'
export const state = () => ({
  technologies: []
})
export const mutations = {
  getTechnologiesFromDatabase (state, technologyList) {
    try {
      state.technologies = technologyList
    } catch (error) {
      throw new Error(`TECHNOLOGY MUTATE ${error}`)
    }
  }
}
export const actions = {
  async getTechnologiesFromDatabase ({ commit }, payload) {
    try {
      const apollo = this.app.apolloProvider.defaultClient
      await apollo.query({
        query: gql`query{
          technologies{
            id
            name
          }
        }
      `,
        variables: {
          id: payload
        }
      }).then((input) => {
        localStorage.setItem('technologies', JSON.stringify(input.data.technologies))
        commit('getTechnologiesFromDatabase', input.data.technologies)
      })
    } catch (error) {
      throw new Error(`TECHNOLOGY ACTION ${error}`)
    }
  }
}
