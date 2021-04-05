<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          v-bind="attrs"
          color="yellow darken-4"
          v-on="on"
          @click="dialogEdit = true"
        >
          mdi-pencil
        </v-icon>
      </template>
      <span>Editar Cliente</span>
    </v-tooltip>
    <v-dialog v-if="dialogEdit" v-model="dialogEdit" max-width="1100px" :retain-focus="false" :fullscreen="getResolution()">
      <v-card>
        <v-card-title>
          <v-toolbar
            dark
          >
            <v-btn
              icon
              dark
              @click="dialogEdit = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>Editar Cliente</v-toolbar-title>
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
            <v-form ref="editForm" v-model="valid">
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="editClient.code"
                    :disabled="!can('EditFormCode')"
                    type="number"
                    label="Codigo"
                    required
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    :value="editClient.dni"
                    :disabled="!can('EditFormDni')"
                    type="number"
                    label="Cedula"
                    required
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
              </v-row>
              <v-text-field
                :value="editClient.name ? editClient.name.toUpperCase() : ''"
                :disabled="!can('EditFormName')"
                label="Nombre Completo"
                required
                outlined
                dense
                hide-details
                class="pb-3"
                @input="editClient.name = $event.toUpperCase()"
              />
              <v-row>
                <v-col cols="6" lg="3" md="3">
                  <v-text-field
                    :value="editClient.address ? editClient.address.toUpperCase() : ''"
                    :disabled="!can('EditFormAddress')"
                    label="Direccion"
                    outlined
                    dense
                    hide-details
                    @input="editClient.address = $event.toUpperCase()"
                  />
                </v-col>
                <v-col cols="6" lg="3" md="3">
                  <v-autocomplete
                    :value="editClient.neighborhood"
                    :disabled="!can('EditFormNeighborhood')"
                    item-text="name"
                    item-value="id"
                    :items="neighborhoods"
                    return-object
                    label="Barrio"
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
                <v-col cols="6" lg="3" md="3">
                  <v-select
                    :value="editClient.city"
                    item-text="name"
                    item-value="id"
                    :items="cities"
                    return-object
                    label="Ciudad"
                    disabled
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
                <v-col cols="6" lg="3" md="3">
                  <v-text-field
                    :value="editClient.phone"
                    :disabled="!can('EditFormPhone')"
                    label="Telefono"
                    required
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" lg="4" md="4">
                  <v-select
                    :value="editClient.plan"
                    :disabled="!can('EditFormPlan')"
                    item-text="name"
                    item-value="id"
                    :items="plans"
                    return-object
                    label="Plan"
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
                <v-col cols="6" lg="4" md="4">
                  <v-text-field
                    :value="editClient.wifi_ssid"
                    :disabled="!can('EditFormWifiSsid')"
                    label="Nombre de Red"
                    required
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
                <v-col cols="6" lg="4" md="4">
                  <v-text-field
                    :value="editClient.wifi_password"
                    :disabled="!can('EditFormWifiPassword')"
                    :type="!can('EditFormWifiPasswordVisibility') ? 'password' : 'text'"
                    label="Clave de Red"
                    required
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-select
                    :value="editClient.technology"
                    :disabled="!can('EditFormTechnology')"
                    item-text="name"
                    item-value="id"
                    :items="technologies"
                    return-object
                    label="Tecnología"
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    :value="editClient.mac_address"
                    :disabled="!can('EditFormMacAddress')"
                    label="Mac Equipo"
                    required
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-select
                    :value="editClient.newModel"
                    :disabled="!can('EditFormNewModel')"
                    :items="idwith"
                    item-text="name"
                    item-value="id"
                    mandatory
                    label="Identificar con:"
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    :value="editClient.nap_onu_address ? editClient.nap_onu_address.toUpperCase() : ''"
                    label="Direccion NAP/ONU"
                    outlined
                    dense
                    hide-details
                    @input="editClient.nap_onu_address = $event.toUpperCase()"
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    :value="editClient.opticalPower ? editClient.opticalPower.toUpperCase() : ''"
                    label="Potencia Óptica (Solo numeros)"
                    outlined
                    dense
                    type="number"
                    hide-details
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    :value="getDate(editClient.createdAt)"
                    label="Fecha de Creación"
                    required
                    outlined
                    dense
                    readonly
                    disabled
                    hide-details
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    :value="getDate(editClient.updatedAt)"
                    label="Última actualización"
                    required
                    outlined
                    dense
                    readonly
                    disabled
                    hide-details
                  />
                </v-col>
                <!-- <v-col>
                  <v-text-field
                    :value="item.operator.username"
                    label="Creado por"
                    required
                    outlined
                    dense
                    readonly
                    disabled
                    hide-details
                  />
                </v-col> -->
              </v-row>
              <div v-if="can('EditFormComment')">
                <v-textarea
                  :value="editClient.comment"
                  auto-grow
                  persistent-hint
                  outlined
                  label="Comentario Local (Solo API)"
                  dense
                  readonly
                  disabled
                />
              </div>
              <v-checkbox :value="editClient.hasRepeater" hide-details input-value="false" label="Tiene repetidor?" />
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn
            class="mr-4"
            color="info"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="updateClient(editClient, index)"
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
  name: 'EditForm',
  props: {
    client: {
      type: Object,
      default: () => {}
    },
    index: {
      type: Number,
      default: 0
    },
    role: {
      type: Array,
      default: () => []
    }
  },
  data: () => {
    return {
      valid: false,
      editClient: {},
      dir1: '',
      dir2: '',
      dir3: '',
      dir4: '',
      dirFragment1: [
        '(SIN INICIAL)',
        'CARRERA',
        'CALLE',
        'MANZANA',
        'DIAGONAL'
      ],
      dirFragment2: [
        '#',
        'CASA',
        'DIAGONAL'
      ],
      dialogEdit: false,
      alertBox: false,
      alertBoxColor: '',
      createdMessage: '',
      isSubmitting: false,
      idwith: [
        { id: 0, name: 'Cedula' },
        { id: 1, name: 'Codigo' }
      ],
      success: false,
      error: false,
      commentDisabled: false,
      successMessage: '',
      errorMessage: '',
      commentLoading: false
      // item: {
      //   operator: {
      //     username: 'No registra'
      //   }
      // }
    }
  },
  computed: {
    cities () {
      return this.$store.state.city.cities
    },
    plans () {
      return this.$store.state.plan.plans
    },
    neighborhoods () {
      return this.$store.state.neighborhood.neighborhoods
    },
    technologies () {
      return this.$store.state.technology.technologies
    }
  },
  watch: {
    client () {
      Object.assign(this.editClient, this.client)
    }
  },
  mounted () {
    Object.assign(this.editClient, this.client)
  },
  methods: {
    updateClient (client, index) {
      this.isSubmitting = true
      this.$store.dispatch('client/updateClient', { client, index })
      this.dialogEdit = false
    },
    genAddress () {
      this.Client.address = `${this.dir1} ${this.dir2} ${this.dir3} ${this.dir4}`
    },
    getDate (date) {
      const dateObject = new Date(date)
      const humanDateFormat = dateObject.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })
      return humanDateFormat
    },
    getResolution () {
      const res = document.body.clientWidth
      if (res < 800) {
        const clientRes = true
        return clientRes
      } else {
        const clientRes = false
        return clientRes
      }
    },
    can (component) {
      const allowedComponents = this.role.map((c) => {
        return c.name
      })
      // eslint-disable-next-line camelcase
      const current_component = component
      return allowedComponents.includes(current_component)
    }
  }
}
</script>

<style>

</style>
