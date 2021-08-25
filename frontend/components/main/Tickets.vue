<template>
  <div>
    <v-row>
      <v-col
        cols="12"
      >
        <v-card>
          <v-card-title
            outline
            :style="`color:${currentCity ? currentCity.color : ''};border-bottom:solid 1px ${currentCity ? currentCity.color : ''}`"
          >
            Tickets {{ currentCity ? currentCity.name : '' }}
          </v-card-title>
          <v-card-text class="py-1">
            <v-row>
              <v-tooltip top>
                <!-- eslint-disable -->
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    class="mt-4 mx-4"
                    color="white black--text"
                    dark
                    :disabled="initialLoading"
                    :loading="initialLoading"
                    v-on="on"
                    @click="refreshTickets()"
                  >
                  <v-icon>mdi-reload</v-icon>
                  </v-btn>
                </template>
              <span>Refrescar Tickets</span>
            </v-tooltip>
            <v-checkbox
              v-model="showClosedValue"
              class="mr-4"
              label="Mostrar cerrados"
              @change="refreshTickets()"
            />
            </v-row>
          </v-card-text>
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
              @click:row="showTicketInfo"
            >
              <template v-slot:top>
                <v-row class="mx-1 my-1">
                  <v-spacer class="d-none d-xs-none d-sm-block d-md-block d-lg-block d-lx-block" />
                  <v-text-field
                    ref="searchTicket"
                    v-model="search"
                    prepend-icon="mdi-magnify"
                    label="Buscar Tickets"
                    single-line
                    hide-details
                    outlined
                    dense
                    style="max-width: 1000px"
                    class="white--text"
                  />
                </v-row>
              </template>
              <template v-if="isDesktop" v-slot:[`item.actions`]="props">
                <div class="nowspace">
                  <ClientStatus
                      v-if="can('ClientStatus')"
                      :name="props.item.client.name"
                      :clientid="props.item.client.id"
                      :code="props.item.client.code"
                      :role="$store.state.auth.allowed_components"
                    />
                  <CreateTicketAdvance
                    v-if="props.item.tickettype.name !== 'TRASLADO'"
                    :editindex="ticketList.indexOf(props.item)"
                    :ticketid="props.item.id"
                    :name="props.item.client.name"
                    @updateTicketStatus="updateTicketStatus($event)"
                  />
                  <CreateTicketAdvanceTraslate
                    v-else
                    :editindex="ticketList.indexOf(props.item)"
                    :ticketid="props.item.id"
                    :name="props.item.client.name"
                    @updateTicketStatus="updateTicketStatus($event)"
                  />
                  <TicketAdvanceHistory
                    :ticketid="props.item.id"
                    :name="props.item.client.name"
                  />
                </div>
              </template>
              <template v-slot:[`item.active`]="props">
                <v-chip small :color="getColor(props.item.active, props.item.answered, props.item.escalated)" class="white--text">
                  {{ getState(props.item.active, props.item.answered, props.item.escalated) }}
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
        </v-card>
      </v-col>
    </v-row>
    <v-dialog
      v-if="!isDesktop"
      v-model="infoModal"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar
          dark
        >
          <v-btn
            icon
            dark
            @click="infoModal = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-title>
          Información de Ticket  
        </v-card-title>
        <v-card-text>
          <v-list rounded>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>Tipo</v-list-item-subtitle>
                <v-list-item-title>{{ editModalData.tickettype ? editModalData.tickettype.name : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>Codigo</v-list-item-subtitle>
                <v-list-item-title>{{ editModalData.client ? editModalData.client.code : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>Cliente</v-list-item-subtitle>
                <v-list-item-title>{{ editModalData.client ? editModalData.client.name : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>Direccion</v-list-item-subtitle>
                <v-list-item-title>{{ editModalData.client ? editModalData.client.address : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>Barrio</v-list-item-subtitle>
                <v-list-item-title>{{ editModalData.client ? editModalData.client.neighborhood.name : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>Telefono</v-list-item-subtitle>
                <v-list-item-title>{{ editModalData.client ? editModalData.client.phone : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>Tecnología</v-list-item-subtitle>
                <v-list-item-title>{{ editModalData.client ? editModalData.client.technology.name : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>Detalles</v-list-item-subtitle>
                <p>{{ editModalData ? editModalData.details : '' }}</p>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>Reporto</v-list-item-subtitle>
                <v-list-item-title>{{ editModalData.assiganted ? editModalData.assiganted.username : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line>
              <v-list-item-content>
                <v-list-item-subtitle>Creado en</v-list-item-subtitle>
                <v-list-item-title>{{ editModalData ? editModalData.createdAt : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content v-if="editModalData.client !== undefined">
                <ClientStatus
                    v-if="can('ClientStatus')"
                    :block="true"
                    :name="editModalData.client.name"
                    :clientid="editModalData.client.id"
                    :code="editModalData.client.code"
                    :role="allowed_components"
                  />
                <CreateTicketAdvance
                  v-if="editModalData.tickettype.name !== 'TRASLADO'"
                  :block="true"
                  :editindex="ticketList ? ticketList.indexOf(editModalData.id) : ''"
                  :ticketid="editModalData.id"
                  :name="editModalData.client.name"
                  @updateTicketStatus="updateTicketStatus($event)"
                />
                <CreateTicketAdvanceTraslate
                  v-else
                  :block="true"
                  :editindex="ticketList ? ticketList.indexOf(editModalData.id) : ''"
                  :ticketid="editModalData.id"
                  :name="editModalData.client.name"
                  @updateTicketStatus="updateTicketStatus($event)"
                />
                <TicketAdvanceHistory
                  :block="true"
                  :ticketid="editModalData.id"
                  :name="editModalData.client.name"
                />
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
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
import CreateTicketAdvance from '../create/CreateTicketAdvance'
import TicketAdvanceHistory from '../misc/TicketAdvanceHistory'
import ClientStatus from '../main/ClientStatus'
import CreateTicketAdvanceTraslate from '../create/CreateTicketAdvanceTraslate.vue'
export default {
  name: 'Tickets',
  components: {
    CreateTicketAdvance,
    TicketAdvanceHistory,
    ClientStatus,
    CreateTicketAdvanceTraslate
  },
  data () {
    return {
      key: 0,
      page: 1,
      pageCount: 0,
      itemsPerPage: 10,
      search: '',
      cityName: '',
      cityColor: '',
      alertBox: false,
      dialog: false,
      dialogEdit: false,
      initialLoading: false,
      showClosedValue: false,
      refreshLoading: false,
      isDesktop: false,
      editModalData: {},
      infoModal: false,
      headers: [
        { text: 'Estado', sortable: true, value: 'active', width: '5%' },
        { text: 'Codigo', sortable: true, value: 'client.code', width: 60, align: ' d-none d-lg-table-cell' },
        { text: 'Cliente', sortable: true, value: 'client.name' },
        { text: 'Dirección', sortable: true, value: 'client.address', align: ' d-none d-lg-table-cell' },
        { text: 'Barrio', sortable: true, value: 'client.neighborhood.name', align: ' d-none d-lg-table-cell' },
        { text: 'Telefono', sortable: true, value: 'client.phone', align: ' d-none d-lg-table-cell' },
        { text: 'Tipo', sortable: true, value: 'tickettype.name' },
        { text: 'Operador', sortable: false, value: 'assiganted.username', align: ' d-none d-lg-table-cell' },
        { text: 'Detalles', sortable: true, value: 'details', width: 400, align: ' d-none d-lg-table-cell' },
        { text: 'Creado', sortable: true, value: 'createdAt', align: ' d-none d-lg-table-cell' },
        { text: 'Acciones', sortable: true, value: 'actions', align: ' d-none d-lg-table-cell' }
      ],
      States: [{ name: 'Abierto', value: true }, { name: 'Cerrado', value: false }],
      snack: false,
      snackColor: '',
      snackText: '',
      ticketList: [],
      allowed_components: []
    }
  },
  computed: {
    currentCity () {
      // eslint-disable-next-line eqeqeq
      return this.$store.state.cities ? this.$store.state.cities.find(c => c.id == this.$route.query.city) : ''
    }
  },
  mounted () {
    this.getResolution()
    this.refreshTickets()
  },
  methods: {
    async refreshTickets () {
      this.initialLoading = true
      this.ticketList = await this.$strapi.find('tickets', {
        active: !this.showClosedValue,
        city: this.$route.query.city,
        _limit: this.$route.query.limit ? parseInt(this.$route.query.limit) : 50,
        _sort: this.$route.query.sort ? this.$route.query.sort : 'createdAt:desc'
      })
      this.initialLoading = false
    },
    updateTicketStatus ({ editindex, closeTicket }) {
      if (editindex > -1) {
        this.ticketList[editindex].active = !closeTicket
      }
      this.refreshTickets()
      this.infoModal = false
    },
    getDate (date) {
      const dateObject = new Date(date)
      const humanDateFormat = dateObject.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })
      return humanDateFormat
    },
    getColor (state, answered, escalated) {
      if (state && !answered) {
        return 'blue darken-4'
      } else if (answered && state && !escalated) {
        return 'orange darken-4'
      } else if (answered && state && escalated) {
        return 'purple darken-4'
      } else {
        return 'red'
      }
    },
    getState (state, answered, escalated) {
      if (state && !answered) {
        return 'Abierto'
      } else if (answered && state && !escalated) {
        return 'Respondido'
      } else if (answered && state && escalated) {
        return 'Escalado a Tecnico'
      } else {
        return 'Cerrado'
      }
    },
    getResolution () {
      const res = window.innerWidth
      if (res > 800) {
        const clientRes = true
        this.isDesktop = clientRes
      } else {
        const clientRes = false
        this.isDesktop = clientRes
      }
    },
    showTicketInfo (value) {
      Object.assign(this.editModalData, value)
      this.infoModal = true
    },
    can (component) {
      const allowedcomponents = this.$store.state.auth.allowed_components
      const currentComponent = component
      const res = allowedcomponents.includes(currentComponent)
      return res
    },
    comprobeCity () {
      const recordedCity = localStorage.getItem('currentCity')
      const currentCity = this.$route.query.city
      if (currentCity !== recordedCity) {
        this.$store.dispatch('refreshTickets', { city: currentCity, limit: 50 })
      }
    }
  }
}
</script>

<style scoped>
  .nowspace {white-space: nowrap !important;}
</style>
