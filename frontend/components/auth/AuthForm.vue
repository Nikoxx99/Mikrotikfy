<template>
  <v-card
    flat
    :loading="isLoading"
    style="background-color:222;"
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
      Error de inicio de sesión. <br>
      <span class="text-subtitle-2">{{ errorMessages }}</span>
    </v-alert>
    <v-alert
      v-if="$route.query.resetSession"
      type="info"
      tile
    >
      Tu sesión ha sido reiniciada manualmente por un administrador debido a una actualizacion de la API. Porfavor inicia sesion nuevamente.
    </v-alert>
    <v-alert
      v-if="loginSuccessful"
      type="info"
      tile
    >
      ¡Inicio de sesión correcto! Por favor espera mientras se cachean los datos.
    </v-alert>
    <v-card-text
      class="d-flex justify-center"
    >
      <img
        src="logo.png"
        alt="ARNOProducciones Logo"
        style="max-width:50%;"
      >
    </v-card-text>
    <v-card-text class="text-center">
      <h3>Ingresa tu usuario</h3>
    </v-card-text>
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
// import Cookie from 'js-cookie'

export default {
  data: () => ({
    username: 'niko',
    usernameRules: [
      v => !!v || 'Usuario requerido',
      v => (v && v.length <= 32) || 'El nombre debe ser de menos de 32 caracteres de longitud.'
    ],
    password: 'Soy@Lolipop',
    passwordRules: [
      v => !!v || 'Debes ingresar una contraseña',
      v => (v && v.length >= 8) || 'La contraseña debe ser de almenos 8 caracteres.'
    ],
    showPassword: false,
    firstTime: false,
    loginFailed: false,
    loginSuccessful: false,
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
      this.username = 'niko'
      this.password = 'Soy@Lolipop'
    },
    async login () {
      this.isLoading = true
      this.loginFailed = false
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: this.username,
          password: this.password
        })
      }).then((login) => {
        if (login.status === 200) {
          Promise.resolve(login.json())
            .then((res) => {
              this.logininfo(res)
            })
        } else {
          this.loginFailed = true
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    },
    async logininfo (response) {
      this.loginSuccessful = true
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          users: {
            id: {
              $eq: response.user.id
            }
          }
        },
        populate: {
          users: {
            filters: {
              id: {
                $eq: response.user.id
              }
            }
          }
        }
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}cities?${query}`)
        .then(res => res.json())
        .then(async (cities) => {
          const userId = cities.data[0].attributes.users.data[0].id
          const userData = cities.data[0].attributes.users.data[0].attributes
          userData.id = userId
          cities = cities.data.map((city) => {
            city = city.attributes
            return city
          })
          if (!cities) {
            this.errorMessages = 'Ciudad no especificada para el usuario'
            this.loginFailed = true
            this.loginSuccessful = false
            this.isLoading = false
          } else {
            const auth = {
              id: userData.id,
              username: userData.username,
              cities
            }
            // Cookie.set('auth', auth, { expires: 7 })
            // Cookie.set('token', response.jwt, { expires: 7 })
            await Promise.all([
              this.$store.dispatch('plan/getPlansFromDatabase'),
              this.$store.dispatch('technology/getTechnologiesFromDatabase'),
              this.$store.dispatch('device/getDeviceBrandsFromDatabase'),
              this.$store.dispatch('city/getCitiesFromDatabase'),
              this.$store.dispatch('neighborhood/getNeighborhoodsFromDatabase'),
              this.$store.dispatch('count/activeClients')
            ]).then(() => {
              // window.location.href = `/clients?city=${cities[0].id}`
              console.log('finish', auth)
            }).catch((e) => {
              this.errorMessages = e
              this.loginFailed = true
              this.loginSuccessful = false
              this.isLoading = false
            })
          }
        })
    }
  }
}
</script>

<style>

</style>
