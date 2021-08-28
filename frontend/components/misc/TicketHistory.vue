<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          v-bind="attrs"
          :color="$vuetify.theme.dark ? 'white' : 'primary'"
          v-on="on"
          @click="initComponent()"
        >
          mdi-history
        </v-icon>
      </template>
      <span>Historial de Tickets</span>
    </v-tooltip>
    <v-dialog
      v-model="modal"
      max-width="990"
    >
      <v-card
        :loading="loading"
      >
        <v-card-title class="headline">
          Historial de Tickets
        </v-card-title>
        <div v-if="!loading">
          <v-card-text>
            <h2> {{ name }} </h2>
            <client-only>
              <v-data-table
                :headers="headers"
                :items="tickets"
                :items-per-page="itemsPerPage"
                sort-by="createdAt"
                calculate-widths
                sort-desc
                :page.sync="page"
                no-data-text="No hay tickets para mostrar aun..."
                loading-text="Cargando información de tickets..."
                dense
                hide-default-footer
                mobile-breakpoint="100"
                @page-count="pageCount = $event"
              >
                <template v-slot:[`item.actions`]="props">
                  <TicketAdvanceHistory
                    :ticketid="props.item.id"
                    :name="props.item.client.name"
                  />
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
              </v-data-table>
            </client-only>
            <div class="text-center pt-2">
              <v-pagination v-model="page" :length="pageCount" />
            </div>
          </v-card-text>
        </div>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="modal = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
import gqlt from 'graphql-tag'
import TicketAdvanceHistory from '../misc/TicketAdvanceHistory'
export default {
  name: 'TicketHistory',
  components: {
    TicketAdvanceHistory
  },
  apollo: {
    tickets () {
      return {
        query: gqlt`
          query($id: ID!){
            tickets(where: {
              client: $id
            }){
              id
              active
              client{
                code
                name
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
          id: this.clientid
        },
        skip () {
          return true
        }
      }
    }
  },
  props: {
    clientid: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    modal: false,
    loading: true,
    page: 1,
    pageCount: 0,
    itemsPerPage: 10,
    snack: false,
    snackText: '',
    snackColor: '',
    tickets: [],
    headers: [
      { text: 'Estado', sortable: true, value: 'active' },
      { text: 'Cliente', sortable: true, value: 'client.name' },
      { text: 'Tipo', sortable: true, value: 'tickettype.name' },
      { text: 'Operador', sortable: false, value: 'assiganted.username' },
      { text: 'Detalles', sortable: true, value: 'details' },
      { text: 'Creado', sortable: true, value: 'createdAt' },
      { text: 'Acciones', sortable: true, value: 'actions' }
    ]
  }),
  methods: {
    async initComponent () {
      this.modal = true
      this.loading = false
      this.$apollo.queries.tickets.skip = false
      await this.$apollo.queries.tickets.fetchMore({
        variables: {
          id: this.clientid
        },
        updateQuery: (_, { fetchMoreResult }) => {
          const newInfo = fetchMoreResult.tickets
          this.tickets = newInfo
        }
      })
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

<style>

</style>
