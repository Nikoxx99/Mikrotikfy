export const state = () => ({
  technologies: []
})
export const mutations = {
  getTechnologiesFromDatabase (state, technologyList) {
    try {
      state.technologies = technologyList
    } catch (error) {
      throw new Error(`TECHNOLOGY MUTATE ${error}`)
    }
  }
}
export const actions = {
  async getTechnologiesFromDatabase ({ commit }) {
    try {
      const technologies = await this.$strapi.find('technologies')
      localStorage.setItem('technologies', JSON.stringify(technologies))
      commit('getTechnologiesFromDatabase', technologies)
    } catch (error) {
      throw new Error(`TECHNOLOGY ACTION ${error}`)
    }
  }
}
