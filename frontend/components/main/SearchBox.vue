<template>
  <v-row class="mb-1 justify-center">
    <v-col
      cols="12"
      xs="12"
      sm="8"
      md="6"
      lg="6"
      xl="6"
    >
      <v-card class="rounded-xl">
        <v-card-title
          outline
          class="text-center"
          :style="`border-bottom:solid 1px white`"
        >
          Buscar Cliente
        </v-card-title>
        <v-card-text>
          <v-row
            class="mx-1 mt-4 mb-1 justify-center"
          >
            <v-btn
              color="white black--text"
              dark
              :loading="loadingDataTable"
              class="mr-2"
              large
              style="margin-top:7px;"
              @click="getClientBySearch()"
            >
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
            <v-text-field
              ref="searchClient"
              v-model="searchClientInput"
              :label="loadingDataTable ? 'Cargando... Por favor espere.' : 'Por código, nombre, barrio o dirección'"
              single-line
              hide-details
              filled
              rounded
              :loading="loadingDataTable"
              :disabled="loadingDataTable"
              class="white--text"
              style="max-width: 600px"
              @keyup.enter="getClientBySearch()"
            />
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
export default {
  name: 'SearchBox',
  data () {
    return {
      searchClientInput: '',
      loadingDataTable: false
    }
  },
  computed: {
    currentCity () {
      // eslint-disable-next-line eqeqeq
      return this.$store.state.cities ? this.$store.state.cities.find(c => c.id == this.$route.query.city) : ''
    }
  },
  methods: {
    getClientBySearch () {
      if (this.searchClientInput) {
        this.loadingDataTable = true
        this.$router.push({
          path: '/clients/' + this.searchClientInput + '?city=' + this.$route.query.city
        })
        this.$emit('search', this.searchClientInput)
        this.loadingDataTable = false
      } else {
        this.$router.push({
          path: '/clients'
        })
        this.$emit('search', '')
        this.loadingDataTable = false
      }
    }
  }
}
</script>
