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
      const devicebrands = await this.$strapi.find('devicebrands')
      localStorage.setItem('devicebrands', JSON.stringify(devicebrands))
      commit('getDeviceBrandsFromDatabase', devicebrands)
    } catch (error) {
      throw new Error(`DEVICE BRANDS ACTION ${error}`)
    }
  }
}
