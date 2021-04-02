import gql from 'graphql-tag'
export const state = () => ({
  clientCount: {
    active: 0,
    clientCount: 0,
    clientCountActive: 0,
    clientCountDisable: 0
  }
})
export const mutations = {
  activeClients (state, res) {
    try {
      state.clientCount.active = res.data.ActiveClients.length
    } catch (error) {
      throw new Error(`ACTIVECOUNT MUTATE ${error}`)
    }
  },
  clientCount (state, res) {
    try {
      state.clientCount.clientCount = res.data.clientCount
    } catch (error) {
      throw new Error(`CLIENTCOUNT MUTATE ${error}`)
    }
  },
  clientCountActive (state, res) {
    try {
      state.clientCount.clientCountActive = res.data.clientCountActive
    } catch (error) {
      throw new Error(`CLIENTCOUNTACTIVE MUTATE ${error}`)
    }
  },
  clientCountDisable (state, res) {
    try {
      state.clientCount.clientCountDisable = res.data.clientCountDisable
    } catch (error) {
      throw new Error(`CLIENTCOUNTDISABLE MUTATE ${error}`)
    }
  }
}
export const actions = {
  activeClients ({ commit }, city) {
    const apollo = this.app.apolloProvider.defaultClient
    try {
      apollo.query({
        query: gql`query ($city: String){
          ActiveClients(city: $city){
            name
          }
        }
      `,
        variables: {
          city
        }
      }).then((res) => {
        commit('activeClients', res)
      })
    } catch (error) {
      throw new Error(`ACTIVECOUNT ACTION ${error}`)
    }
  },
  clientCount ({ commit }, city) {
    const apollo = this.app.apolloProvider.defaultClient
    try {
      apollo.query({
        query: gql`query ($city: String){
          clientCount(city: $city)
        }
      `,
        variables: {
          city
        }
      }).then((res) => {
        commit('clientCount', res)
      })
    } catch (error) {
      throw new Error(`CLIENTCOUNT ACTION ${error}`)
    }
  },
  clientCountActive ({ commit }, city) {
    const apollo = this.app.apolloProvider.defaultClient
    try {
      apollo.query({
        query: gql`query ($city: String){
          clientCountActive(city: $city)
        }
      `,
        variables: {
          city
        }
      }).then((res) => {
        commit('clientCountActive', res)
      })
    } catch (error) {
      throw new Error(`CLIENTCOUNTACTIVE ACTION ${error}`)
    }
  },
  clientCountDisable ({ commit }, city) {
    const apollo = this.app.apolloProvider.defaultClient
    try {
      apollo.query({
        query: gql`query ($city: String){
          clientCountDisable(city: $city)
        }
      `,
        variables: {
          city
        }
      }).then((res) => {
        commit('clientCountDisable', res)
      })
    } catch (error) {
      throw new Error(`CLIENTCOUNTDISABLE ACTION ${error}`)
    }
  }
}
