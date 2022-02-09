<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          :block="block"
          :text="!block"
          :x-small="!block"
          :color="$vuetify.theme.dark && !block ? 'white' : 'primary'"
          v-on="on"
          @click="initComponent()"
        >
          <v-icon>mdi-history</v-icon>
          <span v-if="block">
            Ver Avances
          </span>
        </v-btn>
      </template>
      <span>Historial de Avances</span>
    </v-tooltip>
    <v-dialog
      v-model="modal"
      max-width="990"
    >
      <v-card
        :loading="loading"
      >
        <v-card-title class="headline">
          Historial de Avances
        </v-card-title>
        <div v-if="!loading">
          <v-card-text>
            <h2> {{ name }} </h2>
            <client-only>
              <v-data-table
                :headers="headers"
                :items="ticketdetails"
                :items-per-page="itemsPerPage"
                :page.sync="page"
                no-data-text="No hay avances para mostrar aun..."
                loading-text="Cargando información de tickets..."
                hide-default-footer
                mobile-breakpoint="1024"
                @page-count="pageCount = $event"
              >
                <template v-slot:[`item.createdAt`]="{ item }">
                  <span>{{ getDate(item.createdAt) }}</span>
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
export default {
  name: 'TicketAdvanceHistory',
  apollo: {
    ticketdetails () {
      return {
        query: gqlt`
          query($id: ID!){
            ticketdetails(where: {
              ticket: $id
            }){
              ticket{
                client{
                  name
                }
                tickettype{
                  name
                }
                createdAt
              }
              operator {
                username
              }
              details
              createdAt
            }
          }
        `,
        variables: {
          id: this.ticketid
        },
        skip () {
          return true
        }
      }
    }
  },
  props: {
    ticketid: {
      type: Number,
      default: -1
    },
    name: {
      type: String,
      default: ''
    },
    block: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    modal: false,
    loading: true,
    snack: false,
    snackText: '',
    page: 1,
    pageCount: 0,
    itemsPerPage: 5,
    snackColor: '',
    ticketdetails: [],
    headers: [
      { text: 'Cliente', sortable: true, value: 'ticket.client.name' },
      { text: 'Tipo', sortable: true, value: 'ticket.tickettype.name' },
      { text: 'Creado por', sortable: false, value: 'operator.username' },
      { text: 'Detalles', sortable: true, value: 'details' },
      { text: 'Avance creado el', sortable: true, value: 'createdAt' }
    ]
  }),
  methods: {
    async initComponent () {
      this.modal = true
      this.loading = false
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          ticket: {
            id: {
              $eq: this.ticketid
            }
          }
        },
        populate: [
          'ticket',
          'ticket.client',
          'ticket.tickettype',
          'operator'
        ]
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}ticketdetails?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        }
      })
        .then(res => res.json())
        .then((ticketdetails) => {
          const ticketdetailsRes = ticketdetails.data.map((ticketdetails) => {
            ticketdetails.attributes.ticket.data.attributes.id = ticketdetails.attributes.ticket.data.id
            ticketdetails.attributes.ticket = ticketdetails.attributes.ticket.data.attributes
            ticketdetails.attributes.ticket.client.data.attributes.id = ticketdetails.attributes.ticket.client.data.id
            ticketdetails.attributes.ticket.client = ticketdetails.attributes.ticket.client.data.attributes
            ticketdetails.attributes.ticket.tickettype.data.attributes.id = ticketdetails.attributes.ticket.tickettype.data.id
            ticketdetails.attributes.ticket.tickettype = ticketdetails.attributes.ticket.tickettype.data.attributes
            ticketdetails.attributes.operator.data.attributes.id = ticketdetails.attributes.operator.data.id
            ticketdetails.attributes.operator = ticketdetails.attributes.operator.data.attributes
            ticketdetails.attributes.id = ticketdetails.id
            ticketdetails = ticketdetails.attributes
            return ticketdetails
          })
          this.ticketdetails = ticketdetailsRes
        })
    },
    getDate (date) {
      const dateObject = new Date(date)
      const humanDateFormat = dateObject.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })
      return humanDateFormat
    }
  }
}
</script>

<style>

</style>
