<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          v-bind="attrs"
          :color="$vuetify.theme.dark ? 'white' : 'primary'"
          v-on="on"
          @click="initComponent()"
        >
          mdi-router-wireless
        </v-icon>
      </template>
      <span>Router/ONU</span>
    </v-tooltip>
    <v-dialog
      v-model="modal"
      max-width="990"
    >
      <v-card
        :loading="loading"
      >
        <v-card-title class="headline">
          Equipos asociados
        </v-card-title>
        <v-card-text>
          <CreateDevice :clientid="clientid" @createDevice="updateDeviceList($event)" />
        </v-card-text>
        <div v-if="!loading">
          <v-card-text>
            <client-only>
              <h3>{{ name }}</h3>
              <v-data-table
                :headers="headers"
                :items="devices"
                :items-per-page="itemsPerPage"
                sort-by="createdAt"
                calculate-widths
                sort-desc
                :page.sync="page"
                no-data-text="No hay equipos para mostrar aun..."
                loading-text="Cargando información de equipos..."
                dense
                hide-default-footer
                mobile-breakpoint="100"
                @page-count="pageCount = $event"
              />
            </client-only>
            <div class="text-center pt-2">
              <v-pagination v-model="page" :length="pageCount" />
            </div>
          </v-card-text>
        </div>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="modal = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
export default {
  name: 'Devices',
  props: {
    name: {
      type: String,
      default: 'Devices'
    },
    clientid: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    modal: false,
    loading: true,
    page: 1,
    pageCount: 0,
    itemsPerPage: 10,
    snack: false,
    snackText: '',
    snackColor: '',
    devices: [],
    headers: [
      { text: 'Mac', sortable: true, value: 'mac_address' },
      { text: 'Marca', sortable: true, value: 'devicebrand.name' }
    ]
  }),
  methods: {
    updateDeviceList (device) {
      this.devices.push(device)
    },
    async initComponent () {
      this.modal = true
      this.loading = false
      // eslint-disable-next-line camelcase
      const devices = await this.$strapi.graphql({
        query: `query($client: ID!) {
          client(id: $client) {
            mac_addresses{
              mac_address
              devicebrand{
                name
              }
              createdAt
            }
          }
        }`,
        variables: {
          client: '5f52e6f1f039323c302940de'
        }
      })
      // eslint-disable-next-line camelcase
      this.devices = devices.client.mac_addresses
    },
    getDate (date) {
      const dateObject = new Date(date)
      const humanDateFormat = dateObject.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })
      return humanDateFormat
    },
    getColor (state) {
      if (state) {
        return 'blue darken-4'
      } else {
        return 'red'
      }
    },
    getState (state) {
      if (state) {
        return 'Abierto'
      } else {
        return 'Cerrado'
      }
    },
    can (component) {
      // eslint-disable-next-line camelcase
      const allowed_components = this.role
      // eslint-disable-next-line camelcase
      const current_component = component
      return allowed_components.includes(current_component)
    }
  }
}
</script>

<style>

</style>
