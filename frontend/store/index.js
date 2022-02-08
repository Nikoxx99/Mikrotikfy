
const cookieparser = process.server ? require('cookieparser') : undefined
export const state = () => {
  return {
    auth: null,
    tickets: null,
    cities: null,
    plans: null,
    technologies: null,
    devicebrands: null,
    neighborhoods: null,
    activeClients: null,
    activeClientsList: null,
    clientCount: null,
    clientCountActive: null,
    clientCountDisable: null,
    clientCountRetired: null
  }
}
export const mutations = {
  setAuth (state, auth) {
    state.auth = auth
  },
  setLocalStorage (state, { cities, plans, technologies, neighborhoods, deviceBrands, activeClients, activeClientsList, role, tickets }) {
    state.cities = JSON.parse(cities)
    state.plans = JSON.parse(plans)
    state.technologies = JSON.parse(technologies)
    state.neighborhoods = JSON.parse(neighborhoods)
    state.devicebrands = JSON.parse(deviceBrands)
    state.role = JSON.parse(role)
    state.activeClients = JSON.parse(activeClients)
    state.activeClientsList = JSON.parse(activeClientsList)
    state.tickets = JSON.parse(tickets)
    // state.clientCount = JSON.parse(clientCount)
    // state.clientCountActive = JSON.parse(clientCountActive)
    // state.clientCountDisable = JSON.parse(clientCountDisable)
    // state.clientCountRetired = JSON.parse(clientCountRetired)
  },
  setTicketsFromLocalStorage (state, tickets) {
    state.tickets = JSON.parse(tickets)
  },
  refreshActiveClients (state, { count, clientActiveList }) {
    try {
      state.activeClients = count
      state.activeClientsList = clientActiveList
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
    const plans = localStorage.getItem('plans')
    const cities = localStorage.getItem('cities')
    const technologies = localStorage.getItem('technologies')
    const deviceBrands = localStorage.getItem('devicebrands')
    const neighborhoods = localStorage.getItem('neighborhoods')
    const activeClients = localStorage.getItem('activeClients')
    const role = localStorage.getItem('role')
    const activeClientsList = localStorage.getItem('activeClientsList')
    const tickets = localStorage.getItem('tickets')
    // const clientCount = localStorage.getItem('clientCount')
    // const clientCountActive = localStorage.getItem('clientCountActive')
    // const clientCountDisable = localStorage.getItem('clientCountDisable')
    // const clientCountRetired = localStorage.getItem('clientCountRetired')
    commit('setLocalStorage', { cities, plans, technologies, neighborhoods, deviceBrands, activeClients, activeClientsList, role, tickets })
  },
  getTicketsFromLocalStorage ({ commit }) {
    const tickets = localStorage.getItem('tickets')
    commit('setTicketsFromLocalStorage', tickets)
  },
  async refreshActiveClients ({ commit }, payload) {
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}activeclients?city=${payload.city.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        }
      })
        .then(res => res.json())
        .then(async (clients) => {
          localStorage.setItem('activeClients', clients.length)
          const count = clients.length
          const clientActiveList = await clients.map((c) => {
            return c.name
          })
          localStorage.setItem('activeClientsList', JSON.stringify(clientActiveList))
          commit('refreshActiveClients', { count, clientActiveList })
        })
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
