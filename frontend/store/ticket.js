export const state = () => ({
  tickets: [],
  tickettypes: [],
  headers: []
})
export const mutations = {
  updateTickettype (state, payload) {
    state.tickets[payload.index].tickettype = payload.tickettype
  },
  getTicketsFromDatabase (state, ticketList) {
    try {
      state.tickets = ticketList
    } catch (error) {
      throw new Error(`TICKET MUTATE ${error}`)
    }
  },
  getTickettypes (state, tickettypesList) {
    try {
      state.tickettypes = tickettypesList
    } catch (error) {
      throw new Error(`TICKETTYPE MUTATE ${error}`)
    }
  },
  getHeadersByClienttype (state, clienttype) {
    if (clienttype === 'INTERNET') {
      state.headers = [
        { text: 'Estado', sortable: false, value: 'active', width: '5%' },
        { text: 'Codigo', sortable: false, value: 'client.code', width: 60, align: ' d-none d-lg-table-cell' },
        { text: 'Cédula', sortable: false, value: 'client.dni', width: 60, align: ' d-none d-lg-table-cell' },
        { text: 'Cliente', sortable: false, value: 'client.name' },
        { text: 'Dirección', sortable: false, value: 'client.address', align: ' d-none d-lg-table-cell' },
        { text: 'Barrio', sortable: true, value: 'client.neighborhood.name' },
        { text: 'Telefono', sortable: false, value: 'client.phone', align: ' d-none d-lg-table-cell' },
        { text: 'Tec.', sortable: false, value: 'client.technology.name', align: ' d-none d-lg-table-cell' },
        { text: 'Tipo', sortable: false, value: 'tickettype.name' },
        { text: 'Creado por', sortable: false, value: 'assignated.username', align: ' d-none d-lg-table-cell' },
        { text: 'Observaciones', sortable: false, value: 'details', width: 400, align: ' d-none d-lg-table-cell' },
        { text: 'Creado el', sortable: false, value: 'createdAt', align: ' d-none d-lg-table-cell' },
        { text: 'Acciones', sortable: false, value: 'actions', align: ' d-none d-lg-table-cell' }
      ]
    } else {
      state.headers = [
        { text: 'Estado', sortable: false, value: 'active', width: '5%' },
        { text: 'Codigo', sortable: false, value: 'client.code', width: 60, align: ' d-none d-lg-table-cell' },
        { text: 'Cédula', sortable: false, value: 'client.dni', width: 60, align: ' d-none d-lg-table-cell' },
        { text: 'Cliente', sortable: false, value: 'client.name' },
        { text: 'Dirección', sortable: false, value: 'client.address', align: ' d-none d-lg-table-cell' },
        { text: 'Barrio', sortable: true, value: 'client.neighborhood.name' },
        { text: 'Telefono', sortable: false, value: 'client.phone', align: ' d-none d-lg-table-cell' },
        { text: 'Creado por', sortable: false, value: 'tickettype.name' },
        { text: 'Operador', sortable: false, value: 'assignated.username', align: ' d-none d-lg-table-cell' },
        { text: 'Observaciones', sortable: false, value: 'details', width: 400, align: ' d-none d-lg-table-cell' },
        { text: 'Creado el', sortable: false, value: 'createdAt', align: ' d-none d-lg-table-cell' },
        { text: 'Acciones', sortable: false, value: 'actions', align: ' d-none d-lg-table-cell' }
      ]
    }
  },
  updateTicketStatus (state, ticket) {
    try {
      state.tickets[ticket.editindex].active = !ticket.closeTicket
    } catch (error) {
      throw new Error(`TICKET MUTATE ${error}`)
    }
  }
}
export const actions = {
  async getTicketsFromDatabase ({ commit }, { city, clienttype, token, active, retired }) {
    try {
      let filters = null
      if (retired) {
        filters = {
          city: {
            name: {
              $eq: city
            }
          },
          active: {
            $eq: !active
          },
          tickettype: {
            name: {
              $eq: 'RETIRO'
            }
          },
          clienttype: {
            name: {
              $eq: clienttype
            }
          }
        }
      } else {
        filters = {
          city: {
            name: {
              $eq: city
            }
          },
          active: {
            $eq: !active
          },
          tickettype: {
            name: {
              $ne: 'RETIRO'
            }
          },
          clienttype: {
            name: {
              $eq: clienttype
            }
          }
        }
      }
      const qs = require('qs')
      const query = qs.stringify({
        filters,
        populate: [
          'client',
          'client.neighborhood',
          'client.technology',
          'city',
          'tickettype',
          'clienttype',
          'assignated',
          'ticketdetails',
          'ticketdetails.operator'
        ],
        sort: ['createdAt:desc']
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}tickets?${query}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then((tickets) => {
          const ticketList = tickets.data.map((ticket) => {
            if (clienttype === 'TELEVISION') {
              ticket.attributes.id = ticket.id
              ticket.attributes.client.data.attributes.id = ticket.attributes.client.data.id
              ticket.attributes.client = ticket.attributes.client.data.attributes
              ticket.attributes.city.data.attributes.id = ticket.attributes.city.data.id
              ticket.attributes.city = ticket.attributes.city.data.attributes
              ticket.attributes.client.neighborhood.data.attributes.id = ticket.attributes.client.neighborhood.data.id
              ticket.attributes.client.neighborhood = ticket.attributes.client.neighborhood.data.attributes
              ticket.attributes.tickettype.data.attributes.id = ticket.attributes.tickettype.data.id
              ticket.attributes.tickettype = ticket.attributes.tickettype.data.attributes
              ticket.attributes.clienttype.data.attributes.id = ticket.attributes.clienttype.data.id
              ticket.attributes.clienttype = ticket.attributes.clienttype.data.attributes
              ticket.attributes.assignated.data.attributes.id = ticket.attributes.assignated.data.id
              ticket.attributes.assignated = ticket.attributes.assignated.data.attributes
              ticket.attributes.ticketdetails.data.forEach((ticketdetail) => {
                ticketdetail.attributes.id = ticketdetail.id
                ticketdetail = ticketdetail.attributes
              })
            } else {
              ticket.attributes.id = ticket.id
              ticket.attributes.client.data.attributes.id = ticket.attributes.client.data.id
              ticket.attributes.client = ticket.attributes.client.data.attributes
              ticket.attributes.city.data.attributes.id = ticket.attributes.city.data.id
              ticket.attributes.city = ticket.attributes.city.data.attributes
              ticket.attributes.client.neighborhood.data.attributes.id = ticket.attributes.client.neighborhood.data.id
              ticket.attributes.client.neighborhood = ticket.attributes.client.neighborhood.data.attributes
              ticket.attributes.client.technology.data.attributes.id = ticket.attributes.client.technology.data.id
              ticket.attributes.client.technology = ticket.attributes.client.technology.data.attributes
              ticket.attributes.tickettype.data.attributes.id = ticket.attributes.tickettype.data.id
              ticket.attributes.tickettype = ticket.attributes.tickettype.data.attributes
              ticket.attributes.clienttype.data.attributes.id = ticket.attributes.clienttype.data.id
              ticket.attributes.clienttype = ticket.attributes.clienttype.data.attributes
              ticket.attributes.assignated.data.attributes.id = ticket.attributes.assignated.data.id
              ticket.attributes.assignated = ticket.attributes.assignated.data.attributes
              ticket.attributes.ticketdetails.data.forEach((ticketdetail) => {
                ticketdetail.attributes.id = ticketdetail.id
                ticketdetail = ticketdetail.attributes
              })
            }
            if (ticket.attributes.ticketdetails.data.length > 0) {
              ticket.attributes.details = ticket.attributes.ticketdetails.data.slice(-1)[0].attributes.operator.data.attributes.username + ': ' + ticket.attributes.ticketdetails.data.slice(-1)[0].attributes.details
            }
            return ticket.attributes
          })
          localStorage.setItem('tickets', JSON.stringify(ticketList))
          commit('getTicketsFromDatabase', ticketList)
          commit('getHeadersByClienttype', clienttype)
          return ticketList
        })
    } catch (error) {
      throw new Error(`TICKET ACTION ${error}`)
    }
  },
  async getTickettypes ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      filters: {
        clienttypes: {
          name: payload.clienttype
        }
      },
      pagination: {
        page: 1,
        pageSize: 1000
      }
    },
    {
      encodeValuesOnly: true
    })
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}tickettypes?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((tickettypes) => {
        const tt = tickettypes.data.map((tickettype) => {
          tickettype.attributes.id = tickettype.id
          tickettype = tickettype.attributes
          return tickettype
        })
        commit('getTickettypes', tt)
      })
  },
  async saveTickettype ({ _ }, payload) {
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}tickets/${payload.ticketid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        data: {
          tickettype: payload.tickettypeid
        }
      })
    })
      .then(res => res.json())
      .then((_) => {
        this.$toast.info('Tipo de Ticket actualizado con exito', { duration: 4000, position: 'top-center' })
      })
  }
}
