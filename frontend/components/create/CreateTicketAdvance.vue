<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          v-bind="attrs"
          color="cyan darken-4"
          v-on="on"
          @click="initComponent()"
        >
          mdi-plus
        </v-icon>
      </template>
      <span>Crear Avance</span>
    </v-tooltip>
    <v-dialog
      v-model="modal"
      max-width="590"
    >
      <v-card
        :loading="loading"
      >
        <v-card-title class="headline">
          Crear Avance en Ticket
        </v-card-title>
        <div v-if="!loading">
          <v-card-text>
            <h2> {{ name }} </h2>
            <v-textarea
              v-model="ticketAdvance.details"
              outlined
              class="mt-4"
              label="Detalles adicionales"
            />
            <v-checkbox
              v-if="$store.state.auth.rolename === 'superadmin'"
              v-model="ticketAdvance.escalated"
              color="red"
              label="Escalar caso?"
            />
            <v-checkbox
              v-model="ticketAdvance.closeTicket"
              color="red"
              label="Cerrar Ticket?"
            />
          </v-card-text>
        </div>
        <v-card-actions>
          <v-btn
            :color="ticketAdvance.closeTicket ? 'red darken-4' : 'blue darken-4'"
            @click="CreateTicketAdvance()"
          >
            {{ ticketAdvance.closeTicket ? ticketAdvance.escalated ? 'Cerrar Ticket' : 'Cerrar Ticket' : ticketAdvance.escalated ? 'Escalar caso' : 'Crear Avance' }}
          </v-btn>
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
    <v-snackbar
      v-model="snack"
      :timeout="1000"
      :color="snackColor"
      bottom
      vertical
    >
      {{ snackText }}

      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </span>
</template>

<script>
import gqlt from 'graphql-tag'
export default {
  name: 'CreateTicketAdvance',
  props: {
    editindex: {
      type: Number,
      default: -1
    },
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
    ticketAdvance: {
      id: '',
      details: '',
      closeTicket: false,
      escalated: false,
      editindex: -1
    }
  }),
  methods: {
    initComponent () {
      this.modal = true
      this.ticketAdvance.id = this.ticketid
      this.ticketAdvance.editindex = this.editindex
    },
    CreateTicketAdvance () {
      this.$apollo.mutate({
        mutation: gqlt`mutation ($id: ID!, $status: Boolean, $escalated: Boolean){
          updateTicket(input: {
          where: {
            id: $id
          }
          data: {
            active: $status
            answered: true
            escalated: $escalated
          }
        }){
          ticket{
            id
          }
        }
        }`,
        variables: {
          id: this.ticketAdvance.id,
          status: !this.ticketAdvance.closeTicket,
          escalated: this.ticketAdvance.escalated
        }
      }).then(() => {
        this.$apollo.mutate({
          mutation: gqlt`mutation ($id: ID!, $details: String, $operator: ID!){
            createTicketdetail(input: {
              data: {
                ticket: $id
                details: $details
                operator: $operator
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
            details: this.ticketAdvance.details,
            operator: this.$store.state.auth.id
          }
        }).then((input) => {
          this.modal = false
          this.$emit('updateTicketStatus', this.ticketAdvance)
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
