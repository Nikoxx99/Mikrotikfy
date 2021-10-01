<template>
  <span>
    <v-btn
      v-bind="attrs"
      :block="block"
      :text="!block"
      :x-small="!block"
      :color="$vuetify.theme.dark && !block ? 'white' : 'primary'"
      v-on="on"
      @click="dialogDevice = true"
    >
      <v-icon>mdi-plus</v-icon>
      Agregar MAC
      <span v-if="block">
        Router/ONU
      </span>
    </v-btn>
    <v-dialog v-if="dialogDevice" v-model="dialogDevice" max-width="1100px" :retain-focus="false" :fullscreen="getResolution()">
      <v-card>
        <v-card-title>
          <v-toolbar
            dark
          >
            <v-btn
              icon
              dark
              @click="dialogDevice = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>Crear Equipo</v-toolbar-title>
          </v-toolbar>
        </v-card-title>
        <v-card-text>
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
            <v-form ref="createDevice" v-model="valid">
              <v-row>
                <v-col
                  cols="12"
                >
                  <v-row>
                    <v-col>
                      <v-text-field
                        :value="device.mac_address ? device.mac_address.toUpperCase() : ''"
                        label="Mac"
                        :rules="valid_mac"
                        required
                        outlined
                        dense
                        @input="device.mac_address = $event.toUpperCase()"
                      />
                    </v-col>
                    <v-col>
                      <v-autocomplete
                        v-model="device.devicebrand"
                        item-text="name"
                        item-value="_id"
                        :items="devicebrands"
                        return-object
                        label="Marca"
                        outlined
                        dense
                        hide-details
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn
            class="mr-4"
            color="primary"
            @click="createDeviceFn(editClient, index)"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
/* eslint-disable vue/prop-name-casing */
export default {
  name: 'CreateDevice',
  props: {
    clientid: {
      type: String,
      default: ''
    }
  },
  data: () => {
    return {
      device: {},
      valid: false,
      pref_mac: '',
      dialogDevice: false,
      alertBox: false,
      alertBoxColor: '',
      createdMessage: '',
      valid_mac: [
        value => !!value || 'Debes especificar la Mac',
        (value) => {
          const pattern = /^[A-Fa-f0-9]+$/
          return pattern.test(value) || 'La mac no es válida. No pongas guiones ni dos puntos'
        }
      ],
      success: false,
      error: false,
      commentDisabled: false,
      successMessage: '',
      errorMessage: ''
    }
  },
  computed: {
    cities () {
      return this.$store.state.cities
    },
    plans () {
      return this.$store.state.plans
    },
    neighborhoods () {
      return this.$store.state.neighborhoods
    },
    technologies () {
      return this.$store.state.technologies
    },
    devicebrands () {
      return this.$store.state.devicebrands
    }
  },
  methods: {
    async createDeviceFn () {
      const device = await this.$strapi.create('devices', { mac_address: this.device.mac_address, devicebrand: this.device.devicebrand.id, clients: [this.clientid] })
      this.$emit('createDevice', device)
      this.dialogDevice = false
    },
    getDate (date) {
      const dateObject = new Date(date)
      const humanDateFormat = dateObject.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })
      return humanDateFormat
    },
    getResolution () {
      const res = document.body.clientWidth
      if (res < 800) {
        const isMobile = true
        return isMobile
      } else {
        const isMobile = false
        return isMobile
      }
    },
    can (component) {
      if (this.role) {
        const allowedcomponents = this.role
        const currentComponent = component
        const res = allowedcomponents.includes(currentComponent)
        return res
      }
    }
  }
}
</script>

<style>

</style>
