<template>
  <div>
    <v-row>
      <v-col
        cols="12"
      >
        <v-card>
          <v-card-text>
            <v-row>
              <v-tooltip top>
                <!-- eslint-disable -->
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    color="white black--text"
                    class="mt-4 mx-4"
                    dark
                    rounded
                    :disabled="refreshLoading"
                    :loading="refreshLoading"
                    v-on="on"
                    @click="getActivationRequestsFromDatabase()"
                  >
                    <v-icon>mdi-reload</v-icon>
                  </v-btn>
                </template>
                <span>Refrescar Peticiones de Activacion</span>
              </v-tooltip>
            </v-row>
          </v-card-text>
          <client-only>
            <v-data-table
              :key="key"
              :headers="headers"
              :items="activationRequestsList"
              :search="search"
              :items-per-page="itemsPerPage"
              :page.sync="page"
              :loading="initialLoading"
              sort-by="createdAt"
              calculate-widths
              sort-desc
              no-data-text="No hay peticiones de activacion abiertas aún..."
              loading-text="Cargando peticiones de activación..."
              dense
              hide-default-footer
              mobile-breakpoint="100"
              @page-count="pageCount = $event"
            >
              <template v-slot:[`item.actions`]="props">
                <v-tooltip left>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      :color="props.item.active ? 'green darken-3' : 'red darken-3'"
                      :disabled="props.item.active"
                      dark
                      small
                      :loading="props.item.loading"
                      v-bind="attrs"
                      text
                      v-on="on"
                      @click="updateStatus(activationRequestsList.map(function(x) {return x.id; }).indexOf(props.item.id))"
                    >
                      <v-icon>mdi-{{ props.item.active ? 'check' : 'close' }} {{ props.index }}</v-icon>
                    </v-btn>
                  </template>
                <span>Activar Cliente</span>
                </v-tooltip>
              </template>
              <template v-slot:[`item.active`]="props">
                <v-chip small :color="getColor(props.item.active)" class="white--text">
                  {{ getState(props.item.active) }}
                </v-chip>
              </template>
              <template v-slot:[`item.createdAt`]="{ item }">
                <span>
                  {{ getDate(item.createdAt) }}
                </span>
              </template>
              <template v-slot:[`item.client.createdAt`]="{ item }">
                <span>
                  {{ getDate(item.client.createdAt) }}
                </span>
              </template>
            </v-data-table>
          </client-only>
          <div class="text-center pt-2">
            <v-pagination v-model="page" :length="pageCount" />
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar
      v-model="snack"
      :timeout="3000"
      :color="snackColor"
      top
      vertical
    >
      {{ snackText }}

      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: 'ActivationRequestsList',
  data () {
    return {
      key: 0,
      page: 1,
      pageCount: 0,
      itemsPerPage: 5,
      search: '',
      cityName: '',
      cityColor: '',
      alertBox: false,
      dialog: false,
      dialogEdit: false,
      initialLoading: false,
      loading: false,
      showClosedValue: false,
      refreshLoading: false,
      headers: [
        { text: 'Estado', sortable: false, value: 'active', width: '5%' },
        { text: 'Codigo', sortable: false, value: 'client.code', width: 60 },
        { text: 'Cliente', sortable: false, value: 'client.name', width: 150 },
        { text: 'Dirección', sortable: false, value: 'client.address', width: 200 },
        { text: 'Barrio', sortable: false, value: 'client.neighborhood.name', width: 100 },
        { text: 'Creado Cliente', sortable: false, value: 'client.createdAt' },
        { text: 'Operador', sortable: false, value: 'operator.username', width: 60 },
        { text: 'Creada Solicitud', sortable: false, value: 'createdAt' },
        { text: 'Acciones', sortable: false, value: 'actions' }
      ],
      States: [{ name: 'Abierto', value: true }, { name: 'Cerrado', value: false }],
      snack: false,
      snackColor: '',
      snackText: ''
    }
  },
  computed: {
    currentCity () {
      // eslint-disable-next-line eqeqeq
      return this.$store.state.cities ? this.$store.state.cities.find(c => c.id == this.$route.query.city) : ''
    },
    activationRequestsList () {
      return this.$store.state.activationrequest.activationrequests
    }
  },
  mounted () {
    this.getActivationRequestsFromDatabase()
  },
  methods: {
    async getActivationRequestsFromDatabase () {
      this.loading = true
      await this.$store.dispatch('activationrequest/getActivationRequestsFromDatabase', { city: this.$route.query.city, token: this.$store.state.auth.token })
      this.loading = false
    },
    async updateStatus (index) {
      await this.$store.dispatch('activationrequest/updateActivationRequest', { token: this.$store.state.auth.token, activationrequest: this.activationRequestsList[index], index })
      await this.$store.dispatch('activationrequest/createClientOnMikrotikById', { token: this.$store.state.auth.token, clientid: this.activationRequestsList[index].client.id, operador: this.$store.state.auth.username })
    },
    getDate (date) {
      const dateObject = new Date(date)
      const humanDateFormat = dateObject.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })
      return humanDateFormat
    },
    getColor (state) {
      if (state) {
        return 'blue darken-4'
      } else {
        return 'red'
      }
    },
    getState (state) {
      if (state) {
        return 'Abierto'
      } else {
        return 'Cerrado'
      }
    }
  }
}
</script>
