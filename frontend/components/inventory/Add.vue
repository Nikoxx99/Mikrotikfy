<template>
  <v-row>
    <v-col>
      <v-card class="elevation-0">
        <v-card-title>
          Agregar Material
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="8">
              <v-autocomplete
                v-model="add.material"
                :disabled="!(!$isAdmin() || !$isBiller())"
                item-text="name"
                item-value="id"
                :items="materialList"
                return-object
                label="Material a agregar"
                outlined
                dense
                hide-details
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model.number="add.quantity"
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
                @click="addMaterial()"
              >
                Agregar
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col>
      <v-card class="elevation-0">
        <v-card-title>
          Agregar Item
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="8">
              <v-text-field
                v-model="item.name"
                label="Item"
                outlined
                dense
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model.number="item.quantity"
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
                color="success darken-4"
                class="elevation-0"
                rounded
                :loading="loading"
                :disabled="loading"
                @click="addItem()"
              >
                Agregar
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
      add: {
        material: null,
        quantity: 0
      },
      item: {
        name: null,
        quantity: 0
      },
      loading: false
    }
  },
  computed: {
    materialList () {
      return this.$store.state.inventory.materialList
    },
    currentCity () {
      return this.$store.state.cities.find(city => city.name === this.$route.query.city)
    }
  },
  mounted () {
    this.getMaterialList()
  },
  methods: {
    getMaterialList () {
      this.$store.dispatch('inventory/getMaterialList', { token: this.$store.state.auth.token, city: this.$route.query.city, pagination: { page: 1, pageSize: 1000 } })
    },
    async addMaterial () {
      this.loading = !this.loading
      if (!this.add.material || !this.add.quantity) {
        this.$toast.error('Rellena todos los campos antes de continuar', { position: 'top-center' })
        this.loading = !this.loading
        return
      }
      await this.$store.dispatch('inventory/updateCurrentMaterialQuantity', { token: this.$store.state.auth.token, city: this.$route.query.city, data: this.add, action: 'return' })
      this.getMaterialList()
      this.resetFields()
      this.loading = !this.loading
    },
    async addItem () {
      this.loading = !this.loading
      if (!this.item.name) {
        this.$toast.error('Rellena todos los campos antes de continuar', { position: 'top-center' })
        this.loading = !this.loading
        return
      }
      await this.$store.dispatch('inventory/createItem', { token: this.$store.state.auth.token, city: this.currentCity, data: this.item })
      this.getMaterialList()
      this.resetFields()
      this.loading = !this.loading
    },
    resetFields () {
      this.add.material = null
      this.add.quantity = 0
      this.item.name = null
      this.item.quantity = 0
    }
  }
}
</script>
