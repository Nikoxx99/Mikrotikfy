export const state = () => ({
  clients: [],
  headers: []
})
export const mutations = {
  getClientsBySearch (state, cityList) {
    try {
      state.cities = cityList
    } catch (error) {
      throw new Error(`CITY MUTATE ${error}`)
    }
  }
}
export const actions = {
  async getClientsBySearch ({ commit }, payload) {
    try {
      const qs = require('qs')
      const query = qs.stringify({
        filters: {},
        populate: []
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}clients?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        }
      })
        .then(res => res.json())
        .then((res) => {
          const cities = res.data.map((city) => {
            city.attributes.id = city.id
            city = city.attributes
            return city
          })
          localStorage.setItem('cities', JSON.stringify(cities))
          commit('getClientsBySearch', cities)
        })
    } catch (error) {
      throw new Error(`CITY ACTION ${error}`)
    }
  }
}
