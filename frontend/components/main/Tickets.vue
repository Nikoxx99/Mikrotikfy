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
            Tickets
            <v-switch
              v-model="showClosedValue"
              class="ml-4"
              label="Mostrar cerrados"
              @change="showClosed(showClosedValue)"
            />
            <v-spacer />
            <v-text-field
              v-model="search"
              prepend-icon="mdi-magnify"
              label="Buscar Tickets"
              single-line
              hide-details
              outlined
              autofocus
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
              name
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
      headers: [
        { text: 'Estado', sortable: true, value: 'active' },
        { text: 'Cliente', sortable: true, value: 'client.name' },
        { text: 'Tipo', sortable: true, value: 'tickettype.name' },
        { text: 'Operador', sortable: false, value: 'assiganted.username' },
        { text: 'Detalles', sortable: true, value: 'details' },
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
  mounted () {
    this.ticketList = this.tickets
    this.showClosed(false)
  },
  methods: {
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
