<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          v-bind="attrs"
          color="blue darken-4"
          v-on="on"
          @click="initComponent()"
        >
          mdi-server
        </v-icon>
      </template>
      <span>Historial de Avances</span>
    </v-tooltip>
    <v-dialog
      v-model="modal"
      max-width="590"
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
            <v-data-table
              :headers="headers"
              :items="ticketdetails"
              :items-per-page="10"
            />
          </v-card-text>
        </div>
        <v-card-actions>
          <v-spacer />

          <v-btn
            color="green darken-1"
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
import gql from 'graphql-tag'
export default {
  name: 'TicketAdvanceHistory',
  props: {
    ticketid: {
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
    loading: false,
    snack: false,
    snackText: '',
    snackColor: '',
    ticketdetails: [],
    headers: [
      { text: 'Estado', sortable: true, value: 'active' },
      { text: 'Cliente', sortable: true, value: 'client.name' },
      { text: 'Tipo', sortable: true, value: 'tickettype.name' },
      { text: 'Operador', sortable: false, value: 'assiganted.username' },
      { text: 'Detalles', sortable: true, value: 'details' },
      { text: 'Creado', sortable: true, value: 'createdAt' }
    ]
  }),
  methods: {
    initComponent () {
      this.modal = true
      this.$apollo.query({
        query: gql`
          query($id: ID!){
            ticketdetails(where: {
              ticket: $id
            }){
              ticket{
                active
                client{
                  name
                }
                tickettype{
                  name
                }
                createdAt
                assiganted {
                  username
                }
                details
              }
            }
          }
        `,
        variables: {
          id: this.ticketid
        }
      }).then((input) => {
        console.log(input)
        this.ticketdetails = input.data.ticketdetails
      }).catch((error) => {
        this.snack = true
        this.snackColor = 'red'
        this.snackText = error
      })
    },
    CreateTicketAdvance () {
      this.$apollo.mutate({
        mutation: gql`mutation ($id: ID!, $status: Boolean){
          updateTicket(input: {
          where: {
            id: $id
          }
          data: {
            active: $status
          }
        }){
          ticket{
            id
          }
        }
        }`,
        variables: {
          id: this.ticketAdvance.id,
          status: this.ticketAdvance.closeTicket
        }
      }).then(() => {
        this.$apollo.mutate({
          mutation: gql`mutation ($id: ID!, $details: String){
            createTicketdetail(input: {
              data: {
                ticket: $id
                details: $details
              }
            }) {
              ticketdetail{
                ticket{
                  id
                }
              }
            }
          }`,
          variables: {
            id: this.ticketAdvance.id,
            details: this.ticketAdvance.details
          }
        }).then((input) => {
          this.snack = true
          this.snackColor = 'info'
          this.snackText = 'Ticket actualizado con éxito.'
        }).catch((error) => {
          this.snack = true
          this.snackColor = 'red'
          this.snackText = error
        })
      }).catch((error) => {
        this.snack = true
        this.snackColor = 'red'
        this.snackText = error
      })
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
