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
    <v-alert
      v-if="$route.query.resetSession"
      type="info"
      tile
    >
      Tu sesión ha sido reiniciada manualmente por un administrador debido a una actualizacion de la API. Porfavor inicia sesion nuevamente.
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
import gqlt from 'graphql-tag'
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
    async login () {
      this.isLoading = true
      this.loginFailed = false
      const first = await this.$apollo.mutate({
        mutation: gqlt`mutation ($input: UsersPermissionsLoginInput!){
          login(input: $input){
            jwt
            user{
              id
              username
              role{
                id
                name
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
      })
      const second = await this.$apollo.query({
        query: gqlt`query ($id: ID!){
          role(id: $id){
            allowed_components{
              name
            }
          }
        }`,
        variables: {
          id: first.data.login.user.role.id
        }
      })
      const third = await this.$apollo.query({
        query: gqlt`query ($id: ID!){
          user(id: $id){
            cities{
              id
              name
              color
            }
          }
        }`,
        variables: {
          id: first.data.login.user.id
        }
      })
      if (!first.errors) {
        const ac = await second.data.role.allowed_components.map((c) => {
          return c.name
        })
        const auth = {
          accessToken: first.data.login.jwt,
          id: first.data.login.user.id,
          username: first.data.login.user.username,
          role: first.data.login.user.role.id,
          rolename: first.data.login.user.role.name,
          allowed_components: ac,
          cities: third.data.user.cities
        }
        this.$store.commit('setAuth', auth)
        Cookie.set('auth', auth, { expires: 7 })
        Cookie.set('authToken', auth.accessToken, { expires: 7 })
        await this.$store.dispatch('plan/getPlansFromDatabase')
        await this.$store.dispatch('technology/getTechnologiesFromDatabase')
        await this.$store.dispatch('city/getCitiesFromDatabase')
        await this.$store.dispatch('neighborhood/getNeighborhoodsFromDatabase')
        await this.$store.dispatch('count/activeClients', third.data.user.cities[0].id)
        await this.$store.dispatch('count/clientCount', third.data.user.cities[0].id)
        await this.$store.dispatch('count/clientCountActive', third.data.user.cities[0].id)
        await this.$store.dispatch('count/clientCountDisable', third.data.user.cities[0].id)
        await this.$store.dispatch('count/clientCountRetired', third.data.user.cities[0].id)
        await this.$store.dispatch('ticket/getTicketsFromDatabase', { limit: 30, city: third.data.user.cities[0].id })
        window.location.href = `/lista?city=${third.data.user.cities[0].id}`
      } else {
        this.loginFailed = true
        this.isLoading = false
      }
    }
  }
}
</script>

<style>

</style>
