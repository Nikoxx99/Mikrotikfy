import gqlt from 'graphql-tag'
export const state = () => ({
  clients: []
})
export const mutations = {
  calculateClientStatus (state, newState) {
    state.clients = newState
  },
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
      Object.assign(state.clients[index], client)
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
  async insertClient ({ commit }, client) {
    try {
      // Object.assign(state.clients[0], client)
      await commit('insertClient', client)
    } catch (error) {
      throw new Error(`INSERT CLIENT MUTATE ${error}`)
    }
  },
  async calculateClientStatus ({ state, commit }, payload) {
    const newState = await state.clients.map((client) => {
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
      const clients = await this.$strapi.find('searchClient', {
        search: payload.search,
        limit: payload.limit,
        city: payload.city
      })
      commit('getUsersFromDatabase', clients)
    } catch (error) {
      throw new Error(`ACTION ${error}`)
    }
  },
  setPlanFromModal ({ commit }, payload) {
    const apollo = this.app.apolloProvider.defaultClient
    try {
      apollo.mutate({
        mutation: gqlt`mutation ($id: String, $plan: String, $isRx: Boolean, $operator: String){
          editClientPlan(id: $id, plan: $plan, isRx: $isRx, operator: $operator)
        }`,
        variables: {
          id: payload.clientId,
          plan: payload.newPlan.id,
          isRx: payload.isRx,
          operator: payload.operator
        }
      }).then((data) => {
        commit('updateFromModal', data)
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
              technology: client.technology.id,
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
