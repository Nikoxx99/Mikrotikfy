<template>
  <div>
    <v-row>
      <v-col
        cols="12"
      >
        <v-card flat tile>
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
                    rounded
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
            <v-checkbox
              v-model="showRetired"
              class="mr-4"
              label="Mostrar retiros"
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
              @click:row="showTicketInfo({ item: $event, index: ticketList.indexOf($event) })"
            >
              <template v-slot:[`item.tickettype.name`]="props">
                <v-chip small :color="getTicketTypeColor(props.item.tickettype.name)" class="white--text">
                  {{ props.item.tickettype.name }}
                </v-chip>
              </template>
              <template v-if="isDesktop" v-slot:[`item.actions`]="props">
                <div class="nowspace">
                  <TicketHistory
                    :clientid="props.item.client.id"
                    :name="props.item.client.name"
                  />
                  <ClientStatus
                      :name="props.item.client.name"
                      :clientid="props.item.client.id"
                      :code="props.item.client.code"
                      :role="$store.state.auth.allowed_components"
                    />
                  <CreateTicketAdvance
                    :editindex="ticketList.indexOf(props.item)"
                    :ticketid="props.item.id"
                    :ticket="props.item"
                    :client="props.item.client"
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
                <v-chip small :color="getColor(props.item.active, props.item.answered, props.item.escalated, props.item.escalatedoffice)" class="white--text">
                  {{ getState(props.item.active, props.item.answered, props.item.escalated, props.item.escalatedoffice) }}
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
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>{{ editModalData.tickettype ? editModalData.tickettype.name : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>{{ editModalData.client ? editModalData.client.code : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>{{ editModalData.client ? editModalData.client.name : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>{{ editModalData.client ? editModalData.client.address : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>{{ editModalData.client ? editModalData.client.neighborhood.name : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>{{ editModalData.client ? editModalData.client.phone : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>{{ editModalData.client ? editModalData.client.technology.name : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-subtitle>Detalles</v-list-item-subtitle>
                <p>{{ editModalData ? editModalData.details : '' }}</p>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-subtitle>Reporto</v-list-item-subtitle>
                <v-list-item-title>{{ editModalData.assiganted ? editModalData.assiganted.username : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-subtitle>Creado en</v-list-item-subtitle>
                <v-list-item-title>{{ editModalData ? editModalData.createdAt : '' }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content v-if="editModalData.client !== undefined">
                <ClientStatus
                    :block="true"
                    :name="editModalData.client.name"
                    :clientid="editModalData.client.id"
                    :code="editModalData.client.code"
                    :role="allowed_components"
                  />
                <CreateTicketAdvance
                  :block="true"
                  :editindex="editModalData.editindex"
                  :ticketid="editModalData.id"
                  :ticket="editModalData"
                  :client="editModalData.client"
                  :name="editModalData.client.name"
                  @updateTicketStatus="updateTicketStatus($event)"
                />
                <TicketAdvanceHistory
                  :block="true"
                  :ticketid="editModalData.id"
                  :name="editModalData.client.name"
                />
                <TicketHistory
                  :clientid="editModalData.client.id"
                  :name="editModalData.client.name"
                  :block="true"
                />
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import CreateTicketAdvance from '../create/CreateTicketAdvance'
import TicketAdvanceHistory from '../misc/TicketAdvanceHistory'
import TicketHistory from '../misc/TicketHistory'
import ClientStatus from '../main/ClientStatus'
export default {
  name: 'Tickets',
  components: {
    CreateTicketAdvance,
    TicketAdvanceHistory,
    TicketHistory,
    ClientStatus
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
      showRetired: false,
      refreshLoading: false,
      isDesktop: false,
      editModalData: {},
      infoModal: false,
      headers: [
        { text: 'Estado', sortable: false, value: 'active', width: '5%' },
        { text: 'Codigo', sortable: false, value: 'client.code', width: 60, align: ' d-none d-lg-table-cell' },
        { text: 'Cédula', sortable: false, value: 'client.dni', width: 60, align: ' d-none d-lg-table-cell' },
        { text: 'Cliente', sortable: false, value: 'client.name' },
        { text: 'Dirección', sortable: false, value: 'client.address', align: ' d-none d-lg-table-cell' },
        { text: 'Barrio', sortable: false, value: 'client.neighborhood.name' },
        { text: 'Telefono', sortable: false, value: 'client.phone', align: ' d-none d-lg-table-cell' },
        { text: 'Tec.', sortable: false, value: 'client.technology.name', align: ' d-none d-lg-table-cell' },
        { text: 'Tipo', sortable: false, value: 'tickettype.name' },
        { text: 'Operador', sortable: false, value: 'assignated.username', align: ' d-none d-lg-table-cell' },
        { text: 'Detalles', sortable: false, value: 'details', width: 400, align: ' d-none d-lg-table-cell' },
        { text: 'Creado', sortable: false, value: 'createdAt', align: ' d-none d-lg-table-cell' },
        { text: 'Acciones', sortable: false, value: 'actions', align: ' d-none d-lg-table-cell' }
      ],
      States: [{ name: 'Abierto', value: true }, { name: 'Cerrado', value: false }],
      allowed_components: []
    }
  },
  computed: {
    currentCity () {
      // eslint-disable-next-line eqeqeq
      return this.$store.state.cities ? this.$store.state.cities.find(c => c.id == this.$route.query.city) : ''
    },
    ticketList () {
      return this.$store.state.ticket.tickets
    }
  },
  watch: {
    $route () {
      this.refreshTickets()
    }
  },
  mounted () {
    this.getResolution()
    this.refreshTickets()
  },
  methods: {
    async refreshTickets () {
      this.initialLoading = true
      await this.$store.dispatch('ticket/getTicketsFromDatabase', { city: this.$route.query.city, clienttype: this.$route.query.clienttype, token: this.$store.state.auth.token, active: this.showClosedValue, retired: this.showRetired })
      this.initialLoading = false
    },
    updateTicketStatus ({ editindex, closeTicket }) {
      this.$store.commit('ticket/updateTicketStatus', { editindex, closeTicket })
      this.refreshTickets()
      this.infoModal = false
    },
    getDate (date) {
      const dateObject = new Date(date)
      const humanDateFormat = dateObject.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })
      return humanDateFormat
    },
    getTicketTypeColor (tickettype) {
      if (tickettype === 'SIN SERVICIO') {
        return 'red'
      } else if (tickettype === 'SERVICIO LENTO') {
        return 'orange darken-2'
      } else if (tickettype === 'INTERMITENCIA') {
        return 'orange darken-4'
      } else {
        return 'primary'
      }
    },
    getColor (state, answered, escalated, escalatedoffice) {
      if (state && !answered) {
        return 'blue darken-4'
      } else if (answered && state && !escalated && !escalatedoffice) {
        return 'orange darken-4'
      } else if (answered && state && escalated) {
        return 'purple darken-4'
      } else if (answered && state && !escalated && escalatedoffice) {
        return 'green darken-4'
      } else {
        return 'red'
      }
    },
    getState (state, answered, escalated, escalatedoffice) {
      if (state && !answered) {
        return 'Abierto'
      } else if (answered && state && !escalated && !escalatedoffice) {
        return 'Respondido'
      } else if (answered && state && escalated) {
        return 'Escalado a Tecnico'
      } else if (answered && state && !escalated && escalatedoffice) {
        return 'Escalado a Oficina'
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
    showTicketInfo (event) {
      event.item.editindex = event.index
      Object.assign(this.editModalData, event.item)
      this.infoModal = true
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
  .v-data-table > .v-data-table__wrapper > table > tfoot > tr > td {
    font-size: 12px;
  }
</style>
