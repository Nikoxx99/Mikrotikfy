import gql from 'graphql-tag'
export const state = () => ({
  plans: []
})
export const mutations = {
  getPlansFromDatabase (state, plansList) {
    try {
      state.plans = plansList
    } catch (error) {
      throw new Error(`PLAN MUTATE ${error}`)
    }
  }
}
export const actions = {
  async getPlansFromDatabase ({ commit }) {
    try {
      const apollo = await this.app.apolloProvider.defaultClient
      apollo.query({
        query: gql`query{
          plans{
            id
            name
          }
        }`
      }).then((input) => {
        commit('getPlansFromDatabase', input.data.plans)
      })
    } catch (error) {
      throw new Error(`PLAN ACTION ${error}`)
    }
  }
}
