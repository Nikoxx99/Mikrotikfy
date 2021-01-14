<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          v-bind="attrs"
          color="blue darken-4"
          v-on="on"
          @click="initComponent"
        >
          mdi-server
        </v-icon>
      </template>
      <span>Estatus</span>
    </v-tooltip>
    <v-dialog
      v-if="modal"
      v-model="modal"
      max-width="590"
    >
      <v-card
        :loading="loading"
        :class="online ? 'teal darken-4' : ''"
      >
        <v-card-title class="headline">
          Estatus en Mikrotik
        </v-card-title>
        <div v-if="!loading">
          <v-card-text>
            <h2> {{ name }} </h2>
            <v-alert
              v-if="online"
              dense
              text
              type="success"
              class="my-4"
            >
              El cliente esta <strong>En Linea</strong>
            </v-alert>
            <v-alert
              v-else-if="clientExists"
              dense
              outlined
              type="error"
              class="my-4"
            >
              Fuera de linea desde <strong>{{ offlineTime }}</strong> <br>
              Razón de la desconexión: <strong>{{ disconnectReason }}</strong> <br>
              Última MAC conocida: <strong>{{ lastCallerId }}</strong>
            </v-alert>
            <v-alert
              v-else
              dense
              outlined
              type="warning"
              class="my-4"
            >
              El cliente no se encontró en la Mikrotik
            </v-alert>
            <v-divider class="my-4" />
            <div v-if="online">
              <v-row>
                <v-col>
                  <h3>Acceso: <strong><a :href="`http://${address}`" target="_blank">{{ address }}</a></strong></h3>
                  <v-spacer />
                  <h3>Mac: {{ mac_address }}</h3>
                  <v-spacer />
                  <h3>Uptime: {{ uptime }}</h3>
                  <v-space />
                  <h3>Clave: 4Rn0P{{ code }}</h3>
                </v-col>
                <v-col>
                  <h3>Descarga: <strong>{{ formatBytes(download) }}</strong></h3>
                  <h3>Subida: <strong>{{ formatBytes(upload) }}</strong></h3>
                  <h3>Mikrotik: {{ mikrotik ? 'AHx4' : 'CCR' }}</h3>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </div>
        <v-card-actions>
          <v-spacer />

          <v-btn
            color="green darken-1"
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
import gql from 'graphql-tag'
export default {
  props: {
    clientid: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    code: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    modal: false,
    clientExists: false,
    showCard: false,
    loading: true,
    showInfo: false,
    online: false,
    address: 0,
    mirkotik: 0,
    mac_address: 0,
    uptime: 0,
    offlineTime: 0,
    disconnectReason: '',
    lastCallerId: '',
    download: 0,
    upload: 0
  }),
  methods: {
    initComponent () {
      this.modal = true
      this.online = false
      this.loading = true
      this.$apollo.query({
        query: gql`query ($id: ID){
          ClientStatus(id: $id){
            status
            address
            mikrotik
            mac_address
            offlineTime
            disconnectReason
            lastCallerId
            uptime
            download
            upload
          }
        }`,
        variables: {
          id: this.clientid
        }
      }).then((input) => {
        const status = input.data.ClientStatus.status
        if (status) {
          this.loading = false
          this.address = input.data.ClientStatus.address
          this.mikrotik = input.data.ClientStatus.mikrotik
          this.mac_address = input.data.ClientStatus.mac_address
          this.uptime = input.data.ClientStatus.uptime
          this.offlineTime = input.data.ClientStatus.offlineTime
          this.disconnectReason = input.data.ClientStatus.disconnectReason
          this.lastCallerId = input.data.ClientStatus.lastCallerId
          this.download = input.data.ClientStatus.download
          this.upload = input.data.ClientStatus.upload
          if (input.data.ClientStatus.address) {
            this.loading = false
            this.clientExists = true
            this.online = true
            this.showCard = true
          } else {
            this.loading = false
            this.clientExists = true
            this.online = false
            this.showCard = true
          }
        } else {
          this.loading = false
          this.clientExists = false
          this.online = false
          this.showCard = true
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.loading = false
      })
    },
    formatBytes (bytes, decimals = 2) {
      if (bytes === 0) { return '0 Bytes' }

      const k = 1024
      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

      const i = Math.floor(Math.log(bytes) / Math.log(k))

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    }
  }
}
</script>

<style>

</style>
