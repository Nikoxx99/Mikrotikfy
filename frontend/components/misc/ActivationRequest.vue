<template>
  <div>
    <v-tooltip v-if="can('CreateActivationRequest') && !item.active" left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          :color="item.active ? 'green darken-4' : 'red darken-3'"
          dark
          small
          :loading="item.loading"
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
        <v-card-actions>
          <v-btn
            color="blue darken-1"
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
import gql from 'graphql-tag'
export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    allowedcomponents: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      modal: false,
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
    createActivationrequest () {
      this.$apollo.mutate({
        mutation: gql`mutation ($input: createActivationrequestInput){
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
          this.snack = true
          this.snackText = 'Solicitud enviada correctamente!'
          this.snackColor = 'cyan'
        } else {
          this.snack = true
          this.snackText = 'Error desconocido, reporta esto a nico'
          this.snackColor = 'red'
        }
      }).catch((error) => {
        this.snack = true
        this.snackText = 'Error de conexion, recarga la pagina o verifica que tienes internet' + error
        this.snackColor = 'red'
      })
    },
    can (component) {
      const allowedComponents = this.allowedcomponents.map((c) => {
        return c.name
      })
      console.log(allowedComponents, component)
      // eslint-disable-next-line camelcase
      const current_component = component
      return allowedComponents.includes(current_component)
    }
  }
}
</script>

<style>

</style>
