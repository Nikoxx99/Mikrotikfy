import gqlt from 'graphql-tag'
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
      const apollo = this.app.apolloProvider.defaultClient
      await apollo.query({
        query: gqlt`query{
          devicebrands{
            name
            id
          }
        }
      `
      }).then((input) => {
        localStorage.setItem('devicebrands', JSON.stringify(input.data.devicebrands))
        commit('getDeviceBrandsFromDatabase', input.data.devicebrands)
      })
    } catch (error) {
      throw new Error(`DEVICE BRANDS ACTION ${error}`)
    }
  }
}
