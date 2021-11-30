export const state = () => ({
  naps: []
})
export const mutations = {
  createNap (state, napPayload) {
    try {
      state.naps.push(napPayload)
    } catch (error) {
      throw new Error(`NAPS CREATE MUTATE ${error}`)
    }
  },
  napList (state, napPayload) {
    try {
      state.naps = napPayload
    } catch (error) {
      throw new Error(`NAPS LIST MUTATE ${error}`)
    }
  }
}
export const actions = {
  async createNap ({ commit }, napPayload) {
    try {
      const createNap = await this.$strapi.create('naps', napPayload)
      commit('createNap', createNap)
    } catch (error) {
      throw new Error(`NAPS CREATE ACTION ${error}`)
    }
  },
  async getNaps ({ commit }, city) {
    try {
      const napList = await this.$strapi.find('naps', { city })
      commit('napList', napList)
    } catch (error) {
      throw new Error(`NAPS GET ACTION ${error}`)
    }
  }
}
