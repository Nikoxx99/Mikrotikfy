<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          :block="block"
          :text="!block"
          :x-small="!block"
          :color="$vuetify.theme.dark && !block ? 'white' : 'primary'"
          v-on="on"
          @click="initComponent()"
        >
          <v-icon>mdi-router-wireless</v-icon>
          <span v-if="block">
            Ver Equipos
          </span>
        </v-btn>
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
          <CreateDevice :clientid="String(clientid)" @createDevice="updateDeviceList($event)" />
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
    <v-snackbar
      v-model="snack"
      :timeout="4000"
      :color="snackColor"
      bottom
      vertical
    >
      {{ snackText }}

      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
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
    },
    block: {
      type: Boolean,
      default: false
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
      this.snack = true
      this.snackText = 'Dispositivo agregado correctamente'
      this.snackColor = 'info'
    },
    async initComponent () {
      this.modal = true
      this.loading = false
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          clients: {
            id: {
              $eq: this.clientid
            }
          }
        },
        populate: [
          'devicebrand'
        ]
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}devices?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        }
      })
        .then(res => res.json())
        .then((devices) => {
          const deviceRes = devices.data.map((device) => {
            device.attributes.devicebrand = device.attributes.devicebrand.data.attributes
            device.attributes.id = device.id
            device = device.attributes
            return device
          })
          this.devices = deviceRes
        })
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
    }
  }
}
</script>

<style>

</style>
