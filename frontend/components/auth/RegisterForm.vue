<template>
  <v-card
    flat
  >
    <v-alert
      v-if="alertBox"
      type="info"
      :class="alertBoxColor"
      tile
      dismissible
    >
      {{ createdMessage }}
    </v-alert>
    <v-card-title class="justify-center">
      Registrar usuario
    </v-card-title>
    <v-card-text>
      <form>
        <v-text-field
          v-model="username"
          :rules="usernameRules"
          label="Usuario"
          required
        />
        <v-text-field
          v-model="email"
          :rules="emailRules"
          label="Email (Opcional)"
        />
        <v-text-field
          v-model="password"
          :rules="passwordRules"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          label="Contraseña"
          hint="Ingresa una contraseña"
          required
          counter
          @click:append="showPassword = !showPassword"
        />
        <v-text-field
          v-model="confirmPassword"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          label="Confirma la contraseña"
          required
          counter
          @blur="matchPasswords"
          @click:append="showPassword = !showPassword"
        />
      </form>
    </v-card-text>
    <v-card-text>
      <v-btn block text class="my-2 yellow darken-4 white--text" @click="createUser">
        Registrar
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
import gql from 'graphql-tag'

export default {
  data: () => ({
    username: '',
    usernameRules: [
      v => !!v || 'Usuario Requerido',
      v => (v && v.length <= 32) || 'El usuario debe tener menos de 32 caracteres'
    ],
    email: '',
    emailRules: [
      v => !!v || 'Email requerido',
      v => /.+@.+\..+/.test(v) || 'Ingresa un email válido'
    ],
    password: '',
    passwordRules: [
      v => !!v || 'Contraseña Requerida',
      v => (v && v.length >= 8) || 'La contraseña debe tener al menos 8 caracteres'
    ],
    confirmPassword: '',
    confirmPasswordRules: [
      v => !!v || 'Las contraseñas no coinciden'
    ],
    showPassword: false,
    valid: false,
    createdMessage: '',
    alertBox: false,
    alertBoxColor: ''
  }),

  methods: {
    matchPasswords () {
      if (this.password === this.confirmPassword) {
        this.valid = true
      } else {
        this.valid = false
      }
    },
    clear () {
      this.$v.$reset()
      this.name = ''
      this.email = ''
      this.select = null
      this.checkbox = false
    },
    createUser () {
      this.$apollo.mutate({
        mutation: gql`mutation ($input: UserInput!){
          createUser(input: $input){
            success
            token
            username
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          input: {
            username: this.username,
            email: this.email,
            password: this.password
          }
        }
      }).then((input) => {
        if (input.data.createUser.success) {
          this.$router.push({ path: '/login?firstTime=true' })
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.createUser.errors[0].message
          this.isSubmitting = false
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    }
  }
}
</script>

<style>

</style>
