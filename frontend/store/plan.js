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
      const plans = await this.$strapi.find('plans')
      localStorage.setItem('plans', JSON.stringify(plans))
      commit('getPlansFromDatabase', plans)
    } catch (error) {
      throw new Error(`PLAN ACTION ${error}`)
    }
  }
}
