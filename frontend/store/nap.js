export const state = () => ({
  naps: []
})
export const mutations = {
  createNap (state, napPayload) {
    try {
      state.naps.push(napPayload)
    } catch (error) {
      throw new Error(`NAPS MUTATE ${error}`)
    }
  }
}
export const actions = {
  async createNap ({ commit }, napPayload) {
    try {
      console.log('napPayload', napPayload)
      const createNap = await this.$strapi.create('naps', napPayload)
      commit('createNap', createNap)
    } catch (error) {
      throw new Error(`NAPS ACTION ${error}`)
    }
  }
}
