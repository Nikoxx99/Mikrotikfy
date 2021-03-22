import gql from 'graphql-tag'
export const state = () => ({
  clients: []
})
export const mutations = {
  getUsersFromDatabase (state, clientsList) {
    try {
      state.clients = clientsList
    } catch (error) {
      throw new Error(`MUTATE ${error}`)
    }
  },
  updateFromModal (state, client) {
    try {
      state.clients[client.index].plan = client.newPlan
    } catch (error) {
      throw new Error(`MUTATE ${error}`)
    }
  },
  setPlanToStoreFromModal (state, planInfo) {
    try {
      state.clients[planInfo.index].plan = planInfo.newPLan
    } catch (error) {
      throw new Error(`PLAN MUTATE ${error}`)
    }
  }
}
export const actions = {
  async getUsersFromDatabase ({ commit }, payload) {
    try {
      const apollo = await this.app.apolloProvider.defaultClient
      apollo.query({
        query: gql`query ($limit: Int, $start: Int, $city: String){
          clients (start: $start, limit: $limit, sort: "createdAt:desc", where: {city: $city}){
            _id
            code
            name
            dni
            address
            neighborhood{
              id
              name
            }
            city{
              id
              name
              ip
            }
            phone
            plan{
              id
              name
            }
            technology{
              id
              name
            }
            wifi_ssid
            wifi_password
            mac_address
            comment
            createdAt
            updatedAt
            operator {
              id
              username
            }
            hasRepeater
            newModel
            nap_onu_address
            opticalPower
            active
            status
          }
        }`,
        variables: {
          city: payload.city,
          start: payload.start,
          limit: payload.limit
        }
      }).then((input) => {
        commit('getUsersFromDatabase', input.data.clients)
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    } catch (error) {
      throw new Error(`ACTION ${error}`)
    }
  },
  async getUsersFromDatabaseBySearch ({ commit }, payload) {
    try {
      const apollo = await this.app.apolloProvider.defaultClient
      apollo.query({
        query: gql`query ($search: String, $limit: Int, $city: String){
          searchClient (search: $search, limit: $limit city: $city){
            _id
            code
            name
            dni
            address
            neighborhood{
              id
              name
            }
            city{
              id
              name
              ip
            }
            phone
            plan{
              id
              name
            }
            technology{
              id
              name
            }
            wifi_ssid
            wifi_password
            mac_address
            comment
            created_at
            operator {
              id
              username
            }
            hasRepeater
            newModel
            nap_onu_address
            opticalPower
            active
            status
          }
        }`,
        variables: {
          search: payload.search,
          limit: payload.limit,
          city: payload.city
        }
      }).then((input) => {
        commit('getUsersFromDatabase', input.data.searchClient)
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    } catch (error) {
      throw new Error(`ACTION ${error}`)
    }
  },
  setPlanFromModal ({ commit }, payload) {
    const apollo = this.app.apolloProvider.defaultClient
    try {
      apollo.mutate({
        mutation: gql`mutation ($id: String, $plan: String, $isRx: Boolean, $operator: String){
          editClientPlan(id: $id, plan: $plan, isRx: $isRx, operator: $operator)
        }`,
        variables: {
          id: payload.clientId,
          plan: payload.newPlan.id,
          isRx: payload.isRx,
          operator: payload.operator
        }
      }).then((data) => {
        commit('updateFromModal', payload)
      })
    } catch (error) {
      throw new Error(`CLIENT ACTION ${error}`)
    }
  }
}
