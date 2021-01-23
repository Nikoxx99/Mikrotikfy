<template>
  <v-card
    flat
    :loading="isLoading"
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
      Credenciales Inválidas, intenta de nuevo. <br>
      <span class="text-subtitle-2">{{ errorMessages }}</span>
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
      <v-btn
        tile
        text
        block
        class="my-2 blue darken-4 white--text"
        :loading="isLoading"
        :disabled="isLoading"
        @click.enter="login"
      >
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
    loginFailed: false,
    isLoading: false,
    errorMessages: ''
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
      this.isLoading = true
      this.loginFailed = false
      this.$apollo.mutate({
        mutation: gql`mutation ($input: UsersPermissionsLoginInput!){
          login(input: $input){
            jwt
            user{
              username
              role{
                id
              }
            }
          }
        }`,
        variables: {
          input: {
            identifier: this.username,
            password: this.password,
            provider: 'local'
          }
        }
      }).then((input) => {
        if (!input.errors) {
          const auth = {
            accessToken: input.data.login.jwt,
            username: input.data.login.user.username,
            role: input.data.login.user.role.id
          }
          this.$store.commit('setAuth', auth)
          Cookie.set('auth', auth)
          Cookie.set('authToken', auth.accessToken)
          if (this.username === 'nohora') {
            window.location.href = '/lista?city=5fc3f0408e3de73d204cd430'
          } else if (this.username === 'natalia') {
            window.location.href = '/lista?city=5fc3f0408e3de73d204cd430'
          } else {
            window.location.href = '/lista?city=5f832e8fb0c43e2c64b37437'
          }
        } else {
          this.loginFailed = true
          this.isLoading = false
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        this.errorMessages = error.message
        this.loginFailed = true
        this.isLoading = false
      })
    }
  }
}
</script>

<style>

</style>
