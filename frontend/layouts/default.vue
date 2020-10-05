<template>
  <v-app
    dark
  >
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      src="nav-bg.jpg"
      fixed
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
          <v-list-item-action>
            <span>
              {{ item.info }}
            </span>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <svg height="13" width="20" style="position:absolute;top:12px;left:43px;">
        <span>1</span>
        <circle cx="10" cy="8" r="5" fill="red" />
      </svg>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title class="d-none d-md-flex d-lg-flex d-xl-flex" v-text="title" />
      <v-spacer />
      <div v-if="$store.state.auth">
        <v-btn
          v-for="city in Cities"
          :key="city.id"
          class="mr-4"
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
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }} Base de Datos interactiva - Desarrollada para ARNOProducciones por Nicolas Echeverry - Todos los derechos reservados.</span>
    </v-footer>
  </v-app>
</template>

<script>
import gql from 'graphql-tag'
import Cookie from 'js-cookie'
export default {
  apollo: {
    Cities () {
      return {
        query: gql`
        query{
          Cities{
            id
            name
            color
          }
        }
      `
      }
    },
    PasswordChanges () {
      return {
        query: gql`
        query{
          PasswordChanges(limit: 100){
            closed {
              name
              value
            }
          }
        }
      `
      }
    }
  },
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
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
          info: 1
        },
        {
          icon: 'mdi-close-network',
          title: 'Suspencion por Mora',
          to: '/config'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'ARNOProducciones SAS'
    }
  },
  mounted () {
    for (let i = 0; i < this.PasswordChanges.length; i++) {
      if (this.PasswordChanges[i].closed.value === true) {
        this.items[2].info++
      }
    }
  },
  methods: {
    logout () {
      Cookie.remove('auth')
      this.$store.commit('setAuth', null)
      this.$router.replace('/login')
    }
  }
}
</script>
