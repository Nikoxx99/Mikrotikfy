import gqlt from 'graphql-tag'
export const state = () => ({
  clients: []
})
export const mutations = {
  calculateClientStatus (state, newState) {
    state.clients = newState
  },
  clearClientsFromDatatable (state) {
    state.clients = []
  },
  getUsersFromDatabase (state, clientsList) {
    try {
      state.clients = clientsList.data.results
    } catch (error) {
      throw new Error(`MUTATE SEARCH CLIENT${error}`)
    }
  },
  updateFromModal (state, client) {
    try {
      state.clients[client.index].plan = client.newPlan
    } catch (error) {
      throw new Error(`MUTATE ${error}`)
    }
  },
  adminToggle (state, { client, index }) {
    try {
      state.clients[index].active = !client.active
    } catch (error) {
      throw new Error(`ADMINTOGGLE MUTATE ${error}`)
    }
  },
  updateClient (state, { client, index }) {
    try {
      state.clients[index] = client
    } catch (error) {
      throw new Error(`UPDATE CLIENT MUTATE ${error}`)
    }
  },
  updateClientDevices (state, { device, index }) {
    try {
      state.clients[index].mac_addresses.push(device)
    } catch (error) {
      throw new Error(`UPDATE CLIENT DEVICE MUTATE ${error}`)
    }
  },
  insertClient (state, client) {
    try {
      // Object.assign(state.clients[0], client)
      state.clients.unshift(client)
    } catch (error) {
      throw new Error(`INSERT CLIENT MUTATE ${error}`)
    }
  }
}
export const actions = {
  async clearClientsFromDatatable ({ commit }) {
    try {
      await commit('clearClientsFromDatatable', true)
    } catch (error) {
      throw new Error(`CLEAR CLIENT ACTION ${error}`)
    }
  },
  async insertClient ({ commit }, client) {
    try {
      // Object.assign(state.clients[0], client)
      await commit('insertClient', client)
    } catch (error) {
      throw new Error(`INSERT CLIENT ACTION ${error}`)
    }
  },
  async calculateClientStatus ({ state, commit }, payload) {
    const shallowState = JSON.parse(JSON.stringify(state.clients))
    const newState = await shallowState.map((client) => {
      // eslint-disable-next-line eqeqeq
      const ac = payload.find(c => c == client.code)
      if (ac) {
        client.status = 'green'
        return client
      } else {
        // eslint-disable-next-line eqeqeq
        const ac2 = payload.find(c => c == client.dni)
        if (ac2) {
          client.status = 'green'
          return client
        } else {
          client.status = 'red'
          return client
        }
      }
    })
    commit('calculateClientStatus', newState)
  },
  async getUsersFromDatabase ({ commit }, payload) {
    try {
      const clients = await this.$strapi.find('clients', {
        city: payload.city,
        _limit: payload.limit,
        _start: payload.start,
        _sort: payload.sort ? payload.sort : 'createdAt:desc'
      })
      commit('getUsersFromDatabase', clients)
    } catch (error) {
      throw new Error(`ACTION ${error}`)
    }
  },
  async getUsersFromDatabaseBySearch ({ commit }, payload) {
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}searchclient?search=${payload.search}&city=${payload.city}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        }
      })
        .then(res => res.json())
        .then((clients) => {
          commit('getUsersFromDatabase', clients)
        })
    } catch (error) {
      throw new Error(`ACTION ${error}`)
    }
  },
  updateFromModal ({ commit }, client) {
    try {
      commit('updateFromModal', client)
    } catch (error) {
      throw new Error(`MUTATE ${error}`)
    }
  },
  async setPlanFromModal (_, payload) {
    const apollo = this.app.apolloProvider.defaultClient
    try {
      await apollo.mutate({
        mutation: gqlt`mutation ($id: String, $plan: String, $isRx: Boolean, $operator: String){
          editClientPlan(id: $id, plan: $plan, isRx: $isRx, operator: $operator)
        }`,
        variables: {
          id: payload.clientId,
          plan: payload.newPlan.id,
          isRx: payload.isRx,
          operator: payload.operator
        }
      })
    } catch (error) {
      throw new Error(`CLIENT ACTION ${error}`)
    }
  },
  adminCreate ({ commit }, { client, index }) {
    const apollo = this.app.apolloProvider.defaultClient
    try {
      apollo.mutate({
        mutation: gqlt`mutation ($input: adminCreateInput){
          adminCreate(input: $input)
        }`,
        variables: {
          input: {
            id: client._id,
            code: client.code,
            name: client.name,
            dni: client.dni,
            address: client.address,
            neighborhood: client.neighborhood.id,
            city: client.city.id,
            phone: client.phone,
            plan: client.plan.id,
            wifi_ssid: client.wifi_ssid,
            wifi_password: client.wifi_password,
            technology: client.technology.id,
            mac_address: client.mac_address,
            comment: client.comment
          }
        }
      }).then((client) => {
        commit('adminToggle', { client, index })
      })
    } catch (error) {
      throw new Error(`ADMINCREATE ACTION ${error}`)
    }
  },
  adminDelete ({ commit }, { client, index }) {
    const apollo = this.app.apolloProvider.defaultClient
    try {
      apollo.mutate({
        mutation: gqlt`mutation ($input: adminDeleteInput){
          adminDelete(input: $input)
        }`,
        variables: {
          input: {
            id: client._id
          }
        }
      }).then(() => {
        commit('adminToggle', { client, index })
      })
    } catch (error) {
      throw new Error(`ADMINDELETE ACTION ${error}`)
    }
  },
  updateClient ({ commit }, { client, index, operator }) {
    const apollo = this.app.apolloProvider.defaultClient
    try {
      apollo.mutate({
        mutation: gqlt`mutation ($input: updateClientInput){
          updateClient(input: $input){
            client{
              id
            }
          }
        }`,
        variables: {
          input: {
            where: {
              id: client._id
            },
            data: {
              code: client.code,
              name: client.name,
              dni: client.dni,
              address: client.address,
              neighborhood: client.neighborhood.id,
              phone: client.phone,
              plan: client.plan.id,
              technology: client.technology ? client.technology.id : null,
              wifi_ssid: client.wifi_ssid,
              wifi_password: client.wifi_password,
              comment: client.comment,
              hasRepeater: client.hasRepeater,
              nap_onu_address: client.nap_onu_address,
              opticalPower: client.opticalPower,
              operator,
              newModel: client.newModel
            }
          }
        }
      }).then((_) => {
        commit('updateClient', { client, index })
      })
    } catch (error) {
      throw new Error(`UPDATE USER ACTION ${error}`)
    }
  },
  updateClientDevices ({ commit }, { device, index }) {
    commit('updateClientDevices', { device, index })
  }
}
