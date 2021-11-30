<template>
  <v-card>
    <form>
      <v-container>
        <v-alert
          v-if="alertBox"
          type="info"
          :class="alertBoxColor"
          tile
          dismissible
        >
          {{ createdMessage }}
        </v-alert>
        <v-card
          tile
        >
          <v-card-title class="blue darken-3">
            Naps en X CIUDAD
          </v-card-title>
          <client-only>
            <v-data-table
              :headers="headers"
              :items="napList"
              sort-by="calories"
              class="elevation-1"
              @click:row="showNapInfo"
            />
          </client-only>
        </v-card>
      </v-container>
    </form>
  </v-card>
</template>

<script>
export default {
  name: 'ListNap',
  data: () => ({
    id: 0,
    name: '',
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false,
    headers: [
      { text: 'Codigo', value: 'code' },
      { text: 'Barrio', value: 'neighborhood.name' },
      { text: 'Direccion', value: 'address' },
      { text: 'Tec.', value: 'technology.name' }
    ]
  }),
  computed: {
    napList () {
      return this.$store.state.nap.naps
    }
  },
  mounted () {
    this.$store.dispatch('nap/getNaps', this.$route.query.city)
  },
  methods: {
    showNapInfo (value) {
      this.$emit('showNapInfo', value)
    },
    editItem (item) {
      this.editedIndex = this.neighborhoods.indexOf(item)
      this.edit.neighborhoods = Object.assign({}, item)
      this.dialogEdit = true
    },
    updateNeighborhood (input) {
    },
    createNeighborhood () {
    }
  }
}
</script>

<style>

</style>
