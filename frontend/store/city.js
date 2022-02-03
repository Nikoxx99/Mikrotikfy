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
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}cities`)
        .then(res => res.json())
        .then((res) => {
          const cities = res.data.map((city) => {
            city = city.attributes
            return city
          })
          localStorage.setItem('cities', JSON.stringify(cities))
          commit('getCitiesFromDatabase', cities)
        })
    } catch (error) {
      throw new Error(`CITY ACTION ${error}`)
    }
  }
}
