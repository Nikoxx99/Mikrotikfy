<template>
  <div>
    <v-row>
      <v-col
        cols="12"
      >
        <v-card>
          <v-card-title
            :style="`color:${cityColor};`"
          >
            <span class="mr-4">Tickets</span>
            <v-checkbox
              v-model="showClosedValue"
              class="mr-4"
              label="Mostrar cerrados"
              @change="showClosed(showClosedValue)"
            />
            <v-tooltip top>
              <!-- eslint-disable -->
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  color="blue darken-4"
                  dark
                  :disabled="refreshLoading"
                  :loading="refreshLoading"
                  v-on="on"
                  @click="refreshTickets()"
                >
                  <v-icon>mdi-reload</v-icon>
                </v-btn>
              </template>
              <span>Refrescar Tickets</span>
            </v-tooltip>
            <v-spacer />
            <v-text-field
              ref="searchTicket"
              v-model="search"
              prepend-icon="mdi-magnify"
              label="Buscar Tickets"
              single-line
              hide-details
              outlined
              dense
              class="white--text"
            />
          </v-card-title>
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
              <template v-if="isDesktop" v-slot:item.actions="props">
                <ClientStatus
                    v-if="can('ClientStatus')"
                    :name="props.item.client.name"
                    :clientid="props.item.client.id"
                    :code="props.item.client.code"
                    :role="$store.state.auth.allowed_components"
                  />
                <CreateTicketAdvance
                  :editindex="tickets.indexOf(props.item)"
                  :ticketid="props.item.id"
                  :name="props.item.client.name"
                  @updateTicketStatus="updateTicketStatus($event)"
                />
                <TicketAdvanceHistory
                  :ticketid="props.item.id"
                  :name="props.item.client.name"
                />
              </template>
              <template v-slot:item.active="props">
                <v-chip small :color="getColor(props.item.active)" class="white--text">
                  {{ getState(props.item.active) }}
                </v-chip>
              </template>
              <template v-slot:item.createdAt="{ item }">
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
                <div style="white-space:nowrap">
                  <ClientStatus
                      v-if="can('ClientStatus')"
                      :name="editModalData.client.name"
                      :clientid="editModalData.client.id"
                      :code="editModalData.client.code"
                      :role="allowed_components"
                    />
                  <CreateTicketAdvance
                    :editindex="tickets ? tickets.indexOf(editModalData.id) : ''"
                    :ticketid="editModalData.id"
                    :name="editModalData.client.name"
                    @updateTicketStatus="updateTicketStatus($event)"
                  />
                  <TicketAdvanceHistory
                    :ticketid="editModalData.id"
                    :name="editModalData.client.name"
                  />
                </div>
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
export default {
  name: 'TicketChanges',
  components: {
    CreateTicketAdvance,
    TicketAdvanceHistory,
    ClientStatus
  },
  data () {
    return {
      key: 0,
      page: 1,
      pageCount: 0,
      itemsPerPage: 5,
      search: '',
      currentCity: 'Mariquita',
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
        { text: 'Cliente', sortable: true, value: 'client.name', width: 150 },
        { text: 'Dirección', sortable: true, value: 'client.address', width: 200, align: ' d-none d-lg-table-cell' },
        { text: 'Barrio', sortable: true, value: 'client.neighborhood.name', width: 100, align: ' d-none d-lg-table-cell' },
        { text: 'Telefono', sortable: true, value: 'client.phone', width: 100, align: ' d-none d-lg-table-cell' },
        { text: 'Tipo', sortable: true, value: 'tickettype.name', width: 150 },
        { text: 'Operador', sortable: false, value: 'assiganted.username', width: 60, align: ' d-none d-lg-table-cell' },
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
    tickets () {
      return this.$store.state.tickets
    }
  },
  async mounted () {
    this.getResolution()
    await this.$store.dispatch('getTicketsFromLocalStorage')
    await this.showClosed(false)
  },
  methods: {
    async refreshTickets () {
      await this.$store.dispatch('refreshTickets', { limit: 50, city: this.$route.query.city })
      await this.showClosed(false)
    },
    updateTicketStatus (value) {
      if (value.editindex > -1) {
        this.tickets[value.editindex].active = !value.closeTicket
      }
    },
    async showClosed (value) {
      const newData = []
      await this.tickets.map((ticket) => {
        if (value === false) {
          if (ticket.active) {
            newData.push(ticket)
          }
        } else {
          newData.push(ticket)
        }
      })
      this.ticketList = newData
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
    async populareRole () {
      if (this.localStorageHandler('role', 'count')) {
        this.role = this.localStorageHandler('role', 'get')
        this.allowed_components = this.role.allowed_components.map((c) => {
          return c.name
        })
      } else {
        this.$apollo.queries.role.skip = false
        await this.$apollo.queries.role.fetchMore({
          updateQuery: (_, { fetchMoreResult }) => {
            const newRoleInfo = fetchMoreResult.role
            this.localStorageHandler('role', 'set', newRoleInfo)
            this.role = newRoleInfo
          }
        })
        this.allowed_components = this.role.allowed_components.map((c) => {
          return c.name
        })
      }
    },
    localStorageHandler (storage, action, payload) {
      if (action === 'get') {
        return JSON.parse(localStorage.getItem(storage))
      }
      if (action === 'set') {
        localStorage.setItem(storage, JSON.stringify(payload))
      }
      if (action === 'count') {
        if (localStorage.getItem(storage)) {
          return true
        } else {
          return false
        }
      }
    },
    can (component) {
      const allowedcomponents = this.$store.state.auth.allowed_components
      const currentComponent = component
      const res = allowedcomponents.includes(currentComponent)
      return res
    }
  }
}
</script>
