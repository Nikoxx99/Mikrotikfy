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
  async getCitiesFromDatabase ({ commit }) {
    try {
      const cities = await this.$strapi.find('cities')
      localStorage.setItem('cities', JSON.stringify(cities))
      commit('getCitiesFromDatabase', cities)
    } catch (error) {
      throw new Error(`CITY ACTION ${error}`)
    }
  }
}
