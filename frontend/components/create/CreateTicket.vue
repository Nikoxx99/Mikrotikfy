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
              :error="errors.type"
              @focus="errors.type = false, alertBox = false"
            />
          </v-card-text>
          <v-card-text v-if="ticketPayload.type.name === 'TRASLADO'">
            <p>Direccion de desconexion</p>
            <v-row class="mb-2">
              <v-col cols="6" lg="3" md="3">
                <v-select
                  v-model="dx.dir1"
                  :items="dx.dirFragment1"
                  label="Dirección"
                  outlined
                  dense
                  hide-details
                  @change="dxGenAddress"
                />
              </v-col>
              <v-col cols="6" lg="3" md="3">
                <v-text-field
                  v-model="dx.dir2"
                  label="#"
                  outlined
                  dense
                  hide-details
                  @change="dxGenAddress"
                />
              </v-col>
              <v-col cols="6" lg="3" md="3">
                <v-select
                  v-model="dx.dir3"
                  :items="dx.dirFragment2"
                  label="#"
                  value="#"
                  outlined
                  dense
                  hide-details
                  @change="dxGenAddress"
                />
              </v-col>
              <v-col cols="6" lg="3" md="3">
                <v-text-field
                  v-model="dx.dir4"
                  label="#"
                  outlined
                  dense
                  hide-details
                  @change="dxGenAddress"
                />
              </v-col>
            </v-row>
            <v-row class="mb-2">
              <v-col>
                <v-autocomplete
                  v-model="dx.neighborhood"
                  item-text="name"
                  item-value="id"
                  :items="neighborhoods"
                  label="Barrio"
                  outlined
                  dense
                  hide-details
                  return-object
                  @change="dxGenAddress"
                />
              </v-col>
            </v-row>
            <p>Direccion de conexion</p>
            <v-row class="mb-2">
              <v-col cols="6" lg="3" md="3">
                <v-select
                  v-model="cx.dir1"
                  :items="cx.dirFragment1"
                  label="Dirección"
                  outlined
                  dense
                  hide-details
                  @change="cxGenAddress"
                />
              </v-col>
              <v-col cols="6" lg="3" md="3">
                <v-text-field
                  v-model="cx.dir2"
                  label="#"
                  outlined
                  dense
                  hide-details
                  @change="cxGenAddress"
                />
              </v-col>
              <v-col cols="6" lg="3" md="3">
                <v-select
                  v-model="cx.dir3"
                  :items="cx.dirFragment2"
                  label="#"
                  value="#"
                  outlined
                  dense
                  hide-details
                  @change="cxGenAddress"
                />
              </v-col>
              <v-col cols="6" lg="3" md="3">
                <v-text-field
                  v-model="cx.dir4"
                  label="#"
                  outlined
                  dense
                  hide-details
                  @change="cxGenAddress"
                />
              </v-col>
            </v-row>
            <v-row class="mb-2">
              <v-col>
                <v-autocomplete
                  v-model="cx.neighborhood"
                  item-text="name"
                  item-value="id"
                  :items="neighborhoods"
                  label="Barrio"
                  outlined
                  dense
                  hide-details
                  return-object
                  @change="cxGenAddress"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text>
            <v-textarea
              v-if="ticketPayload.type.name !== 'TRASLADO'"
              v-model="ticketPayload.details"
              outlined
              label="Detalles del ticket"
              :error="errors.details"
              @focus="errors.details = false, alertBox = false"
            />
          </v-card-text>
        </div>
        <v-card-actions>
          <v-btn
            color="blue darken-4"
            :loading="loading"
            :disabled="loading"
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
    errors: {
      type: false,
      details: false
    },
    ticketPayload: {
      client: '',
      type: {},
      details: '',
      city: '',
      assignated: ''
    },
    dx: {
      neighborhood: {},
      dir1: '',
      dir2: '',
      dir3: '#',
      dir4: '',
      dirFragment1: [
        '(SIN INICIAL)',
        'CARRERA',
        'CALLE',
        'MANZANA',
        'DIAGONAL'
      ],
      dirFragment2: [
        '#',
        'CASA',
        'DIAGONAL',
        'LOTE'
      ],
      finalAddress: ''
    },
    cx: {
      neighborhood: {},
      dir1: '',
      dir2: '',
      dir3: '#',
      dir4: '',
      dirFragment1: [
        '(SIN INICIAL)',
        'CARRERA',
        'CALLE',
        'MANZANA',
        'DIAGONAL'
      ],
      dirFragment2: [
        '#',
        'CASA',
        'DIAGONAL',
        'LOTE'
      ],
      finalAddress: ''
    }
  }),
  computed: {
    neighborhoods () {
      return this.$store.state.neighborhoods
    }
  },
  methods: {
    isEmpty (obj) {
      return Object.keys(obj).length === 0
    },
    dxGenAddress () {
      this.dx.finalAddress = `${this.dx.dir1} ${this.dx.dir2} ${this.dx.dir3} ${this.dx.dir4} ${this.dx.neighborhood.name}`
    },
    cxGenAddress () {
      this.cx.finalAddress = `${this.cx.dir1} ${this.cx.dir2} ${this.cx.dir3} ${this.cx.dir4} ${this.cx.neighborhood.name}`
    },
    initComponent () {
      this.modal = true
      this.ticketPayload.client = this.clientid
      this.ticketPayload.city = this.city
      this.ticketPayload.assignated = this.assignated
    },
    createTicket () {
      this.loading = true
      if (this.ticketPayload.type.name === 'TRASLADO') {
        this.ticketPayload.details = `DX: ${this.dx.finalAddress} \n CX: ${this.cx.finalAddress}`
      }
      if (this.isEmpty(this.ticketPayload.type)) {
        this.alertBox = true
        this.alertBoxColor = 'red darken-4'
        this.createdMessage = 'Selecciona un tipo de ticket antes de continuar'
        this.loading = false
        this.errors.type = true
        return
      }
      if (this.ticketPayload.details === '') {
        this.alertBox = true
        this.alertBoxColor = 'red darken-4'
        this.createdMessage = 'Por favor especifica los detalles del ticket antes de continuar'
        this.loading = false
        this.errors.details = true
        return
      }
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
