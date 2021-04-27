<template>
  <v-app
    dark
  >
    <v-navigation-drawer
      v-model="drawer"
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
      <template v-slot:img="{ props }">
        <v-img
          v-bind="props"
          gradient="to top right, rgba(0,0,0,.5), rgba(0,0,0,.8)"
        />
      </template>
      <div v-if="hasPendingChanges">
        <svg height="13" width="20" style="position:absolute;top:12px;left:43px;">
          <circle cx="10" cy="8" r="5" fill="red" />
        </svg>
      </div>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title class="d-none d-md-flex d-lg-flex d-xl-flex" v-text="title" />
      <v-spacer />
      <div v-if="$store.state.auth">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-icon
              class="mr-1 green--text darken-4"
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
          v-for="city in $store.state.cities"
          :key="city.id"
          class="mr-4"
          small
          outlined
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
  middleware: ['defaultCity', 'authenticated', 'session'],
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
        },
        {
          icon: 'mdi-comment',
          title: 'Comentarios Mikrotik',
          to: '/comments'
        },
        {
          icon: 'mdi-routes',
          title: 'Rutas OLT',
          to: '/olt'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Aplicación de Gestión Dinámica ARNOP',
      bg: 'https://picsum.photos/1920/1080?random'
    }
  },
  computed: {
    cities () {
      return this.$store.state.cities
    }
  },
  mounted () {
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
    logout () {
      Cookie.remove('auth')
      Cookie.remove('authToken')
      localStorage.clear()
      this.$store.commit('setAuth', null)
      this.$router.replace('/login')
    }
  }
}
</script>
