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
              mobile-breakpoint="600"
              @page-count="pageCount = $event"
            >
              <template v-slot:item.actions="props">
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
export default {
  name: 'TicketChanges',
  components: {
    CreateTicketAdvance,
    TicketAdvanceHistory
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
        { text: 'Codigo', sortable: true, value: 'client.code', width: 150 },
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
      title: 'Cambios de Clave',
      States: [{ name: 'Abierto', value: true }, { name: 'Cerrado', value: false }],
      snack: false,
      snackColor: '',
      snackText: '',
      ticketList: []
    }
  },
  async mounted () {
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
        return 'blue'
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
