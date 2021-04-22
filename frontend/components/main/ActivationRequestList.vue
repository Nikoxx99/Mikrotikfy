<template>
  <div
    v-if="can('ActivationRequestsList')"
  >
    <v-row>
      <v-col
        cols="12"
      >
        <v-card>
          <v-card-title
            :style="`background-color:${currentCity ? currentCity.color : ''};`"
          >
            <span class="mr-4">Peticiones de Activación</span>
          </v-card-title>
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
                    :disabled="refreshLoading"
                    :loading="refreshLoading"
                    v-on="on"
                    @click="refreshActivationRequests()"
                  >
                    <v-icon>mdi-reload</v-icon>
                  </v-btn>
                </template>
                <span>Refrescar Peticiones de Activacion</span>
              </v-tooltip>
              <v-checkbox
                v-model="showClosedValue"
                class="mr-4"
                label="Mostrar cerrados"
                @change="showClosed(showClosedValue)"
              />
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
              <template v-slot:top>
                <v-row
                  class="mx-1"
                >
                  <v-spacer class="d-none d-xs-none d-sm-block d-md-block d-lg-block d-lx-block" />
                  <v-text-field
                    ref="searchTicket"
                    v-model="search"
                    prepend-icon="mdi-magnify"
                    label="Buscar Solicitudes"
                    single-line
                    hide-details
                    outlined
                    dense
                    style="max-width: 1000px"
                    class="white--text"
                  />
                </v-row>
              </template>
              <template v-slot:item.actions="props">
                <v-tooltip left>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      :color="props.item.client.active ? 'green darken-3' : 'red darken-3'"
                      dark
                      small
                      :loading="props.item.loading"
                      v-bind="attrs"
                      text
                      v-on="on"
                      @click="updateStatus(props.item.client.active, activationRequestsList.map(function(x) {return x.id; }).indexOf(props.item.id))"
                    >
                      <v-icon>mdi-{{ props.item.client.active ? 'check' : 'close' }} {{ props.index }}</v-icon>
                    </v-btn>
                  </template>
                <span>Activar Cliente</span>
                </v-tooltip>
              </template>
              <template v-slot:item.active="props">
                <v-chip small :color="getColor(props.item.active)" class="white--text">
                  {{ getState(props.item.active) }}
                </v-chip>
              </template>
              <template v-slot:item.createdAt="{ item }">
                <span>
                  {{ getDate(item.createdAt) }}
                </span>
              </template>
              <template v-slot:item.client.createdAt="{ item }">
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
import gql from 'graphql-tag'
export default {
  name: 'ActivationRequestsList',
  apollo: {
    activationrequests () {
      return {
        query: gql`
        query($city: String){
          activationrequests(where: {
            city:$city
          }){
            id
            active
            client{
              id
              code
              dni
              name
              address
              phone
              neighborhood{
                id
                name
              }
              city{
                id
                name
              }
              plan {
                id
              }
              wifi_ssid
              wifi_password
              technology{
                id
              }
              createdAt
              active
              comment
            }
            operator{
              username
            }
            mac_address
            nap_onu_address
            opticalPower
            createdAt
          }
        }
      `,
        variables: {
          city: this.$route.query.city,
          limit: 10
        },
        skip () {
          return true
        }
      }
    }
  },
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
        { text: 'Estado', value: 'active', width: '5%' },
        { text: 'Codigo', value: 'client.code', width: 60 },
        { text: 'Cliente', value: 'client.name', width: 150 },
        { text: 'Dirección', value: 'client.address', width: 200 },
        { text: 'Barrio', value: 'client.neighborhood.name', width: 100 },
        { text: 'Creado Cliente', value: 'client.createdAt' },
        { text: 'Operador', sortable: false, value: 'operator.username', width: 60 },
        { text: 'Creada Solicitud', value: 'createdAt' },
        { text: 'Acciones', value: 'actions' }
      ],
      States: [{ name: 'Abierto', value: true }, { name: 'Cerrado', value: false }],
      snack: false,
      snackColor: '',
      snackText: '',
      activationRequestsList: [],
      allowed_components: []
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
    this.$apollo.queries.activationrequests.skip = false
    await this.$apollo.queries.activationrequests.fetchMore({
      variables: {
        limit: 10
      },
      updateQuery: (_, { fetchMoreResult }) => {
      }
    })
    await this.showClosed(false)
    const newContent = await this.mapDatatable(this.activationRequestsList)
    this.activationRequestsList = newContent
  },
  methods: {
    async refreshActivationRequests () {
      this.refreshLoading = true
      await this.$apollo.queries.activationrequests.fetchMore({
        variables: {
          id: this.$route.query.city
        },
        updateQuery: (_, { fetchMoreResult }) => {
          const newActivationRequests = fetchMoreResult.activationrequests
          this.activationrequests = newActivationRequests
          this.showClosed(this.showClosedValue)
          this.refreshLoading = false
        }
      })
    },
    updateActivationRequestStatus (value) {
      if (value.editindex > -1) {
        this.activationrequests[value.editindex].active = !value.closeTicket
      }
    },
    showClosed (value) {
      if (this.activationrequests) {
        const newData = []
        this.activationrequests.map((activationrequest) => {
          if (value === false) {
            if (activationrequest.active) {
              newData.push(activationrequest)
            }
          } else {
            newData.push(activationrequest)
          }
        })
        this.activationRequestsList = newData
      }
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
    },
    updateStatus (status, index) {
      if (status === true) {
        this.activationRequestsList[index].client.active = !this.activationRequestsList[index].client.active
        this.activationRequestsList[index].loading = !this.activationRequestsList[index].loading
        this.$apollo.mutate({
          mutation: gql`mutation ($input: adminDeleteFromRequestInput){
            adminDeleteFromRequest(input: $input)
          }`,
          variables: {
            input: {
              id: this.activationRequestsList[index].id,
              client: {
                id: this.activationRequestsList[index].client.id
              }
            }
          }
        }).then(() => {
          this.refreshActivationRequests()
          this.showClosedValue = false
          this.activationRequestsList[index].loading = !this.activationRequestsList[index].loading
          this.snack = true
          this.snackColor = 'red'
          this.snackText = 'Cliente eliminado de la mikrotik'
        }).catch((error) => {
          this.snack = true
          this.snackColor = 'red'
          this.snackText = error
          this.activationRequestsList[index].loading = !this.activationRequestsList[index].loading
        })
      } else {
        this.activationRequestsList[index].client.active = !this.activationRequestsList[index].client.active
        this.activationRequestsList[index].loading = !this.activationRequestsList[index].loading
        const currentClientToCreate = this.activationRequestsList[index].client
        this.$apollo.mutate({
          mutation: gql`mutation ($input: adminCreateFromRequestInput){
            adminCreateFromRequest(input: $input)
          }`,
          variables: {
            input: {
              id: this.activationRequestsList[index].id,
              client: {
                id: currentClientToCreate.id,
                code: currentClientToCreate.code,
                name: currentClientToCreate.name,
                dni: currentClientToCreate.dni,
                address: currentClientToCreate.address,
                neighborhood: currentClientToCreate.neighborhood.id,
                city: currentClientToCreate.city.id,
                phone: currentClientToCreate.phone,
                plan: currentClientToCreate.plan.id,
                wifi_ssid: currentClientToCreate.wifi_ssid,
                wifi_password: currentClientToCreate.wifi_password,
                technology: currentClientToCreate.technology.id,
                mac_address: this.activationrequests[index].mac_address,
                nap_onu_address: this.activationrequests[index].nap_onu_address,
                opticalPower: this.activationrequests[index].opticalPower,
                operator: this.$store.state.auth.username,
                comment: currentClientToCreate.comment
              }
            }
          }
        }).then((input) => {
          this.refreshActivationRequests()
          this.activationRequestsList[index].loading = !this.activationRequestsList[index].loading
          this.snack = true
          this.snackColor = 'info'
          this.snackText = 'Cliente aprobado'
        }).catch((error) => {
          this.refreshActivationRequests()
          this.activationRequestsList[index].loading = !this.activationRequestsList[index].loading
          this.snack = true
          this.snackColor = 'red'
          this.snackText = error
        })
      }
    },
    mapDatatable (items) {
      for (let i = 0; i < items.length; i++) {
        this.$set(items[i], 'loading', false)
      }
      return items
    },
    can (component) {
      // eslint-disable-next-line camelcase
      const allowed_components = this.role
      // eslint-disable-next-line camelcase
      const current_component = component
      return allowed_components.includes(current_component)
    }
  }
}
</script>
