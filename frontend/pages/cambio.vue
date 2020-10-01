<template>
  <div>
    <Logo />
    <v-row justify="center">
      <v-col lg="6" md="6" sm="12" xs="12">
        <v-card>
          <v-card-title> Solicitar Cambio de Clave </v-card-title>
          <v-card-text>
            El plazo para que el cambio se haga efectivo son de 12 a 24 horas
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
                  Clave Anterior
                </v-stepper-step>

                <v-divider />

                <v-stepper-step step="3">
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
                        required
                        :rules="valid_dni"
                        label="Ingresa tu Cedula o NIT del titular de la red"
                        hide-details
                        outlined
                      />
                    </v-col>
                  </v-card>
                  <v-btn class="mt-4" color="primary" @click="testDni()"> Continuar </v-btn>
                </v-stepper-content>
                <v-stepper-content step="2">
                  <v-card>
                    <v-col
                      align-self="center"
                    >
                      <v-text-field
                        v-model="user_old_password"
                        label="Ingresa clave anterior o nombre del titular"
                        hint="Puedes dejar esto en blanco si no recuerdas la contraseña anterior, pero entonces el proceso estar+a sujeto a verificación."
                        persistent-hint
                        outlined
                      />
                    </v-col>
                  </v-card>
                  <v-btn class="mt-4" color="primary" @click="e1 = 3">
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
                      <v-form v-model="valid" lazy-validation>
                        <v-text-field
                          v-model="user_new_password"
                          :rules="valid_new_password"
                          label="Ingresa la nueva clave que deseas"
                          :hide-details="hideHint"
                          outlined
                          @keyup="hideHint = false"
                          @blur="hideHint = true"
                          @focus="hideHint = false"
                        />
                      </v-form>
                    </v-col>
                  </v-card>
                  <v-btn class="mt-4" color="green darken-4" @click="sendRequest()">
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
        <v-card-title class="headline grey lighten-2">
          Privacy Policy
        </v-card-title>

        <v-card-text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="dialog = false"
          >
            I accept
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Logo from '../components/main/Logo'
export default {
  layout: 'outuser',
  components: {
    Logo
  },
  data () {
    return {
      e1: 1,
      confirmation: false,
      user_dni: '',
      user_old_password: '',
      user_new_password: '',
      valid_dni: [
        value => !!value || 'Este campo no puede estar vacío'
      ],
      valid_new_password: [
        value => !!value || 'Required.',
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
        this.error = false
        this.e1 = 2
      } else {
        this.error = true
        this.errorMessage = 'No puedes dejar este campo en blanco.'
      }
    },
    sendRequest () {
      if (this.valid) {
        this.confirmation = true
      }
    }
  }
}
</script>

<style></style>
