export const state = () => ({
  tickets: []
})
export const mutations = {
  getTicketsFromDatabase (state, ticketList) {
    try {
      state.tickets = ticketList
    } catch (error) {
      throw new Error(`TICKET MUTATE ${error}`)
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
  async getTicketsFromDatabase ({ commit }, { city, token, active, retired }) {
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
          'assignated',
          'ticketdetails',
          'ticketdetails.operator'
        ]
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
            ticket.attributes.assignated.data.attributes.id = ticket.attributes.assignated.data.id
            ticket.attributes.assignated = ticket.attributes.assignated.data.attributes
            ticket.attributes.ticketdetails.data.forEach((ticketdetail) => {
              ticketdetail.attributes.id = ticketdetail.id
              ticketdetail = ticketdetail.attributes
            })
            if (ticket.attributes.ticketdetails.data.length > 0) {
              ticket.attributes.details = ticket.attributes.ticketdetails.data.slice(-1)[0].attributes.operator.data.attributes.username + ': ' + ticket.attributes.ticketdetails.data.slice(-1)[0].attributes.details
            }
            return ticket.attributes
          })
          localStorage.setItem('tickets', JSON.stringify(ticketList))
          commit('getTicketsFromDatabase', ticketList)
          return ticketList
        })
    } catch (error) {
      throw new Error(`TICKET ACTION ${error}`)
    }
  }
}
