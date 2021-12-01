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
            Naps en {{ currentCity.name }}
          </v-card-title>
          <client-only>
            <v-data-table
              :headers="headers"
              :items="napList"
              :item-class="itemRowBackground"
              :item-selected="selectedItem"
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
      { text: 'Puertos', value: 'ports' },
      { text: 'Barrio', value: 'neighborhood.name' },
      { text: 'Direccion', value: 'address' },
      { text: 'Tec.', value: 'technology.name' }
    ]
  }),
  computed: {
    currentCity () {
      // eslint-disable-next-line eqeqeq
      return this.$store.state.cities ? this.$store.state.cities.find(c => c.id == this.$route.query.city) : ''
    },
    napList () {
      return this.$store.state.nap.naps
    }
  },
  mounted () {
    this.$store.dispatch('nap/getNaps', this.$route.query.city)
  },
  methods: {
    selectedItem (item) {
      console.log('item', item)
    },
    showNapInfo (value) {
      this.$emit('showNapInfo', value)
    },
    itemRowBackground () {
      if (this.$vuetify.theme.dark) {
        return 'selected'
      }
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
.selected {
  background-color: #2b3f2b;
}
</style>
