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
  async getNeighborhoodsFromDatabase ({ commit }) {
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}neighborhoods`)
        .then(res => res.json())
        .then((res) => {
          const neighborhoods = res.data.map((neighborhood) => {
            neighborhood = neighborhood.attributes
            return neighborhood
          })
          localStorage.setItem('neighborhoods', JSON.stringify(neighborhoods))
          commit('getNeighborhoodsFromDatabase', neighborhoods)
        })
    } catch (error) {
      throw new Error(`NEIGHBORHOOD ACTION ${error}`)
    }
  }
}
