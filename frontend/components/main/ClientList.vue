<template>
  <div>
    <v-row class="mb-1 justify-center">
      <v-col
        cols="12"
        xs="12"
        sm="8"
        md="6"
        lg="6"
        xl="6"
      >
        <v-card class="rounded-xl">
          <v-card-title
            outline
            class="text-center"
            :style="`color:${currentCity ? currentCity.color : ''};border-bottom:solid 1px ${currentCity ? currentCity.color : ''}`"
          >
            Clientes {{ currentCity ? currentCity.name : '' }}
          </v-card-title>
          <v-subheader>Empieza buscando la información del cliente</v-subheader>
          <v-card-text>
            <v-row
              class="mx-1 mt-1 mb-1 justify-center"
            >
              <v-btn
                color="white black--text"
                dark
                :loading="loadingDataTable"
                class="mr-2"
                large
                style="margin-top:7px;"
                @click="getClientBySearch()"
              >
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
              <v-text-field
                ref="searchClient"
                v-model="searchClientInput"
                :label="loadingDataTable ? 'Cargando... Por favor espere.' : 'Buscar Cliente'"
                single-line
                hide-details
                filled
                rounded
                :loading="loadingDataTable"
                :disabled="loadingDataTable"
                class="white--text"
                style="max-width: 600px"
                @keyup.enter="getClientBySearch()"
              />
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="clients.length < 1" class="justify-center">
      <h4>Crea un cliente</h4>
    </v-row>
    <v-row v-if="clients.length < 1" class="justify-center">
      <v-fab-transition>
        <v-btn
          v-if="can('CreateForm')"
          color="primary"
          fab
          large
          dark
          @click="createDialog = true"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-fab-transition>
    </v-row>
    <v-row v-if="clients.length < 1" class="justify-center">
      <h3 class="text-center px-3">
        O realiza una búsqueda para mostrar la información
      </h3>
    </v-row>
    <v-row v-if="clients.length < 1" class="justify-center">
      <h1>
        <v-icon large>
          mdi-magnify
        </v-icon>
      </h1>
    </v-row>
    <v-row v-if="clients.length > 0" class="mt-0">
      <v-col class="pt-0">
        <v-card>
          <v-card-text>
            <client-only>
              <v-data-table
                :headers="headers"
                :items.sync="clients"
                :server-items-length="clientCount()"
                :items-per-page.sync="itemsPerPage"
                :page.sync="page"
                :options.sync="options"
                :loading="loadingDataTable"
                :item-class="itemRowBackground"
                no-data-text="No hay resultados a la busqueda..."
                loading-text="Cargando información de clientes..."
                dense
                hide-default-footer
                mobile-breakpoint="100"
                @page-count="pageCount = $event"
              >
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-btn
                      v-if="can('CreateForm')"
                      color="primary white--text"
                      dark
                      class="mr-4"
                      @click="createDialog = true"
                    >
                      <v-icon>mdi-plus</v-icon>
                      Nuevo Cliente
                    </v-btn>
                    <v-btn
                      color="white black--text"
                      dark
                      class="mr-4"
                      :disabled="refreshLoading"
                      :loading="refreshLoading"
                      @click="refreshActiveClients"
                    >
                      <v-icon>mdi-reload</v-icon>
                    </v-btn>
                    <span class="online-text text-caption mr-2">Online</span>
                    <span class="offline-text text-caption">Offline</span>
                    <v-spacer />
                    <!-- <v-text-field
                      :value="options.itemsPerPage"
                      label="Clientes por Pagina"
                      type="number"
                      min="5"
                      max="50"
                      width="80px"
                      hide-details
                      @input="options.itemsPerPage = parseInt($event, 10)"
                    /> -->
                  </v-toolbar>
                </template>
                <template v-slot:[`item.plan.name`]="props">
                  <v-edit-dialog
                    ref="dialog"
                    :return-value.sync="props.item.plan"
                    large
                    cancel-text="Cancelar"
                    save-text="Guardar"
                    @save="savePlanFromModal(props.item._id, props.item.plan, isRx, $store.state.auth.username)"
                    @cancel="cancel()"
                  >
                    <v-chip small label class="white black--text">
                      {{ props.item.plan.name }}
                    </v-chip>
                    <template v-slot:input>
                      <v-checkbox
                        v-model="isRx"
                        label="Es reconexion?"
                      />
                      <v-select
                        :value="props.item.plan"
                        item-text="name"
                        item-value="id"
                        :items="plans"
                        return-object
                        single-line
                        label="Plan"
                        dense
                        @change="updatePlanFromModal(props.item._id, $event, clients.map(function(x) {return x._id; }).indexOf(props.item._id))"
                      />
                    </template>
                  </v-edit-dialog>
                </template>
                <template v-slot:[`item.code`]="{ item }">
                  <span :class="item.status === 'green' ? 'online-text' : 'offline-text'">
                    {{ item.code }}
                  </span>
                </template>
                <template v-slot:[`item.technology.name`]="{ item }">
                  <span>
                    {{ item.technology ? item.technology.name : 'No Reg.' }}
                  </span>
                </template>
                <template v-slot:[`item.newModel`]="{ item }">
                  <svg height="13" width="20">
                    <circle cx="10" cy="8" r="5" :fill="getModel(item.newModel)" />
                  </svg>
                </template>
                <template v-slot:[`item.active`]="props">
                  <div style="white-space:nowrap;display:inline-flex">
                    <v-tooltip v-if="can('CreateForm')" left>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          :color="props.item.active ? 'green darken-3' : 'red darken-3'"
                          dark
                          small
                          :loading="props.item.loading"
                          v-bind="attrs"
                          text
                          v-on="on"
                          @click="updateStatus(props.item, clients.map(function(x) {return x._id; }).indexOf(props.item._id))"
                        >
                          <v-icon>mdi-{{ props.item.active ? 'check' : 'close' }} {{ props.index }}</v-icon>
                        </v-btn>
                      </template>
                      <span>Activar Cliente</span>
                    </v-tooltip>
                    <ActivationRequest
                      :item="props.item"
                      :allowedcomponents="$store.state.auth.allowed_components"
                    />
                  </div>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                  <div style="white-space:nowrap">
                    <CreateTicket
                      v-if="can('CreateTicket')"
                      :name="item.name"
                      :city="item.city.id"
                      :assignated="$store.state.auth.id"
                      :clientid="item._id"
                      :role="$store.state.auth.allowed_components"
                    />
                    <TicketHistory
                      :clientid="item._id"
                      :name="item.name"
                    />
                    <ClientStatus
                      v-if="can('ClientStatus')"
                      :name="item.name"
                      :clientid="item._id"
                      :code="item.code"
                      :role="$store.state.auth.allowed_components"
                    />
                    <EditForm
                      v-if="can('EditForm')"
                      :client="item"
                      :index="clients.indexOf(item)"
                      :role="$store.state.auth.allowed_components"
                      @updateSuccess="getClientBySearch()"
                    />
                    <DeleteClient v-if="can('DeleteClient')" :name="item.name" :clientid="item._id" />
                  </div>
                </template>
              </v-data-table>
            </client-only>
            <v-row v-if="showPagintation">
              <v-col cols="12" sm="8" md="10" lg="11" style="max-width:90%;margin:auto;">
                <v-pagination
                  v-model="page"
                  :length="pageCount"
                />
              </v-col>
            </v-row>
          </v-card-text>
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
        </v-card>
      </v-col>
    </v-row>
    <v-dialog v-model="createDialog" max-width="1150px" :retain-focus="false">
      <v-card>
        <v-card-title>
          <v-toolbar
            dark
          >
            <v-btn
              icon
              dark
              @click="createDialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title><span class="headline">Crear Cliente en {{ currentCity.name }}</span></v-toolbar-title>
          </v-toolbar>
        </v-card-title>
        <v-card-text>
          <v-container>
            <CreateForm
              v-if="createDialog"
              :citycolor="'blue'"
              :role="$store.state.auth.rolename"
              @createClient="createClient($event)"
              @createClientDialog="createClientDialog($event)"
              @createClientSnack="createClientSnack($event)"
            />
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import EditForm from '../edit/EditForm'
import DeleteClient from '../delete/DeleteClient'
import ClientStatus from '../main/ClientStatus'
import CreateTicket from '../create/CreateTicket'
import TicketHistory from '../misc/TicketHistory'
import CreateForm from '../create/CreateForm'
import ActivationRequest from '../misc/ActivationRequest'
export default {
  name: 'ClientList',
  components: {
    CreateForm,
    EditForm,
    DeleteClient,
    ClientStatus,
    CreateTicket,
    TicketHistory,
    ActivationRequest
  },
  data () {
    return {
      allowedcomponents: [],
      createDialog: false,
      headers: [
        { text: 'Codigo', value: 'code', sortable: false },
        { text: 'Nombre', value: 'name', sortable: false },
        { text: 'Cedula', value: 'dni', sortable: false },
        { text: 'Direccion', sortable: false, value: 'address' },
        { text: 'Barrio', value: 'neighborhood.name', sortable: false },
        { text: 'Telefono', sortable: false, value: 'phone' },
        { text: 'Plan', value: 'plan.name', sortable: false },
        { text: 'Tecnologia', value: 'technology.name', sortable: false },
        { text: 'Tipo', value: 'newModel', sortable: false },
        { text: 'Activo', value: 'active', sortable: false },
        { text: 'Aciones', value: 'actions', sortable: false }
      ],
      isRx: true,
      itemsPerPage: 15,
      loadingDataTable: false,
      options: {},
      page: 1,
      pageCount: 0,
      refreshLoading: false,
      searchClientInput: '',
      snack: false,
      snackColor: '',
      snackText: '',
      showPagintation: true
    }
  },
  computed: {
    clients () {
      return this.$store.state.client.clients
    },
    currentCity () {
      // eslint-disable-next-line eqeqeq
      return this.$store.state.cities ? this.$store.state.cities.find(c => c.id == this.$route.query.city) : ''
    },
    plans () {
      return this.$store.state.plans
    },
    neighborhoods () {
      return this.$store.state.neighborhoods
    },
    technologies () {
      return this.$store.state.technologies
    },
    activeClientsList () {
      return this.$store.state.activeClientsList
    }
  },
  // watch: {
  //   itemsPerPage () {
  //     const city = this.$route.query.city
  //     this.$store.dispatch('client/getUsersFromDatabase', { start: 0, limit: this.itemsPerPage, city })
  //   },
  //   async page () {
  //     const start = (this.page - 1) * this.itemsPerPage
  //     const limit = this.itemsPerPage
  //     const city = this.$route.query.city
  //     await this.$store.dispatch('client/getUsersFromDatabase', { start, limit, city })
  //     await this.getClientStatusOnMikrotik()
  //   }
  // },
  methods: {
    itemRowBackground (item) {
      if (this.$vuetify.theme.dark) {
        if (item.status === 'red') {
          return 'offline'
        } else {
          return 'online'
        }
      }
    },
    async refreshActiveClients () {
      this.refreshLoading = true
      await this.$store.dispatch('refreshActiveClients', this.$route.query.city)
      await this.getClientStatusOnMikrotik()
      this.refreshLoading = false
    },
    async getClientBySearch () {
      this.loadingDataTable = true
      const search = this.searchClientInput.trim()
      const city = this.$route.query.city
      if (search) {
        await this.$store.dispatch('client/getUsersFromDatabaseBySearch', { search, city })
        await this.getClientStatusOnMikrotik()
        this.showPagintation = false
        this.loadingDataTable = false
      } else {
        await this.$store.dispatch('client/clearClientsFromDatatable')
        await this.getClientStatusOnMikrotik()
        this.showPagintation = true
        this.loadingDataTable = false
      }
    },
    async getClientStatusOnMikrotik () {
      await this.$store.dispatch('client/calculateClientStatus', this.activeClientsList)
    },
    savePlanFromModal (clientId, newPlan, isRx, operator, index) {
      this.$store.dispatch('client/setPlanFromModal', { clientId, newPlan, isRx, operator, index })
    },
    updatePlanFromModal (clientid, newPlan, index) {
      this.$store.dispatch('client/updateFromModal', { clientid, newPlan, index })
    },
    cancel () {
      return true
    },
    getModel (model) {
      if (model === 0) {
        return 'grey'
      } else if (model === 1) {
        if (this.$vuetify.theme.dark) {
          return 'white'
        } else {
          return 'black'
        }
      }
    },
    clientCount () {
      return parseInt(localStorage.getItem('clientCount'))
    },
    createClientDialog (value) {
      this.createDialog = false
    },
    createClientSnack (value) {
      this.snack = value
      this.snackText = 'Cliente creado con éxito!'
      this.snackColor = 'info'
    },
    can (component) {
      const allowedcomponents = this.$store.state.auth.allowed_components
      const currentComponent = component
      const res = allowedcomponents.includes(currentComponent)
      return res
    },
    updateStatus (client, index) {
      if (client.active === true) {
        this.$store.dispatch('client/adminDelete', { client, index })
      } else {
        this.$store.dispatch('client/adminCreate', { client, index })
      }
    }
  }
}
</script>

<style>
.done {
  text-decoration: line-through;
}
.offline {
  background-color: #291f1f;
}
.offline-text {
  color: #ff254e;
}
.online-text {
  color:#3be03b;
}
.online {
  background-color: #1f291f;
}
</style>
