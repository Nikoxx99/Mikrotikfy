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
          <EditForm
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
import gqlt from 'graphql-tag'
import EditForm from '../edit/EditForm'
export default {
  components: {
    EditForm
  },
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
  methods: {
    async createActivationrequest () {
      this.loading = true
      const clientData = await this.$strapi.find('clients', {
        id: this.item.id
      })
      if (clientData[0].mac_addresses.length < 1 || clientData[0].technology.length < 1 || !('nap_onu_address' in clientData[0]) || !('opticalPower' in clientData[0])) {
        this.loading = false
        this.error = true
        this.errorMessage = 'No puedes enviar una solicitud de activacion hasta no haber llenado los campos de NAP, Potencia Optica y haber registrado la MAC correspondiente al cliente'
        this.showControls = true
        return
      }
      const activationRequestExists = await this.$strapi.find('activationrequests', {
        active: true,
        'client.id': this.item.id
      })
      if (activationRequestExists.length > 0) {
        this.loading = false
        this.snack = true
        this.snackColor = 'error'
        this.snackText = 'Ya existe una solicitud de activación'
        return
      }
      await this.$apollo.mutate({
        mutation: gqlt`mutation ($input: createActivationrequestInput){
          createActivationrequest(input: $input){
            activationrequest{
              client{
                _id
              }
            }
          }
        }`,
        variables: {
          input: {
            data: {
              active: true,
              operator: this.$store.state.auth.id,
              client: this.item._id,
              city: this.$route.query.city
            }
          }
        }
      }).then((input) => {
        if (input.data.createActivationrequest.activationrequest.client._id) {
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
      }).catch((error) => {
        this.snack = true
        this.loading = false
        this.snackText = 'Error de conexion, recarga la pagina o verifica que tienes internet' + error
        this.snackColor = 'red'
      })
    },
    resetErrorFields () {
      this.error = false
      this.errorMessage = ''
      this.showControls = false
    },
    can (component) {
      const allowedComponents = this.allowedcomponents
      // eslint-disable-next-line camelcase
      const current_component = component
      return allowedComponents.includes(current_component)
    }
  }
}
</script>

<style>

</style>
