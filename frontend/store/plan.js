import gqlt from 'graphql-tag'
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
      const apollo = this.app.apolloProvider.defaultClient
      await apollo.query({
        query: gqlt`query{
          plans{
            id
            name
          }
        }`
      }).then((input) => {
        localStorage.setItem('plans', JSON.stringify(input.data.plans))
        commit('getPlansFromDatabase', input.data.plans)
      })
    } catch (error) {
      throw new Error(`PLAN ACTION ${error}`)
    }
  }
}
