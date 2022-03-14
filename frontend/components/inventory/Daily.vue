<template>
  <v-row>
    <v-col cols="6">
      <v-card class="elevation-0">
        <v-card-title>
          Entregar
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-autocomplete
                v-model="dispense.technician"
                :disabled="!(!$isAdmin() || !$isBiller())"
                item-text="username"
                item-value="id"
                :items="operatorList"
                label="Entregar a"
                outlined
                dense
                hide-details
              />
            </v-col>
            <v-col>
              <v-select
                v-model="dispense.materialhistorytype"
                :disabled="!(!$isAdmin() || !$isBiller())"
                item-text="name"
                item-value="id"
                :items="materialHistoryTypeList"
                return-object
                label="Tipo de Operacion"
                outlined
                dense
                hide-details
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="8">
              <v-autocomplete
                v-model="dispense.material"
                :disabled="!(!$isAdmin() || !$isBiller())"
                item-text="name"
                item-value="id"
                :items="materialList"
                return-object
                label="Material"
                outlined
                dense
                hide-details
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model.number="dispense.quantity"
                label="Cantidad"
                type="number"
                outlined
                dense
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col class="pt-0">
              <v-textarea
                v-model="dispense.description"
                label="Detalles adicionales (OPCIONAL)"
                rows="2"
                outlined
                dense
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                color="red darken-4"
                class="elevation-0 white--text"
                rounded
                :loading="loading"
                :disabled="loading"
                @click="dispenseMaterial()"
              >
                Entregar
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="6">
      <v-card class="elevation-0">
        <v-card-title>
          Devolver
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-autocomplete
                v-model="returned.technician"
                :disabled="!(!$isAdmin() || !$isBiller())"
                item-text="username"
                item-value="id"
                :items="operatorList"
                label="Devolvio"
                outlined
                dense
                hide-details
              />
            </v-col>
            <v-col>
              <v-select
                v-model="returned.materialhistorytype"
                :disabled="!(!$isAdmin() || !$isBiller())"
                item-text="name"
                item-value="id"
                :items="materialHistoryTypeListReturn"
                return-object
                label="Tipo de Operacion"
                outlined
                dense
                hide-details
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="8">
              <v-autocomplete
                v-model="returned.material"
                :disabled="!(!$isAdmin() || !$isBiller())"
                item-text="name"
                item-value="id"
                :items="materialList"
                return-object
                label="Material"
                outlined
                dense
                hide-details
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model.number="returned.quantity"
                label="Cantidad"
                type="number"
                outlined
                dense
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                color="blue darken-4"
                class="elevation-0"
                rounded
                :loading="loading"
                :disabled="loading"
                @click="returnMaterial()"
              >
                Devolver
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data () {
    return {
      dispense: {
        material: null,
        quantity: 0,
        materialhistorytype: null,
        operator: this.$store.state.auth.id,
        technician: null
      },
      returned: {
        material: null,
        quantity: 0,
        materialhistorytype: null,
        operator: this.$store.state.auth.id,
        technician: null
      },
      loading: false
    }
  },
  computed: {
    operatorList () {
      return this.$store.state.inventory.operatorList
    },
    materialList () {
      return this.$store.state.inventory.materialList
    },
    materialHistoryTypeList () {
      return this.$store.state.inventory.materialHistoryTypeList
    },
    materialHistoryTypeListReturn () {
      return this.$store.state.inventory.materialHistoryTypeListReturn
    }
  },
  mounted () {
    this.getOperatorList()
    this.getMaterialList()
    this.getMaterialHistoryTypeList()
  },
  methods: {
    getOperatorList () {
      this.$store.dispatch('inventory/getOperatorList', { token: this.$store.state.auth.token, city: this.$route.query.city })
    },
    getMaterialList () {
      this.$store.dispatch('inventory/getMaterialList', { token: this.$store.state.auth.token, city: this.$route.query.city, pagination: { page: 1, pageSize: 1000 } })
    },
    getMaterialHistoryTypeList () {
      this.$store.dispatch('inventory/getMaterialHistoryTypeList', { token: this.$store.state.auth.token, city: this.$route.query.city })
    },
    async dispenseMaterial () {
      this.loading = !this.loading
      if (!this.dispense.material || !this.dispense.materialhistorytype || !this.dispense.quantity || !this.dispense.technician) {
        this.$toast.error('Rellena todos los campos antes de continuar', { position: 'top-center' })
        this.loading = !this.loading
        return
      }
      if (this.dispense.material.quantity < this.dispense.quantity) {
        this.$toast.error('No hay suficiente material para dispensar', { position: 'top-center' })
        this.loading = !this.loading
        return
      }
      await this.$store.dispatch('inventory/createOperationHistory', { token: this.$store.state.auth.token, city: this.$route.query.city, data: this.dispense })
      await this.$store.dispatch('inventory/updateCurrentMaterialQuantity', { token: this.$store.state.auth.token, city: this.$route.query.city, data: this.dispense, action: 'add' })
      await this.$store.dispatch('inventory/getMaterialHistoryList', { token: this.$store.state.auth.token, city: this.$route.query.city, pagination: { page: 1, pageCount: 1, pageSize: 10 } })
      await this.$store.dispatch('inventory/getMaterialList', { token: this.$store.state.auth.token, city: this.$route.query.city, pagination: { page: 1, pageCount: 1, pageSize: 24 } })
      this.getMaterialList()
      this.resetFields()
      this.loading = !this.loading
    },
    async returnMaterial () {
      this.loading = !this.loading
      if (!this.returned.material || !this.returned.materialhistorytype || !this.returned.quantity || !this.returned.technician) {
        this.$toast.error('Rellena todos los campos antes de continuar', { position: 'top-center' })
        this.loading = !this.loading
        return
      }
      await this.$store.dispatch('inventory/createOperationHistory', { token: this.$store.state.auth.token, city: this.$route.query.city, data: this.returned })
      await this.$store.dispatch('inventory/updateCurrentMaterialQuantity', { token: this.$store.state.auth.token, city: this.$route.query.city, data: this.returned, action: 'return' })
      await this.$store.dispatch('inventory/getMaterialHistoryList', { token: this.$store.state.auth.token, city: this.$route.query.city, pagination: { page: 1, pageCount: 1, pageSize: 10 } })
      await this.$store.dispatch('inventory/getMaterialList', { token: this.$store.state.auth.token, city: this.$route.query.city, pagination: { page: 1, pageCount: 1, pageSize: 24 } })
      this.getMaterialList()
      this.resetFields()
      this.loading = !this.loading
    },
    resetFields () {
      this.dispense.material = null
      this.dispense.quantity = null
      this.dispense.materialhistorytype = null
      this.dispense.technician = null
      this.returned.material = null
      this.returned.quantity = null
      this.returned.materialhistorytype = null
      this.returned.technician = null
    }
  }
}
</script>
