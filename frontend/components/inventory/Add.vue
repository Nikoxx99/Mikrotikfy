<template>
  <div>
    <v-btn
      small
      class="ml-2"
      color="primary"
      @click="modal = true"
    >
      <v-icon>{{ type.icon }}</v-icon>
      <span>{{ type.name }}</span>
    </v-btn>
    <v-dialog
      v-model="modal"
      max-width="590"
    >
      <v-row>
        <v-col>
          <v-card class="elevation-0">
            <v-card-title>
              Agregar Material {{ type.name }}
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="8">
                  <v-autocomplete
                    v-model="add.material"
                    :disabled="!(!$isAdmin() || !$isBiller())"
                    item-text="name"
                    item-value="id"
                    :items="`materialList${type.id}`"
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
      </v-row>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      modal: false,
      add: {
        material: null,
        materialtype: null,
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
      this.$store.dispatch('inventory/getMaterialList', { token: this.$store.state.auth.token, city: this.$route.query.city, materialType: this.type, pagination: { page: 1, pageSize: 1000 } })
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
    resetFields () {
      this.add.material = null
      this.add.quantity = 0
    }
  }
}
</script>
