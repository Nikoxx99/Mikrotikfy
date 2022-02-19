<template>
  <div>
    <v-tooltip v-if="!item.active" left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          :color="item.active ? 'green darken-4' : 'red darken-3'"
          dark
          small
          :loading="item.loading"
          :disabled="item.loading"
          v-bind="attrs"
          text
          v-on="on"
          @click="modal = true"
        >
          <v-icon>mdi-{{ item.active ? 'check' : 'close' }}</v-icon>
        </v-btn>
      </template>
      <span>Solicitar Activacion</span>
    </v-tooltip>
    <v-dialog
      v-model="modal"
      max-width="590"
    >
      <v-card
        :loading="loading"
      >
        <v-alert
          v-if="error"
          dense
          outlined
          type="error"
        >
          {{ errorMessage }}
        </v-alert>
        <v-card-title class="headline">
          Solicitar Activación de {{ item.name }}
        </v-card-title>
        <v-card-text>
          <EditEditForm
            v-if="showControls"
            :client="item"
            :index="index"
            :role="$store.state.auth.allowed_components"
            @updateSuccess="resetErrorFields"
          />
          <span v-if="showControls">Editar cliente ahora</span>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="blue darken-1"
            :loading="loading"
            :disabled="loading"
            @click="createActivationrequest()"
          >
            Enviar Solicitud
          </v-btn>
          <v-spacer />

          <v-btn
            color="green darken-1"
            text
            @click="modal = false"
          >
            Cancelar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="snack"
      :timeout="3000"
      :color="snackColor"
      top
      vertical
    >
      {{ snackText }}

      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    index: {
      type: Number,
      default: -1
    },
    allowedcomponents: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      flag1: false,
      flag2: false,
      modal: false,
      showControls: false,
      snack: false,
      snackColor: '',
      snackText: '',
      error: false,
      errorMessage: '',
      loading: false,
      validateLengh: [
        value => !!value || 'Este campo no puede estar vacío'
      ]
    }
  },
  computed: {
    currentCity () {
      return this.$store.state.cities.find(city => city.name === this.$route.query.city)
    }
  },
  methods: {
    async createActivationrequest () {
      this.loading = true
      await this.testFields()
      await this.testDuplicates()
      try {
        if (this.flag1 && this.flag2) {
          await fetch(`${this.$config.API_STRAPI_ENDPOINT}activationrequests`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.$store.state.auth.token}`
            },
            body: JSON.stringify({
              data: {
                active: false,
                operator: this.$store.state.auth.id,
                client: this.item.id,
                city: this.currentCity.id
              }
            })
          })
            .then(res => res.json())
            .then((activationrequest) => {
              if (activationrequest.data) {
                this.modal = false
                this.error = false
                this.loading = false
                this.snack = true
                this.snackText = 'Solicitud enviada correctamente!'
                this.snackColor = 'cyan'
              } else {
                this.snack = true
                this.loading = false
                this.snackText = 'Error desconocido, reporta esto a nico'
                this.snackColor = 'red'
              }
            })
        }
      } catch (error) {
        this.snack = true
        this.loading = false
        this.snackText = error
        this.snackColor = 'red'
      }
    },
    resetErrorFields () {
      this.error = false
      this.errorMessage = ''
      this.showControls = false
    },
    async testFields () {
      const qs = require('qs')
      const query = qs.stringify({
        populate: [
          'technology',
          'mac_addresses'
        ]
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}clients/${this.item.id}?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        }
      })
        .then(res => res.json())
        .then((clients) => {
          clients.data.attributes.id = clients.data.id
          clients.data.attributes.technology.data.attributes.id = clients.data.attributes.technology.data.id
          clients.data.attributes.technology = clients.data.attributes.technology.data.attributes
          clients.data.attributes.mac_addresses = clients.data.attributes.mac_addresses.data.map((mac) => {
            mac.attributes.id = mac.id
            return mac.attributes
          })
          clients = clients.data.attributes
          if (clients.mac_addresses.length < 1 || Object.keys(clients.technology).length === 0 || !clients.nap_onu_address || !clients.opticalPower) {
            this.loading = false
            this.error = true
            this.errorMessage = 'No puedes enviar una solicitud de activacion hasta no haber llenado los campos de NAP, Potencia Optica y haber registrado la MAC correspondiente al cliente'
            this.showControls = true
          } else {
            this.flag1 = true
          }
        })
    },
    async testDuplicates () {
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          active: true,
          client: {
            id: this.item.id
          }
        }
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}activationrequests?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        }
      })
        .then((res) => { return res.json() })
        .then((activationRequestExists) => {
          if (activationRequestExists.data.length > 0) {
            this.loading = false
            this.snack = true
            this.snackColor = 'error'
            this.snackText = 'Ya existe una solicitud de activación'
          } else {
            this.flag2 = true
          }
        })
    }
  }
}
</script>
