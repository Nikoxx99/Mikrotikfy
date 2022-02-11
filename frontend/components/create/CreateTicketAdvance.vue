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
          <v-icon>mdi-plus</v-icon>
          <span v-if="block">
            Crear Avance
          </span>
        </v-btn>
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
              v-if="$isAdmin()"
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
            :loading="loading"
            :diabled="loading"
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
export default {
  name: 'CreateTicketAdvance',
  props: {
    editindex: {
      type: Number,
      default: -1
    },
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
    async CreateTicketAdvance () {
      this.loading = true
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}tickets/${this.ticketid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        },
        body: JSON.stringify({
          data: { active: !this.ticketAdvance.closeTicket, escalated: this.ticketAdvance.escalated }
        })
      }).then(async (input) => {
        if (input.status === 200) {
          await fetch(`${this.$config.API_STRAPI_ENDPOINT}ticketdetails`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.$store.state.auth.token}`
            },
            body: JSON.stringify({
              data: {
                ticket: this.ticketAdvance.id,
                details: this.ticketAdvance.details,
                operator: this.$store.state.auth.id
              }
            })
          }).then((input) => {
            if (input.status === 200) {
              this.modal = false
              this.$emit('updateTicketStatus', this.ticketAdvance)
              this.snack = true
              this.snackColor = 'info'
              this.snackText = 'Ticket actualizado con éxito.'
              this.loading = false
            }
          }).catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error)
          })
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
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
