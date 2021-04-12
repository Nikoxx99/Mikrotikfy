const cookieparser = process.server ? require('cookieparser') : undefined

export const state = () => {
  return {
    auth: null,
    cities: null
  }
}
export const mutations = {
  setAuth (state, auth) {
    state.auth = auth
  },
  setLocalStorage (state, { cities, plans, technologies, neighborhoods, activeClients, clientCount, clientCountActive, clientCountDisable }) {
    state.cities = JSON.parse(cities)
    state.plans = JSON.parse(plans)
    state.technologies = JSON.parse(technologies)
    state.neighborhoods = JSON.parse(neighborhoods)
    state.activeClients = JSON.parse(activeClients)
    state.clientCount = JSON.parse(clientCount)
    state.clientCountActive = JSON.parse(clientCountActive)
    state.clientCountDisable = JSON.parse(clientCountDisable)
  }
}
export const actions = {
  nuxtServerInit ({ commit }, { req }) {
    let auth = null
    if (req.headers.cookie) {
      const parsed = cookieparser.parse(req.headers.cookie)
      try {
        auth = JSON.parse(parsed.auth)
      } catch (err) {
        // No valid cookie found
      }
    }
    commit('setAuth', auth)
  },
  loadLocalStorage ({ commit }) {
    const cities = localStorage.getItem('cities')
    const plans = localStorage.getItem('plans')
    const technologies = localStorage.getItem('technologies')
    const neighborhoods = localStorage.getItem('neighborhoods')
    const activeClients = localStorage.getItem('activeClients')
    const clientCount = localStorage.getItem('clientCount')
    const clientCountActive = localStorage.getItem('clientCountActive')
    const clientCountDisable = localStorage.getItem('clientCountDisable')
    commit('setLocalStorage', { cities, plans, technologies, neighborhoods, activeClients, clientCount, clientCountActive, clientCountDisable })
  }
}
