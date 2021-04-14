import gql from 'graphql-tag'
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
  }
}
export const actions = {
  async getTicketsFromDatabase ({ commit }, { city, limit }) {
    try {
      const apollo = this.app.apolloProvider.defaultClient
      await apollo.query({
        query: gql`query($limit: Int, $city: String){
          tickets(limit: $limit, sort:"createdAt:desc",where: {
            city:$city
          }){
            id
            active
            client{
              id
              code
              name
              address
              neighborhood{
                name
              }
              phone
              technology{
                name
              }
            }
            tickettype{
              name
            }
            assiganted{
              username
            }
            details
            createdAt
          }
        }
      `,
        variables: {
          limit,
          city
        }
      }).then((input) => {
        localStorage.setItem('tickets', JSON.stringify(input.data.tickets))
        commit('getTicketsFromDatabase', input.data.tickets)
      })
    } catch (error) {
      throw new Error(`TICKET ACTION ${error}`)
    }
  }
}
