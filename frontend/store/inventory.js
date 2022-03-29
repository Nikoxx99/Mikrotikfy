export const state = () => ({
  operatorList: [],
  materialList: [],
  materialTypes: [],
  materialHistoryList: [],
  paginationMaterialList: {},
  paginationMaterialHistoryList: {},
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
  getMaterialList (state, { materials, pagination }) {
    try {
      state.materialList = materials
      state.paginationMaterialList = pagination
    } catch (error) {
      throw new Error(`MATERIAL LIST MUTATE ${error}`)
    }
  },
  getMaterialTypes (state, materialTypes) {
    try {
      state.materialTypes = materialTypes
    } catch (error) {
      throw new Error(`MATERIAL TYPES LIST MUTATE ${error}`)
    }
  },
  getMaterialHistoryList (state, { materialHistories, pagination }) {
    try {
      state.materialHistoryList = materialHistories
      state.paginationMaterialHistoryList = pagination
    } catch (error) {
      throw new Error(`MATERIAL HISTORY LIST MUTATE ${error}`)
    }
  },
  getMaterialHistoryTypeList (state, materialhistorytypes) {
    try {
      state.materialHistoryTypeList = materialhistorytypes.filter(item => item.name.includes('SALIDA'))
      state.materialHistoryTypeListReturn = materialhistorytypes.filter(item => item.name.includes('ENTRADA'))
    } catch (error) {
      throw new Error(`MATERIAL HISTORY TYPE LIST MUTATE ${error}`)
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
      filters: payload.search
        ? {
          name: {
            $contains: payload.search
          }
        }
        : {},
      pagination: payload.pagination,
      populate: ['materialquantities', 'materialquantities.materialtype'],
      sort: payload.sort || payload.sort ? [`${payload.sort.sortBy}:${payload.sort.sortDesc ? 'desc' : 'asc'}`] : ['id:desc']
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
          commit('getMaterialList', { materials, pagination: res.meta.pagination })
        })
    } catch (error) {
      throw new Error(`MATERIALS ACTION ${error}`)
    }
  },
  async getMaterialTypes ({ commit }, payload) {
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}materialtypes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        }
      })
        .then(res => res.json())
        .then((res) => {
          const materialTypes = res.data.map((materialtype) => {
            materialtype.attributes.id = materialtype.id
            return materialtype.attributes
          })
          commit('getMaterialTypes', materialTypes)
        })
    } catch (error) {
      throw new Error(`MATERIAL TYPES ACTION ${error}`)
    }
  },
  async getMaterialHistoryList ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      filters: payload.search ? {
        $or: [
          {
            material: {
              name: {
                $contains: payload.search
              }
            }
          },
          {
            technician: {
              username: {
                $contains: payload.search
              }
            }
          }
        ]
      } : {},
      pagination: payload.pagination,
      populate: ['material', 'material.materialquantities', 'materialhistorytype', 'operator', 'technician'],
      sort: payload.sort || payload.sort ? [`${payload.sort.sortBy}:${payload.sort.sortDesc ? 'desc' : 'asc'}`] : []
    },
    {
      encodeValuesOnly: true
    })
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}materialhistories?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        }
      })
        .then(res => res.json())
        .then((res) => {
          const materialHistories = res.data.map((material) => {
            material.attributes.material.data.attributes.id = material.attributes.material.data.id
            material.attributes.material = material.attributes.material.data.attributes
            material.attributes.materialhistorytype.data.attributes.id = material.attributes.materialhistorytype.data.id
            material.attributes.materialhistorytype = material.attributes.materialhistorytype.data.attributes
            material.attributes.operator.data.attributes.id = material.attributes.operator.data.id
            material.attributes.operator = material.attributes.operator.data.attributes
            material.attributes.technician.data.attributes.id = material.attributes.technician.data.id
            material.attributes.technician = material.attributes.technician.data.attributes
            material.attributes.id = material.id
            return material.attributes
          })
          commit('getMaterialHistoryList', { materialHistories, pagination: res.meta.pagination })
        })
    } catch (error) {
      throw new Error(`MATERIALS HISTORY ACTION ${error}`)
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
  async createOperationHistory (_, payload) {
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
  async createItem (_, payload) {
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        },
        body: JSON.stringify({
          data: {
            name: payload.data.name,
            city: payload.city.id
          }
        })
      }).then((res) => {
        if (res.status === 200) {
          this.$toast.success('Material creado con éxito', { duration: 3000, position: 'top-center' })
        } else {
          this.$toast.error(res.statusText, { position: 'top-center' })
        }
      })
    } catch (error) {
      this.$toast.error(error, { position: 'top-center' })
      throw new Error(`CREATE ITEM ACTION ${error}`)
    }
  },
  async updateCurrentMaterialQuantity (_, payload) {
    console.log(payload)
    const finalQuantity = payload.action === 'add' ? payload.quantity[0].attributes.quantity - payload.data.quantity : payload.quantity[0].attributes.quantity + payload.data.quantity
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}materialquantities/${payload.quantity[0].id}`, {
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
          this.$toast.success('OPERACION DE INVENTARIO EXITOSA, AHORA HAY ' + finalQuantity, { duration: 5000, position: 'top-center' })
        })
    } catch (error) {
      this.$toast.error(error, { position: 'top-center' })
      throw new Error(`MATERIALS ACTION ${error}`)
    }
  },
  async createMaterialQuantity (_, payload) {
    try {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}materialquantities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        },
        body: JSON.stringify({
          data: {
            quantity: payload.data.quantity,
            material: payload.data.material.id,
            materialtype: payload.data.materialtype.id
          }
        })
      })
        .then(res => res.json())
        .then((_) => {
          this.$toast.success('OPERACION DE INVENTARIO EXITOSA, AHORA HAY ' + payload.data.quantity, { duration: 5000, position: 'top-center' })
        })
    } catch (error) {
      this.$toast.error(error, { position: 'top-center' })
      throw new Error(`MATERIALS ACTION ${error}`)
    }
  }
}
