<template>
  <div>
    <v-row>
      <v-col
        cols="12"
      >
        <v-card>
          <v-card-title
            :style="`color:${cityColor};`"
          >
            <span class="mr-4">Tickets</span>
            <v-switch
              v-model="showClosedValue"
              class="mr-4"
              label="Mostrar cerrados"
              @change="showClosed(showClosedValue)"
            />
            <v-tooltip top>
              <!-- eslint-disable -->
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  color="blue darken-4"
                  dark
                  :disabled="refreshLoading"
                  :loading="refreshLoading"
                  v-on="on"
                  @click="refreshTickets()"
                >
                  <v-icon>mdi-reload</v-icon>
                </v-btn>
              </template>
              <span>Refrescar Tickets</span>
            </v-tooltip>
            <v-spacer />
            <v-text-field
              ref="searchTicket"
              v-model="search"
              prepend-icon="mdi-magnify"
              label="Buscar Tickets"
              single-line
              hide-details
              outlined
              dense
              class="white--text"
            />
          </v-card-title>
          <client-only>
            <v-data-table
              :key="key"
              :headers="headers"
              :items="ticketList"
              :search="search"
              :items-per-page="itemsPerPage"
              :page.sync="page"
              :loading="initialLoading"
              sort-by="createdAt"
              calculate-widths
              sort-desc
              no-data-text="No hay Tickets abiertos aún..."
              loading-text="Cargando información de tickets..."
              dense
              hide-default-footer
              mobile-breakpoint="100"
              @page-count="pageCount = $event"
            >
              <template v-slot:item.actions="props">
                <ClientStatus
                    v-if="can('ClientStatus')"
                    :name="props.item.client.name"
                    :clientid="props.item.client.id"
                    :code="props.item.client.code"
                    :role="allowed_components"
                  />
                <CreateTicketAdvance
                  :editindex="tickets.indexOf(props.item)"
                  :ticketid="props.item.id"
                  :name="props.item.client.name"
                  @updateTicketStatus="updateTicketStatus($event)"
                />
                <TicketAdvanceHistory
                  :ticketid="props.item.id"
                  :name="props.item.client.name"
                />
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
import CreateTicketAdvance from '../create/CreateTicketAdvance'
import TicketAdvanceHistory from '../misc/TicketAdvanceHistory'
import ClientStatus from '../main/ClientStatus'
export default {
  name: 'TicketChanges',
  components: {
    CreateTicketAdvance,
    TicketAdvanceHistory,
    ClientStatus
  },
  apollo: {
    tickets () {
      return {
        query: gql`
        query($city: String){
          tickets(where: {
            city:$city
          }){
            id
            active
            client{
              id
              code
              name
              address
              neighborhood{
                name
              }
              phone
            }
            tickettype{
              name
            }
            assiganted{
              username
            }
            details
            createdAt
          }
        }
      `,
        variables: {
          city: this.$route.query.city
        },
        skip () {
          return true
        }
      }
    },
    role () {
      return {
        query: gql`
        query($id: ID!){
          role(id: $id){
            name
            allowed_components{
              name
            }
          }
        }
      `,
        variables: {
          id: this.$store.state.auth.role
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
      currentCity: 'Mariquita',
      cityName: '',
      cityColor: '',
      alertBox: false,
      dialog: false,
      dialogEdit: false,
      initialLoading: false,
      showClosedValue: false,
      refreshLoading: false,
      headers: [
        { text: 'Estado', sortable: true, value: 'active', width: '5%' },
        { text: 'Codigo', sortable: true, value: 'client.code', width: 60 },
        { text: 'Cliente', sortable: true, value: 'client.name', width: 150 },
        { text: 'Dirección', sortable: true, value: 'client.address', width: 200 },
        { text: 'Barrio', sortable: true, value: 'client.neighborhood.name', width: 100 },
        { text: 'Telefono', sortable: true, value: 'client.phone', width: 100 },
        { text: 'Tipo', sortable: true, value: 'tickettype.name', width: 150 },
        { text: 'Operador', sortable: false, value: 'assiganted.username', width: 60 },
        { text: 'Detalles', sortable: true, value: 'details', width: 400 },
        { text: 'Creado', sortable: true, value: 'createdAt' },
        { text: 'Acciones', sortable: true, value: 'actions' }
      ],
      States: [{ name: 'Abierto', value: true }, { name: 'Cerrado', value: false }],
      snack: false,
      snackColor: '',
      snackText: '',
      ticketList: [],
      allowed_components: []
    }
  },
  async mounted () {
    this.populareRole()
    this.$apollo.queries.tickets.skip = false
    await this.$apollo.queries.tickets.fetchMore({
      variables: {
        city: this.$route.query.city
      },
      updateQuery: (_, { fetchMoreResult }) => {
        const newTickets = fetchMoreResult.tickets
        this.ticketList = newTickets
      }
    })
    await this.showClosed(false)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'j' && (e.altKey)) {
        this.$refs.searchTicket.focus()
      }
      if (e.key === 'Escape') {
        this.search = ''
      }
    })
  },
  methods: {
    async refreshTickets () {
      this.refreshLoading = true
      await this.$apollo.queries.tickets.fetchMore({
        variables: {
          id: this.$route.query.city
        },
        updateQuery: (_, { fetchMoreResult }) => {
          const newTickets = fetchMoreResult.tickets
          this.tickets = newTickets
          this.showClosed(this.showClosedValue)
          this.refreshLoading = false
        }
      })
    },
    updateTicketStatus (value) {
      if (value.editindex > -1) {
        this.tickets[value.editindex].active = !value.closeTicket
      }
    },
    showClosed (value) {
      const newData = []
      this.tickets.map((ticket) => {
        if (value === false) {
          if (ticket.active) {
            newData.push(ticket)
          }
        } else {
          newData.push(ticket)
        }
      })
      this.ticketList = newData
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
    async populareRole () {
      if (this.localStorageHandler('role', 'count')) {
        this.role = this.localStorageHandler('role', 'get')
        this.allowed_components = this.role.allowed_components.map((c) => {
          return c.name
        })
      } else {
        this.$apollo.queries.role.skip = false
        await this.$apollo.queries.role.fetchMore({
          updateQuery: (_, { fetchMoreResult }) => {
            const newRoleInfo = fetchMoreResult.role
            this.localStorageHandler('role', 'set', newRoleInfo)
            this.role = newRoleInfo
          }
        })
        this.allowed_components = this.role.allowed_components.map((c) => {
          return c.name
        })
      }
    },
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
    can (component) {
      // eslint-disable-next-line camelcase
      const allowed_components = this.allowed_components
      // eslint-disable-next-line camelcase
      const current_component = component
      return allowed_components.includes(current_component)
    }
  }
}
</script>
