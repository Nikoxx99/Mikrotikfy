export const state = () => ({
  operatorList: [],
  materialList: [],
  materialHistoryTypeList: [],
  materialHistoryTypeListReturn: []
})
export const mutations = {
  getOperatorList (state, operatorList) {
    try {
      state.operatorList = operatorList
    } catch (error) {
      throw new Error(`OPERATOR LIST MUTATE ${error}`)
    }
  },
  getMaterialList (state, materialList) {
    try {
      state.materialList = materialList
    } catch (error) {
      throw new Error(`MATERIAL LIST MUTATE ${error}`)
    }
  },
  getMaterialHistoryTypeList (state, materialHistoryTypeList) {
    try {
      state.materialHistoryTypeList = materialHistoryTypeList.filter(item => item.name.includes('SALIDA'))
      state.materialHistoryTypeListReturn = materialHistoryTypeList.filter(item => item.name.includes('ENTRADA'))
    } catch (error) {
      throw new Error(`MATERIAL LIST MUTATE ${error}`)
    }
  }
}
export const actions = {
  async getOperatorList ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      pagination: {
        page: 1,
        pageSize: 1000
      }
    },
    {
      encodeValuesOnly: true
    })
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}users?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        }
      })
        .then(res => res.json())
        .then((users) => {
          commit('getOperatorList', users)
        })
    } catch (error) {
      throw new Error(`OPERATOR ACTION ${error}`)
    }
  },
  async getMaterialList ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      pagination: {
        page: 1,
        pageSize: 1000
      }
    },
    {
      encodeValuesOnly: true
    })
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}materials?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        }
      })
        .then(res => res.json())
        .then((res) => {
          const materials = res.data.map((material) => {
            material.attributes.id = material.id
            return material.attributes
          })
          commit('getMaterialList', materials)
        })
    } catch (error) {
      throw new Error(`MATERIALS ACTION ${error}`)
    }
  },
  async getMaterialHistoryTypeList ({ commit }, payload) {
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}materialhistorytypes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        }
      })
        .then(res => res.json())
        .then((res) => {
          const materialhistorytypes = res.data.map((materialhistorytype) => {
            materialhistorytype.attributes.id = materialhistorytype.id
            return materialhistorytype.attributes
          })
          commit('getMaterialHistoryTypeList', materialhistorytypes)
        })
    } catch (error) {
      throw new Error(`MATERIALS ACTION ${error}`)
    }
  },
  async createDispenseHistory (_, payload) {
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}materialhistories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        },
        body: JSON.stringify({
          data: {
            quantity: payload.data.quantity,
            description: payload.data.description,
            material: payload.data.material.id,
            materialhistorytype: payload.data.materialhistorytype.id,
            operator: payload.data.operator,
            technician: payload.data.technician
          }
        })
      })
    } catch (error) {
      this.$toast.error(error, { position: 'top-center' })
      throw new Error(`MATERIALS ACTION ${error}`)
    }
  },
  async updateCurrentMaterialQuantity (_, payload) {
    const finalQuantity = payload.data.material.quantity - payload.data.quantity
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}materials/${payload.data.material.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        },
        body: JSON.stringify({
          data: {
            quantity: finalQuantity
          }
        })
      })
        .then(res => res.json())
        .then((_) => {
          this.$toast.success('OPREACION DE RETIRO DEL INVENTARIO EXITOSA', { position: 'top-center' })
        })
    } catch (error) {
      this.$toast.error(error, { position: 'top-center' })
      throw new Error(`MATERIALS ACTION ${error}`)
    }
  }
}
