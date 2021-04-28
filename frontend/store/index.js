
const cookieparser = process.server ? require('cookieparser') : undefined
export const state = () => {
  return {
    auth: null,
    tickets: null,
    cities: null,
    plans: null,
    technologies: null,
    neighborhoods: null,
    activeClients: null,
    clientCount: null,
    clientCountActive: null,
    clientCountDisable: null
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
  },
  setTicketsFromLocalStorage (state, tickets) {
    state.tickets = JSON.parse(tickets)
  },
  refreshActiveClients (state, res) {
    try {
      state.activeClients = res
    } catch (error) {
      throw new Error(`REFRESHACTIVECOUNT MUTATE ${error}`)
    }
  },
  refreshTickets (state, ticketList) {
    try {
      state.tickets = ticketList
    } catch (error) {
      throw new Error(`TICKET MUTATE ${error}`)
    }
  },
  updateTicketState (state, { editindex, closeTicket }) {
    state.tickets[editindex].active = !closeTicket
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
  },
  getTicketsFromLocalStorage ({ commit }) {
    const tickets = localStorage.getItem('tickets')
    commit('setTicketsFromLocalStorage', tickets)
  },
  async refreshActiveClients ({ commit }, city) {
    try {
      const res = await this.$axios.$get(`/getactiveclients/${city}`)
      localStorage.setItem('activeClients', res.length)
      commit('refreshActiveClients', res.length)
    } catch (error) {
      throw new Error(`ACTIVECOUNT ACTION ${error}`)
    }
  },
  async refreshTickets ({ commit }, { city, limit }) {
    try {
      const res = await this.$axios.$get(`/tickets?city=${city}&_limit=${limit}&_sort=createdAt:desc`)
      localStorage.setItem('tickets', JSON.stringify(res))
      commit('refreshTickets', res)
    } catch (error) {
      throw new Error(`TICKET ACTION ${error}`)
    }
  }
}
