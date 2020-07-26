<template>
  <v-card
    flat
  >
    <v-alert
      v-if="firstTime"
      type="info"
      class="blue darken-4"
      tile
    >
      ARNOProducciones Database
    </v-alert>
    <v-alert
      v-if="loginFailed"
      type="error"
      tile
    >
      Credenciales Inválidas, intenta de nuevo.
    </v-alert>
    <v-card-title class="justify-center">
      Ingresa tu usuario
    </v-card-title>
    <v-card-text>
      <form @keyup.enter="login">
        <v-text-field
          v-model="username"
          :rules="usernameRules"
          label="Usuario"
          required
        />
        <v-text-field
          v-model="password"
          :rules="passwordRules"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          label="Contraseña"
          hint="Ingresa tu contraseña"
          required
          @click:append="showPassword = !showPassword"
        />
      </form>
    </v-card-text>
    <v-card-text>
      <v-btn tile text block class="my-2 blue darken-4 white--text" @click.enter="login">
        Ingresar
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
import gql from 'graphql-tag'
import Cookie from 'js-cookie'

export default {
  data: () => ({
    username: '',
    usernameRules: [
      v => !!v || 'Usuario requerido',
      v => (v && v.length <= 32) || 'El nombre debe ser de menos de 32 caracteres de longitud.'
    ],
    password: '',
    passwordRules: [
      v => !!v || 'Debes ingresar una contraseña',
      v => (v && v.length >= 8) || 'La contraseña debe ser de almenos 8 caracteres.'
    ],
    showPassword: false,
    firstTime: false,
    loginFailed: false
  }),
  mounted () {
    if (this.$route.query.firstTime) {
      this.firstTime = true
    }
    if (this.$route.query.loginFailed) {
      this.loginFailed = true
    }
  },
  methods: {
    clear () {
      this.username = ''
      this.password = ''
    },
    login () {
      this.$apollo.mutate({
        mutation: gql`mutation ($input: LoginInput!){
          login(input: $input){
            success
            token
            username
            role
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          input: {
            username: this.username,
            password: this.password
          }
        }
      }).then((input) => {
        if (input.data.login.success) {
          const auth = {
            accessToken: input.data.login.token,
            username: input.data.login.username,
            role: input.data.login.role
          }
          this.$store.commit('setAuth', auth)
          Cookie.set('auth', auth)
          if (this.username === 'nohora') {
            window.location.href = '/lista?city=2'
          } else {
            window.location.href = '/lista?city=1'
          }
        } else {
          this.loginFailed = true
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
