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
                  <v-spacer />
                  <h3 v-if="can('access_password')">Clave: 4Rn0P{{ code }}</h3>
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
  name: 'ClientStatus',
  apollo: {
    ClientStatus () {
      return {
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
        },
        skip () {
          return true
        }
      }
    }
  },
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
    },
    role: {
      type: Array,
      default: () => {}
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
    async initComponent () {
      this.loading = true
      this.modal = true
      this.online = false
      this.$apollo.queries.ClientStatus.skip = false
      await this.$apollo.queries.ClientStatus.fetchMore({
        variables: {
          id: this.clientid
        },
        updateQuery: (_, { fetchMoreResult }) => {
          const newStatusInfo = fetchMoreResult.ClientStatus
          const status = newStatusInfo.status
          if (status) {
            this.loading = false
            this.address = newStatusInfo.address
            this.mikrotik = newStatusInfo.mikrotik
            this.mac_address = newStatusInfo.mac_address
            this.uptime = newStatusInfo.uptime
            this.offlineTime = newStatusInfo.offlineTime
            this.disconnectReason = newStatusInfo.disconnectReason
            this.lastCallerId = newStatusInfo.lastCallerId
            this.download = newStatusInfo.download
            this.upload = newStatusInfo.upload
            if (newStatusInfo.address) {
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
        }
      })
    },
    formatBytes (bytes, decimals = 2) {
      if (bytes === 0) { return '0 Bytes' }

      const k = 1024
      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

      const i = Math.floor(Math.log(bytes) / Math.log(k))

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
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
