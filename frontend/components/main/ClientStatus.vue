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
        <div v-if="showCard">
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
              Fuera de Linea hace <strong>{{ offlineTime }}</strong>
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
              <h3>Acceso: <a :href="`http://${address}`" target="_blank">{{ address }}</a></h3>
              <v-spacer />
              <h3>Mac: {{ mac_address }}</h3>
              <v-spacer />
              <h3>Uptime: {{ uptime }}</h3>
              <v-divider class="my-4" />
              <v-simple-table class="teal darken-4">
                <template v-slot:default>
                  <thead>
                    <tr>
                      <th class="text-left">Descarga</th>
                      <th class="text-left">Carga</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><h2>{{ formatBytes(download) }}</h2></td>
                      <td><h2>{{ formatBytes(upload) }}</h2></td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
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
    mac_address: 0,
    uptime: 0,
    offlineTime: 0,
    download: 0,
    upload: 0
  }),
  methods: {
    initComponent () {
      this.modal = true
      this.$apollo.mutate({
        mutation: gql`mutation ($id: ID){
          getClientStatus(id: $id){
            status
            address
            mac_address
            offlineTime
            uptime
            download
            upload
          }
        }`,
        variables: {
          id: this.clientid
        }
      }).then((input) => {
        const status = input.data.getClientStatus.status
        if (status) {
          this.loading = false
          this.address = input.data.getClientStatus.address
          this.mac_address = input.data.getClientStatus.mac_address
          this.uptime = input.data.getClientStatus.uptime
          this.offlineTime = input.data.getClientStatus.offlineTime
          this.download = input.data.getClientStatus.download
          this.upload = input.data.getClientStatus.upload
          if (input.data.getClientStatus.address) {
            this.clientExists = true
            this.online = true
            this.showCard = true
          } else {
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
