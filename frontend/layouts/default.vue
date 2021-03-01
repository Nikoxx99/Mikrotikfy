<template>
  <v-app
    dark
  >
    <v-navigation-drawer
      v-model="drawer"
      src="nav-bg.jpg"
      absolute
      temporary
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :href="item.to"
          router
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
      :src="bg"
    >
      <div v-if="hasPendingChanges">
        <svg height="13" width="20" style="position:absolute;top:12px;left:43px;">
          <circle cx="10" cy="8" r="5" fill="red" />
        </svg>
      </div>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title class="d-none d-md-flex d-lg-flex d-xl-flex" v-text="title" />
      <v-spacer />
      <div v-if="$store.state.auth">
        <span class="mr-4">{{ $store.state.auth.username.charAt(0).toUpperCase() + $store.state.auth.username.slice(1) }}</span>
        <v-btn
          v-for="city in cities"
          :key="city.id"
          class="mr-4"
          small
          :color="city.color"
          :href="`/lista?city=${city.id}`"
        >
          {{ city.name }}
        </v-btn>
      </div>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            large
            v-bind="attrs"
            v-on="on"
            @click="logout"
          >
            <v-icon>mdi-exit-to-app</v-icon>
          </v-btn>
        </template>
        <span>Cerrar sesión</span>
      </v-tooltip>
    </v-app-bar>
    <v-main>
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
import gql from 'graphql-tag'
import Cookie from 'js-cookie'
export default {
  middleware: ['defaultCity', 'authenticated'],
  apollo: {
    cities () {
      return {
        query: gql`
        query{
          cities{
            id
            name
            color
          }
        }
      `,
        skip () {
          return true
        }
      }
    }
  },
  data () {
    return {
      hasPendingChanges: false,
      drawer: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Base de Datos',
          to: '/lista'
        },
        {
          icon: 'mdi-cog',
          title: 'Ajustes',
          to: '/config'
        },
        {
          icon: 'mdi-key',
          title: 'Cambios de Clave',
          to: '/password',
          info: 0
        },
        {
          icon: 'mdi-key',
          title: 'Sol. Clave',
          to: '/cambio',
          info: 0
        },
        {
          icon: 'mdi-close-network',
          title: 'Suspencion por Mora',
          to: '/cortes'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'ARNOProducciones SAS',
      bg: '',
      cities: {}
    }
  },
  mounted () {
    this.populareCities()
    const date = new Date()
    const month = date.getMonth()
    if (month === 11) {
      this.bg = 'cbg.jpg'
    }
    this.$apollo.query({
      query: gql`
      query {
        passwordchanges{
          closed
        }
      }
      `
    }).then((input) => {
      for (let i = 0; i < input.data.passwordchanges.length; i++) {
        if (input.data.passwordchanges[i].closed.value === false) {
          this.items[2].info++
        }
      }
      if (this.items[2].info > 0) {
        this.hasPendingChanges = true
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  methods: {
    localStorageHandler (storage, action, payload) {
      if (action === 'get') {
        return JSON.parse(localStorage.getItem(storage))
      }
      if (action === 'set') {
        localStorage.setItem(storage, JSON.stringify(payload))
      }
      if (action === 'count') {
        if (localStorage.getItem(storage)) {
          return true
        } else {
          return false
        }
      }
    },
    async populareCities () {
      if (this.localStorageHandler('cities', 'count')) {
        this.cities = this.localStorageHandler('cities', 'get')
      } else {
        this.$apollo.queries.cities.skip = false
        await this.$apollo.queries.cities.fetchMore({
          updateQuery: (_, { fetchMoreResult }) => {
            const newCitiesInfo = fetchMoreResult.cities
            this.cities = newCitiesInfo
            this.localStorageHandler('cities', 'set', newCitiesInfo)
          }
        })
      }
    },
    logout () {
      Cookie.remove('auth')
      Cookie.remove('authToken')
      this.$store.commit('setAuth', null)
      this.$router.replace('/login')
    }
  }
}
</script>
