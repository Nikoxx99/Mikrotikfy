import gql from 'graphql-tag'
export const state = () => ({
  clientCount: []
})
export const mutations = {
  activeClients (state, res) {
    console.log(res.data.ActiveClients.length)
    try {
      state.clientCount.push(res.data.ActiveClients.length)
    } catch (error) {
      throw new Error(`CLIENTCOUNT MUTATE ${error}`)
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
      throw new Error(`CLIENTCOUNT ACTION ${error}`)
    }
  }
}
