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
      const neighborhoods = await this.$strapi.find('neighborhoods')
      localStorage.setItem('neighborhoods', JSON.stringify(neighborhoods))
      commit('getNeighborhoodsFromDatabase', neighborhoods)
    } catch (error) {
      throw new Error(`NEIGHBORHOOD ACTION ${error}`)
    }
  }
}
