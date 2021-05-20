import gqlt from 'graphql-tag'
export const state = () => ({
  clientCount: {
    active: 0,
    clientCount: 0,
    clientCountActive: 0,
    clientCountDisable: 0,
    clientCountRetired: 0
  }
})
export const mutations = {
  activeClients (state, res) {
    try {
      state.activeClients = res.data.ActiveClients.length
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
  },
  clientCountRetired (state, res) {
    try {
      state.clientCount.clientCountRetired = res.data.clientCountRetired
    } catch (error) {
      throw new Error(`CLIENTCOUNTRETIRED MUTATE ${error}`)
    }
  }
}
export const actions = {
  async activeClients ({ commit }, city) {
    const apollo = this.app.apolloProvider.defaultClient
    try {
      await apollo.query({
        query: gqlt`query ($city: String){
          ActiveClients(city: $city){
            name
          }
        }
      `,
        variables: {
          city
        }
      }).then(async (res) => {
        localStorage.setItem('activeClients', res.data.ActiveClients.length)
        const clientActiveList = await res.data.ActiveClients.map((c) => {
          return c.name
        })
        localStorage.setItem('activeClientsList', JSON.stringify(clientActiveList))
        commit('activeClients', res)
      })
    } catch (error) {
      throw new Error(`ACTIVECOUNT ACTION ${error}`)
    }
  },
  async clientCount ({ commit }, city) {
    const apollo = this.app.apolloProvider.defaultClient
    try {
      await apollo.query({
        query: gqlt`query ($city: String){
          clientCount(city: $city)
        }
      `,
        variables: {
          city
        }
      }).then((res) => {
        localStorage.setItem('clientCount', res.data.clientCount)
        commit('clientCount', res)
      })
    } catch (error) {
      throw new Error(`CLIENTCOUNT ACTION ${error}`)
    }
  },
  async clientCountActive ({ commit }, city) {
    const apollo = this.app.apolloProvider.defaultClient
    try {
      await apollo.query({
        query: gqlt`query ($city: String){
          clientCountActive(city: $city)
        }
      `,
        variables: {
          city
        }
      }).then((res) => {
        localStorage.setItem('clientCountActive', res.data.clientCountActive)
        commit('clientCountActive', res)
      })
    } catch (error) {
      throw new Error(`CLIENTCOUNTACTIVE ACTION ${error}`)
    }
  },
  async clientCountDisable ({ commit }, city) {
    const apollo = this.app.apolloProvider.defaultClient
    try {
      await apollo.query({
        query: gqlt`query ($city: String){
          clientCountDisable(city: $city)
        }
      `,
        variables: {
          city
        }
      }).then((res) => {
        localStorage.setItem('clientCountDisable', res.data.clientCountDisable)
        commit('clientCountDisable', res)
      })
    } catch (error) {
      throw new Error(`CLIENTCOUNTDISABLE ACTION ${error}`)
    }
  },
  async clientCountRetired ({ commit }, city) {
    const apollo = this.app.apolloProvider.defaultClient
    try {
      await apollo.query({
        query: gqlt`query ($city: String){
          clientCountRetired(city: $city)
        }
      `,
        variables: {
          city
        }
      }).then((res) => {
        localStorage.setItem('clientCountRetired', res.data.clientCountRetired)
        commit('clientCountRetired', res)
      })
    } catch (error) {
      throw new Error(`CLIENTCOUNTRETIRED ACTION ${error}`)
    }
  }
}
