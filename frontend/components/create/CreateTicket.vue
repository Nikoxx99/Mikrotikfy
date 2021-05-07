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
      <span>Crear Ticket</span>
    </v-tooltip>
    <v-dialog
      v-model="modal"
      max-width="590"
    >
      <v-card
        :loading="loading"
      >
        <v-alert
          v-if="alertBox"
          type="info"
          :class="alertBoxColor"
          tile
          dismissible
        >
          {{ createdMessage }}
        </v-alert>
        <v-card-title class="headline">
          Crear Ticket
        </v-card-title>
        <div v-if="!loading">
          <v-card-text>
            <h2> {{ name }} </h2>
          </v-card-text>
          <v-card-text>
            <v-select
              v-model="ticketPayload.type"
              :items="tickettypes"
              item-text="name"
              item-value="id"
              label="Problema"
              outlined
              return-object
            />
            <v-textarea
              v-model="ticketPayload.details"
              outlined
              label="Detalles adicionales"
            />
          </v-card-text>
        </div>
        <v-card-actions>
          <v-btn
            color="blue darken-4"
            :loading="loading"
            @click="createTicket()"
          >
            Crear Ticket
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
  </span>
</template>

<script>
import gqlt from 'graphql-tag'
export default {
  name: 'CreateTicket',
  apollo: {
    tickettypes () {
      return {
        query: gqlt`query{
          tickettypes{
            id
            name
          }
        }`
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
    },
    city: {
      type: String,
      default: ''
    },
    assignated: {
      type: String,
      default: ''
    },
    role: {
      type: Array,
      default: () => {}
    }
  },
  data: () => ({
    modal: false,
    loading: false,
    alertBox: false,
    alertBoxColor: '',
    createdMessage: '',
    ticketPayload: {
      client: '',
      type: {},
      details: '',
      city: '',
      assignated: ''
    }
  }),
  methods: {
    initComponent () {
      this.modal = true
      this.ticketPayload.client = this.clientid
      this.ticketPayload.city = this.city
      this.ticketPayload.assignated = this.assignated
    },
    createTicket () {
      this.$apollo.mutate({
        mutation: gqlt`mutation ($input: createTicketInput){
          createTicket(input: $input){
            ticket{
              client{
                code
              }
            }
          }
        }`,
        variables: {
          input: {
            data: {
              active: true,
              client: this.ticketPayload.client,
              city: this.ticketPayload.city,
              tickettype: this.ticketPayload.type.id,
              assiganted: this.ticketPayload.assignated,
              details: this.ticketPayload.details
            }
          }
        }
      }).then((input) => {
        if (input.data.createTicket.ticket.client.code) {
          // this.$emit('updateClient', this.item, this.editIndex)
          this.ticketPayload = {
            client: '',
            type: {},
            details: '',
            city: '',
            assignated: ''
          }
          this.modal = false
          this.loading = false
          // window.location.reload(true)
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.createTicket.errors[0].message
          this.loading = false
        }
      }).catch((error) => {
        this.alertBox = true
        this.alertBoxColor = 'red darken-4'
        this.createdMessage = error
        this.loading = false
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
