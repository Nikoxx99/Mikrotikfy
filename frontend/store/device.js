export const state = () => ({
  devicebrands: []
})
export const mutations = {
  getDeviceBrandsFromDatabase (state, deviceBrandsList) {
    try {
      state.devicebrands = deviceBrandsList
    } catch (error) {
      throw new Error(`DEVICE BRANDS MUTATE ${error}`)
    }
  }
}
export const actions = {
  async getDeviceBrandsFromDatabase ({ commit }) {
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}devicebrands`)
        .then(res => res.json())
        .then((res) => {
          const devicebrands = res.data.map((devicebrand) => {
            devicebrand = devicebrand.attributes
            return devicebrand
          })
          localStorage.setItem('devicebrands', JSON.stringify(devicebrands))
          commit('getDeviceBrandsFromDatabase', devicebrands)
        })
    } catch (error) {
      throw new Error(`DEVICE BRANDS ACTION ${error}`)
    }
  }
}
