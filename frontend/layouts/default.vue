<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      :permanent="!isMobile"
      :expand-on-hover="!isMobile"
      :bottom="isMobile"
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="`${item.to}?city=${$route.query.city}`"
          router
          :class="role === 'admin' || role === 'superadmin' ? item.role === 'admin' ? 'd-flex' : 'd-flex' : item.role === 'user' ? 'd-flex' : 'd-none'"
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
          <v-list-item-action v-if="item.info">
            <v-chip color="red">
              {{ item.info }}
            </v-chip>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      app
    >
      <div v-if="hasPendingChanges">
        <svg height="13" width="20" style="position:absolute;top:12px;left:43px;">
          <circle cx="10" cy="8" r="5" fill="red" />
        </svg>
      </div>
      <v-app-bar-nav-icon v-if="isMobile" @click.stop="drawer = !drawer" />
      <v-toolbar-title class="d-none d-md-flex d-lg-flex d-xl-flex" v-text="title" />
      <v-spacer />
      <v-switch
        v-model="light"
        :prepend-icon="light ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"
        inset
        class="mt-5"
        @change="changeTheme()"
      />
      <div v-if="$store.state.auth">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              :class="$nuxt.isOffline ? 'red--text darken-4' : 'green--text darken-4'"
              v-bind="attrs"
              v-on="on"
            >
              mdi-account
            </v-icon>
          </template>
          <span>{{ $store.state.auth.username.charAt(0).toUpperCase() + $store.state.auth.username.slice(1) }}</span>
        </v-tooltip>
        <span class="mr-1 d-none d-xs-none d-sm-none d-md-inline d-lg-inline" style="font-size:0.7rem">{{ $store.state.auth.username.charAt(0).toUpperCase() + $store.state.auth.username.slice(1) }}</span>
        <v-btn
          v-for="city in $store.state.auth.cities"
          :key="city.id"
          class="ml-2"
          small
          outlined
          :color="city.color"
          :href="`/clients?city=${city.id}`"
        >
          {{ city.name }}
        </v-btn>
      </div>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            large
            class="ml-2"
            v-bind="attrs"
            v-on="on"
            @click="logout(false)"
          >
            <v-icon>mdi-exit-to-app</v-icon>
          </v-btn>
        </template>
        <span>Cerrar sesión</span>
      </v-tooltip>
    </v-app-bar>
    <v-main>
      <v-alert
        v-if="$nuxt.isOffline"
        dense
        type="error"
      >
        Estas sin acceso a internet. Verifica la conexión WIFI o de datos.
      </v-alert>
      <v-container fluid>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer
      app
      absolute
    >
      <span>&copy; {{ new Date().getFullYear() }} Base de Datos interactiva - Desarrollada para ARNOProducciones por Nicolas Echeverry - Todos los derechos reservados.</span>
    </v-footer>
  </v-app>
</template>

<script>
// import gqlt from 'graphql-tag'
import Cookie from 'js-cookie'
export default {
  middleware: ['defaultCity', 'authenticated'],
  data () {
    return {
      isMobile: false,
      light: null,
      hasPendingChanges: false,
      drawer: false,
      items: [
        {
          icon: 'mdi-tooltip-edit',
          title: 'Tickets',
          to: '/tickets',
          role: 'user'
        },
        {
          icon: 'mdi-account',
          title: 'Clientes',
          to: '/clients',
          role: 'user'
        },
        {
          icon: 'mdi-check-network-outline',
          title: 'Activaciones',
          to: '/activations',
          role: 'admin'
        },
        {
          icon: 'mdi-server-network',
          title: 'Estatus',
          to: '/status',
          role: 'admin'
        },
        {
          icon: 'mdi-cog',
          title: 'Ajustes',
          to: '/config',
          role: 'admin'
        },
        {
          icon: 'mdi-key',
          title: 'Cambios de Clave',
          to: '/password',
          role: 'admin',
          info: 0
        },
        {
          icon: 'mdi-key',
          title: 'Sol. Clave',
          to: '/cambio',
          role: 'admin',
          info: 0
        },
        {
          icon: 'mdi-close-network',
          title: 'Suspencion por Mora',
          to: '/cortes',
          role: 'admin'
        },
        {
          icon: 'mdi-comment',
          title: 'Comentarios Mikrotik',
          to: '/comments',
          role: 'admin'
        },
        {
          icon: 'mdi-routes',
          title: 'Rutas OLT',
          to: '/olt',
          role: 'admin'
        }
      ],
      title: 'Aplicación de Gestión Dinámica ARNOP'
    }
  },
  computed: {
    cities () {
      return this.$store.state.cities
    },
    currentCity () {
      // eslint-disable-next-line eqeqeq
      return this.$store.state.cities ? this.$store.state.cities.find(c => c.id == this.$route.query.city) : ''
    },
    role () {
      return this.$store.state.auth.rolename
    }
  },
  mounted () {
    this.comprobeDateToSetChristmasTheme()
    this.loadThemeFromVuetifyThemeManager()
    this.comprobeSessionResetStatus()
    this.isMobileScreen()
  },
  methods: {
    loadThemeFromVuetifyThemeManager () {
      const currentTheme = localStorage.getItem('currentTheme')
      if (currentTheme) {
        if (currentTheme === 'dark') {
          this.light = false
          this.$vuetify.theme.dark = true
        } else {
          this.light = true
          this.$vuetify.theme.dark = false
        }
      } else {
        localStorage.setItem('currentTheme', 'dark')
      }
    },
    changeTheme () {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      if (this.$vuetify.theme.dark) {
        localStorage.setItem('currentTheme', 'dark')
      } else {
        localStorage.setItem('currentTheme', 'light')
      }
    },
    async comprobeSessionResetStatus () {
      if (this.$store.state.auth) {
        const session = await this.$strapi.find('users', {
          id: this.$store.state.auth.id
        })
        if (session[0].resetSession) {
          await this.restoreReset()
          await this.logout(true)
        }
      }
    },
    async restoreReset () {
      await this.$strapi.update('users', this.$store.state.auth.id, {
        resetSession: false
      })
    },
    setLocalStorage () {
      localStorage.setItem('currentCity', this.$route.query.city)
    },
    comprobeCity () {
      const recordedCity = localStorage.getItem('currentCity')
      const currentCity = this.$route.query.city
      if (currentCity !== recordedCity) {
        this.$store.dispatch('refreshActiveClients', currentCity)
      }
    },
    comprobeDateToSetChristmasTheme () {
      const date = new Date()
      const month = date.getMonth()
      if (month === 11) {
        this.bg = 'cbg.jpg'
      }
    },
    isMobileScreen () {
      const res = document.body.clientWidth
      console.log(res)
      if (res < 800) {
        this.isMobile = true
      } else {
        this.isMobile = false
      }
    },
    logout (params) {
      Cookie.remove('auth')
      Cookie.remove('authToken')
      localStorage.clear()
      sessionStorage.clear()
      this.$store.commit('setAuth', null)
      window.location.href = params ? '/login?resetSession=true' : '/login'
    }
  }
}
</script>
<style scoped>
.secondary-city {
    background: #16312d;
    color: #fff;
}
</style>
