<template>
  <div>
    <v-alert
      v-if="$nuxt.isOffline"
      dense
      type="error"
    >
      Estas sin acceso a internet. Verifica la conexión WIFI o de datos.
    </v-alert>
    <v-tabs
      v-model="tab"
      fixed-tabs
      dark
      :color="currentCity ? currentCity.color : ''"
    >
      <v-tab v-if="can('DeviceStatus')" href="#tab-1">
        <v-icon class="mr-2">
          mdi-server-network
        </v-icon>
        Estatus Mikrotik
      </v-tab>
      <v-tab v-if="can('ActivationRequestsList')" href="#tab-2">
        Activaciones
      </v-tab>
      <v-tab href="#tab-3">
        <v-icon class="mr-2">
          mdi-tooltip-edit
        </v-icon>
        Tickets
      </v-tab>
      <v-tab href="#tab-4">
        <v-icon class="mr-2">
          mdi-account
        </v-icon>
        Clientes
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab" touchless>
      <v-tab-item
        v-if="can('DeviceStatus')"
        :key="1"
        :value="'tab-1'"
      >
        <DeviceStatus />
      </v-tab-item>
      <v-tab-item
        v-if="can('ActivationRequestsList')"
        :key="2"
        :value="'tab-2'"
      >
        <ActivationRequestList />
      </v-tab-item>
      <v-tab-item
        :key="3"
        :value="'tab-3'"
      >
        <Tickets />
      </v-tab-item>
      <v-tab-item
        :key="4"
        :value="'tab-4'"
      >
        <ClientList />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import ClientList from '../components/main/ClientList'
import Tickets from '../components/main/Tickets'
import ActivationRequestList from '../components/main/ActivationRequestList'
import DeviceStatus from '../components/main/DeviceStatus'
export default {
  components: {
    ClientList,
    Tickets,
    ActivationRequestList,
    DeviceStatus
  },
  data () {
    return {
      tab: 'tab-3'
    }
  },
  computed: {
    role () {
      return this.$store.state.auth.allowed_components
    },
    currentCity () {
      // eslint-disable-next-line eqeqeq
      return this.$store.state.cities ? this.$store.state.cities.find(c => c.id == this.$route.query.city) : ''
    }
  },
  async mounted () {
    await this.comprobeCity()
    this.$store.dispatch('loadLocalStorage')
    localStorage.setItem('currentCity', this.$route.query.city)
  },
  methods: {
    can (component) {
      // eslint-disable-next-line camelcase
      const allowed_components = this.role
      // eslint-disable-next-line camelcase
      const current_component = component
      return allowed_components.includes(current_component)
    },
    comprobeCity () {
      const recordedCity = localStorage.getItem('currentCity')
      const currentCity = this.$route.query.city
      if (currentCity !== recordedCity) {
        this.$store.dispatch('refreshActiveClients', currentCity)
      }
    }
  },
  head () {
    return {
      title: this.currentCity ? this.currentCity.name + ' API' : '' + 'ARNOP API',
      meta: [
        { hid: 'language', name: 'language', content: 'es' },
        { hid: 'audience', name: 'audience', content: 'all' },
        { hid: 'rating', name: 'rating', content: 'general' },
        { hid: 'distribution', name: 'distribution', content: 'global' },
        { hid: 'document-type', name: 'document-type', content: 'Public' },
        { hid: 'MSSmartTagsPreventParsing', name: 'MSSmartTagsPreventParsing', content: 'true' },
        { hid: 'robots', name: 'robots', content: 'all' },
        { hid: 'robots', name: 'robots', content: 'all, index, follow' },
        { hid: 'googlebot', name: 'googlebot', content: 'all, index, follow' },
        { hid: 'yahoo-slurp', name: 'yahoo-slurp', content: 'all, index, follow' },
        { hid: 'msnbot', name: 'msnbot', content: 'index, follow' },
        { hid: 'googlebot-image', name: 'googlebot-image', content: 'all' },
        { hid: 'title', name: 'title', content: this.title },
        { hid: 'og:title', property: 'og:title', content: this.title },
        { hid: 'og:description', property: 'og:description', content: 'ARNOProducciones - Base de datos interactiva' },
        { hid: 'author', name: 'author', content: 'Nicolas Echeverry' }
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/lodash@4.13.1/lodash.min.js'
        }
      ]
    }
  }
}
</script>
<style>
  .currentCity {
    color: #ff4500;
  }
</style>
