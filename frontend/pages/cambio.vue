<template>
  <div v-if="!done">
    <Logo />
    <v-row justify="center">
      <v-col lg="6" md="6" sm="12" xs="12">
        <v-card>
          <v-card-title> Solicitar Cambio de Clave </v-card-title>
          <v-card-text>
            El plazo para que el cambio se haga efectivo es de 12 a 72 horas
            luego de solicitar el cambio mediante este formulario. Recuerda
            verificar tu contraseña nueva antes de enviar la solicitud.
          </v-card-text>
          <v-card-text>
            <v-alert
              v-if="error"
              dense
              outlined
              type="error"
            >
              {{ errorMessage }}
            </v-alert>
            <v-stepper v-model="e1">
              <v-stepper-header>
                <v-stepper-step :complete="e1 > 1" step="1">
                  Identidad de Red
                </v-stepper-step>

                <v-divider />

                <v-stepper-step :complete="e1 > 2" step="2">
                  Nombre del ttular
                </v-stepper-step>

                <v-divider />

                <v-stepper-step :complete="e1 > 2" step="3">
                  Direccion de residencia
                </v-stepper-step>

                <v-divider />

                <v-stepper-step step="4">
                  Nueva Clave
                </v-stepper-step>
              </v-stepper-header>
              <v-stepper-items>
                <v-stepper-content step="1">
                  <v-card>
                    <v-col
                      align-self="center"
                    >
                      <v-text-field
                        v-model="user_dni"
                        autofocus
                        type="number"
                        required
                        :rules="valid_dni"
                        label="Ingresa tu Cedula o NIT del titular de la red"
                        hide-details
                        outlined
                      />
                    </v-col>
                  </v-card>
                  <v-btn class="mt-4" color="primary" @click="testDni()">
                    Continuar
                  </v-btn>
                </v-stepper-content>
                <v-stepper-content step="2">
                  <v-card>
                    <v-col
                      align-self="center"
                    >
                      <v-text-field
                        v-model="user_old_password"
                        label="Ingresa nombre del titular"
                        hint="Obligatorio"
                        persistent-hint
                        outlined
                      />
                    </v-col>
                  </v-card>
                  <v-btn class="mt-4" color="primary" @click="testName()">
                    Continuar
                  </v-btn>
                  <v-btn class="mt-4" color="grey" @click="e1 = 1">
                    Volver y Corregir
                  </v-btn>
                </v-stepper-content>
                <v-stepper-content step="3">
                  <v-card>
                    <v-col
                      align-self="center"
                    >
                      <v-text-field
                        v-model="user_address"
                        label="Ingresa dirección de residencia"
                        hint="Es la dirección donde esta instalado el servicio al que deseas actualizar la contraseña."
                        persistent-hint
                        outlined
                      />
                    </v-col>
                  </v-card>
                  <v-btn class="mt-4" color="primary" @click="testAddress()">
                    Continuar
                  </v-btn>
                  <v-btn class="mt-4" color="grey" @click="e1 = 2">
                    Volver y Corregir
                  </v-btn>
                </v-stepper-content>
                <v-stepper-content step="4">
                  <v-card>
                    <v-col
                      align-self="center"
                    >
                      <v-form v-model="valid" lazy-validation>
                        <v-text-field
                          v-model="user_new_password"
                          :rules="valid_new_password"
                          label="Ingresa la nueva clave que deseas"
                          :hide-details="hideHint"
                          outlined
                          @keyup="hideHint = false"
                        />
                      </v-form>
                    </v-col>
                  </v-card>
                  <v-btn class="mt-4" color="green darken-4" @click="openConfirm()">
                    Confirmar y Enviar
                  </v-btn>
                  <v-btn class="mt-4" color="grey" @click="e1 = 1">
                    Volver y Corregir
                  </v-btn>
                </v-stepper-content>
              </v-stepper-items>
            </v-stepper>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog
      v-model="confirmation"
      width="500"
    >
      <v-card>
        <v-card-title>
          ¿Estas seguro de continuar?
        </v-card-title>

        <v-card-text>
          Antes de continuar, verifica cuidadosamente la nueva contraseña que quieres.
          <p class="mt-4">
            <strong style="font-size:2rem;color:green;">{{ user_new_password }}</strong>
          </p>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-btn
            color="primary"
            text
            @click.once="sendRequest()"
          >
            Confirmar y Enviar
          </v-btn>
          <v-btn
            color="grey"
            text
            @click="dialog = false"
          >
            Volver y Corregir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <div v-else>
    <v-row
      justify="center"
    >
      <v-col
        lg="6"
        md="6"
        sm="12"
        xs="12"
      >
        <v-card>
          <v-card-title>ARNOProducciones</v-card-title>
          <v-card-text>
            <v-alert
              border="left"
              colored-border
              type="success"
              elevation="2"
            >
              Petición enviada con éxito.
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="success"
              text
              href="https://arnoproducciones.com"
            >
              Terminar y Volver
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import gqlt from 'graphql-tag'
import Logo from '../components/main/Logo'
export default {
  layout: 'outuser',
  components: {
    Logo
  },
  data () {
    return {
      title: 'Solicitar cambio de clave Wi-Fi',
      done: false,
      e1: 1,
      confirmation: false,
      user_dni: '',
      user_old_password: '',
      user_new_password: '',
      user_address: '',
      valid_dni: [
        value => !!value || 'Este campo no puede estar vacío'
      ],
      valid_new_password: [
        value => !!value || 'Debes especificar la nueva contraseña deseada.',
        value => (value || '').length >= 8 || 'La clave debe tener al menos 8 caracteres.',
        (value) => {
          const pattern = /^[A-Za-z0-9]+$/
          return pattern.test(value) || 'La contraseña no puede contener caracteres especiales.'
        }
      ],
      hideHint: true,
      error: false,
      errorMessage: '',
      valid: false
    }
  },
  methods: {
    testDni () {
      if (this.user_dni.length > 0) {
        this.$apollo.query({
          query: gqlt`
          query($dni: String) {
            TestPasswordChange(dni: $dni)
          }
        `,
          variables: {
            dni: this.user_dni
          }
        }).then((input) => {
          if (input.data.TestPasswordChange === true) {
            this.error = false
            this.e1 = 2
          } else {
            this.error = true
            this.errorMessage = 'Ya existe un proceso activo para el cambio de tu clave. Será realizado hasta 3 días hábiles luego de tu solicitud.'
          }
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
          this.initialLoading = false
        })
      } else {
        this.error = true
        this.errorMessage = 'No puedes dejar este campo en blanco.'
      }
    },
    testName () {
      if (this.user_old_password) {
        this.error = false
        this.e1 = 3
      } else {
        this.error = true
        this.errorMessage = 'No puedes dejar este campo en blanco.'
      }
    },
    testAddress () {
      if (this.user_address) {
        this.error = false
        this.e1 = 4
      } else {
        this.error = true
        this.errorMessage = 'No puedes dejar este campo en blanco.'
      }
    },
    openConfirm () {
      if (this.valid) {
        this.confirmation = true
      }
    },
    sendRequest () {
      const date = Date.now()
      if (this.valid) {
        this.$apollo.mutate({
          mutation: gqlt`mutation ($input: PasswordChangeInput){
          createPasswordChangeRequest(input: $input)
        }`,
          variables: {
            input: {
              dni: this.user_dni,
              old_password: this.user_old_password,
              new_password: this.user_new_password,
              address: this.user_address,
              closed: {
                name: 'Cerrado',
                value: false
              },
              created_at: String(date)
            }
          }
        }).then((input) => {
          if (input.data.createPasswordChangeRequest) {
            this.done = true
          } else {
            this.error = true
            this.errorMessage = 'Se ha producido un error, intentalo mas tarde o contecta nuevamente con la empresa.'
            this.isSubmitting = false
          }
        }).catch((error) => {
          this.error = true
          this.errorMessage = error
          this.isSubmitting = false
        })
      }
    }
  },
  head () {
    return {
      title: this.title,
      meta: [
        { hid: 'language', name: 'language', content: 'es' },
        { hid: 'audience', name: 'audience', content: 'all' },
        { hid: 'rating', name: 'rating', content: 'general' },
        { hid: 'distribution', name: 'distribution', content: 'global' },
        { hid: 'document-type', name: 'document-type', content: 'Public' },
        { hid: 'MSSmartTagsPreventParsing', name: 'MSSmartTagsPreventParsing', content: 'true' },
        { hid: 'robots', name: 'robots', content: 'all' },
        { hid: 'robots', name: 'robots', content: 'all, index, follow' },
        { hid: 'googlebot', name: 'googlebot', content: 'all, index, follow' },
        { hid: 'yahoo-slurp', name: 'yahoo-slurp', content: 'all, index, follow' },
        { hid: 'msnbot', name: 'msnbot', content: 'index, follow' },
        { hid: 'googlebot-image', name: 'googlebot-image', content: 'all' },
        { hid: 'title', name: 'title', content: this.title },
        { hid: 'og:title', property: 'og:title', content: this.title },
        { hid: 'og:description', property: 'og:description', content: 'ARNOProducciones - Base de datos interactiva' },
        { hid: 'author', name: 'author', content: 'Nicolas Echeverry' }
      ]
    }
  }
}
</script>

<style></style>
