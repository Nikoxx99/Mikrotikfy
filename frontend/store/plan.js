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
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}plans`)
        .then(res => res.json())
        .then((res) => {
          const plans = res.data.map((plan) => {
            plan.attributes.id = plan.id
            plan = plan.attributes
            return plan
          })
          localStorage.setItem('plans', JSON.stringify(plans))
          commit('getPlansFromDatabase', plans)
        })
    } catch (error) {
      throw new Error(`PLAN ACTION ${error}`)
    }
  }
}
