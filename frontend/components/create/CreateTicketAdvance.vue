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
            <v-switch
              v-model="ticketAdvance.closeTicket"
              label="Cerrar Ticket?"
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
export default {
  name: 'CreateTicketAdvance',
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
    ticketAdvance: {
      id: '',
      details: '',
      closeTicket: false
    }
  }),
  methods: {
    initComponent () {
      this.modal = true
      this.ticketAdvance.id = this.ticketid
    },
    formatBytes (bytes, decimals = 2) {
      if (bytes === 0) { return '0 Bytes' }

      const k = 1024
      const dm = decimals < 0 ? 0 : decimals
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

      const i = Math.floor(Math.log(bytes) / Math.log(k))

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
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
