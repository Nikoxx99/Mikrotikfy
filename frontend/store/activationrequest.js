export const state = () => ({
  activationrequests: []
})
export const mutations = {
  getActivationRequestsFromDatabase (state, activationrequests) {
    try {
      state.activationrequests = activationrequests
    } catch (error) {
      throw new Error(`ACTIVATION REQUESTS MUTATE ${error}`)
    }
  },
  updateActivationRequest (state, { index, activationrequest }) {
    try {
      state.activationrequests[index].active = !activationrequest.active
    } catch (error) {
      throw new Error(`ACTIVATION REQUESTS MUTATE ${error}`)
    }
  }
}
export const actions = {
  async getActivationRequestsFromDatabase ({ commit }, payload) {
    try {
      const qs = require('qs')
      const query = qs.stringify({
        populate: [
          'operator',
          'client',
          'client.neighborhood'
        ]
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}activationrequests?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        }
      })
        .then(res => res.json())
        .then((activationrequests) => {
          localStorage.setItem('activationrequests', JSON.stringify(activationrequests.data))
          commit('getActivationRequestsFromDatabase', activationrequests.data)
        })
    } catch (error) {
      throw new Error(`ACTIVATION REQUESTS ACTION ${error}`)
    }
  },
  async updateActivationRequest ({ commit }, payload) {
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}activationrequests/${payload.activationrequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        },
        body: JSON.stringify({ data: { active: !payload.activationrequest.active } })
      })
      commit('updateActivationRequest', { index: payload.index, activationrequest: payload.activationrequest })
    } catch (error) {
      throw new Error(`ACTIVATION REQUESTS ACTION ${error}`)
    }
  },
  async createClientOnMikrotikById ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      populate: [
        'neighborhood',
        'plan',
        'technology',
        'city'
      ]
    },
    {
      encodeValuesOnly: true
    })
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}clients/${payload.clientid}?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then(async (client) => {
        await fetch(`${this.$config.API_STRAPI_ENDPOINT}admincreate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${payload.token}`
          },
          body: JSON.stringify({
            data: { ...client, operator: payload.operator }
          })
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
          throw new Error(`ADMINCREATE ACTION ${error}`)
        })
      })
  }
}
