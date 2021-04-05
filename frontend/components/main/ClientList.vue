<template>
  <v-card>
    <v-card-title>
      Clientes
    </v-card-title>
    <v-card-text>
      <v-row
        class="mx-1"
      >
        <v-spacer class="d-none d-xs-none d-sm-block d-md-block d-lg-block d-lx-block" />
        <v-btn
          color="blue darken-4"
          dark
          :loading="loadingDataTable"
          class="mr-2"
          style="margin-top:2px;"
          @click="getClientBySearch()"
        >
          Buscar
        </v-btn>
        <v-text-field
          ref="searchClient"
          v-model="searchClientInput"
          label="Buscar Cliente"
          single-line
          hide-details
          outlined
          dense
          class="white--text"
          style="max-width: 1000px"
          @keyup.enter="getClientBySearch()"
        />
      </v-row>
    </v-card-text>
    <v-card-text>
      <client-only>
        <v-data-table
          :headers="headers"
          :items.sync="clients"
          :server-items-length="totalClients"
          :items-per-page.sync="itemsPerPage"
          :page.sync="page"
          :options.sync="options"
          :loading="loadingDataTable"
          no-data-text="No hay resultados a la busqueda..."
          loading-text="Cargando información de clientes..."
          dense
          hide-default-footer
          mobile-breakpoint="100"
          @page-count="pageCount = $event"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-dialog v-model="createDialog" max-width="1150px" :retain-focus="false">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-if="can('CreateForm')"
                    color="blue darken-4"
                    dark
                    class="mr-4"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-plus</v-icon>
                    Nuevo Cliente
                  </v-btn>
                  <v-text-field
                    :value="options.itemsPerPage"
                    label="Clientes por Pagina"
                    type="number"
                    min="5"
                    max="50"
                    width="80px"
                    hide-details
                    @input="options.itemsPerPage = parseInt($event, 10)"
                  />
                  <v-spacer />
                  <v-chip
                    color="white white--text"
                    small
                    outlined
                    label
                    class="mr-4"
                  >
                    En Linea: {{ activeClients }}
                  </v-chip>
                  <v-chip
                    color="green darken-3 white--text"
                    small
                    label
                    outlined
                    class="mr-4 d-none d-md-flex d-lg-flex d-xl-flex"
                  >
                    Activos: {{ clientCountActive }}
                  </v-chip>
                  <v-chip
                    color="red lighten-1 white--text"
                    small
                    outlined
                    label
                    class="mr-4 d-none d-md-flex d-lg-flex d-xl-flex"
                  >
                    En Mora: {{ clientCountDisable }}
                  </v-chip>
                  <v-chip
                    color="primary"
                    small
                    outlined
                    label
                    class="mr-4 d-none d-sm-flex d-md-flex d-lg-flex d-xl-flex"
                  >
                    Totales: {{ clientCount }}
                  </v-chip>
                  <v-tooltip bottom>
                    <!-- eslint-disable -->
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        color="blue darken-4"
                        dark
                        class="mr-4"
                        :disabled="refreshLoading"
                        :loading="refreshLoading"
                        v-on="on"
                        @click="activeClients(true)"
                      >
                        <v-icon>mdi-reload</v-icon>
                      </v-btn>
                    </template>
                    <span>Refrescar Estado</span>
                  </v-tooltip>
                </template>
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
                      <v-toolbar-title><span class="headline">Crear Cliente en</span></v-toolbar-title>
                    </v-toolbar>
                  </v-card-title>
                  <v-card-text>
                    <v-container>
                      <CreateForm
                        v-if="createDialog"
                        :citycolor="'blue'"
                        :role="role.name"
                        @createClient="createClient($event)"
                        @createClientDialog="createClientDialog($event)"
                        @createClientSnack="createClientSnack($event)"
                      />
                    </v-container>
                  </v-card-text>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:item.plan.name="props">
            <v-edit-dialog
              :return-value.sync="props.item.plan"
              large
              cancel-text="Cancelar"
              save-text="Guardar"
              @save="savePlanFromModal(props.item._id, props.item.plan, isRx, $store.state.auth.id)"
            >
              <v-chip small label outlined :color="getColor(props.item.plan.id)" class="white--text">
                {{ props.item.plan.name }}
              </v-chip>
              <template v-slot:input>
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
                <v-switch
                  v-model="isRx"
                  label="Es reconexion?"
                />
              </template>
            </v-edit-dialog>
          </template>
          <template v-slot:item.status="{ item }">
            <svg height="13" width="20">
              <circle :id="item._id" cx="10" cy="8" r="5" :fill="item.status" />
            </svg>
          </template>
          <template v-slot:item.technology.name="{ item }">
            <span :class="getTechnology(item.technology.id) + '--text'">
              {{ item.technology.name }}
            </span>
          </template>
          <template v-slot:item.newModel="{ item }">
            <svg height="13" width="20">
              <circle cx="10" cy="8" r="5" :fill="getModel(item.newModel)" />
            </svg>
          </template>
          <template v-slot:item.active="props">
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
              :allowed-components="allowedComponents"
            />
          </template>
          <template v-slot:item.actions="{ item }">
            <div style="white-space:nowrap">
              <CreateTicket
                v-if="can('CreateTicket')"
                :name="item.name"
                :city="item.city.id"
                :assignated="$store.state.auth.id"
                :clientid="item._id"
                :role="role.allowed_components"
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
                :role="role.allowed_components"
              />
              <EditForm
                v-if="can('EditForm')"
                :client="item"
                :index="clients.indexOf(item)"
                :role="role.allowed_components"
                @updateComment="updateComment($event)"
              />
              <DeleteClient v-if="can('DeleteClient')" :name="item.name" :clientid="item._id" />
            </div>
          </template>
        </v-data-table>
      </client-only>
      <v-row>
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
  name: 'Test',
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
      allowedComponents: [],
      createDialog: false,
      headers: [
        { text: 'Codigo', value: 'code', sortable: false },
        { text: 'Estado', sortable: false, value: 'status' },
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
      itemsPerPage: 5,
      loadingDataTable: false,
      options: {},
      page: 1,
      pageCount: 0,
      refreshLoading: false,
      searchClientInput: '',
      snack: false,
      snackColor: '',
      snackText: '',
      totalClients: 1000
    }
  },
  computed: {
    clients () {
      return this.$store.state.client.clients
    },
    cities () {
      return this.$store.state.city.cities
    },
    plans () {
      return this.$store.state.plan.plans
    },
    neighborhoods () {
      return this.$store.state.neighborhood.neighborhoods
    },
    technologies () {
      return this.$store.state.technology.technologies
    },
    role () {
      return this.$store.state.role.roles
    },
    activeClients () {
      return this.$store.state.count.clientCount.active
    },
    clientCount () {
      return this.$store.state.count.clientCount.clientCount
    },
    clientCountActive () {
      return this.$store.state.count.clientCount.clientCountActive
    },
    clientCountDisable () {
      return this.$store.state.count.clientCount.clientCountDisable
    }
  },
  watch: {
    options () {
      const city = this.$route.query.city
      this.$store.dispatch('client/getUsersFromDatabase', { start: 0, limit: this.itemsPerPage, city })
    },
    page () {
      const start = (this.page - 1) * this.itemsPerPage
      const limit = this.itemsPerPage
      const city = this.$route.query.city
      this.$store.dispatch('client/getUsersFromDatabase', { start, limit, city })
    }
  },
  mounted () {
    const city = this.$route.query.city
    this.$store.dispatch('client/getUsersFromDatabase', { start: 0, limit: this.itemsPerPage, city })
    this.$store.dispatch('plan/getPlansFromDatabase')
    this.$store.dispatch('city/getCitiesFromDatabase')
    this.$store.dispatch('neighborhood/getNeighborhoodsFromDatabase')
    this.$store.dispatch('technology/getTechnologiesFromDatabase')
    this.$store.dispatch('role/getRolesFromDatabase', this.$store.state.auth.role)
    this.$store.dispatch('count/activeClients', this.$route.query.city)
    this.$store.dispatch('count/clientCount', this.$route.query.city)
    this.$store.dispatch('count/clientCountActive', this.$route.query.city)
    this.$store.dispatch('count/clientCountDisable', this.$route.query.city)
  },
  methods: {
    getClientBySearch () {
      const city = this.$route.query.city
      const search = this.searchClientInput
      if (search) {
        this.$store.dispatch('client/getUsersFromDatabaseBySearch', { search, city })
      } else {
        this.$store.dispatch('client/getUsersFromDatabase', { start: 0, limit: this.itemsPerPage, city })
      }
    },
    savePlanFromModal (clientId, newPlan, isRx, operator, index) {
      this.$store.dispatch('client/setPlanFromModal', { clientId, newPlan, isRx, operator, index })
    },
    updatePlanFromModal (clientid, newPlan, index) {
      this.$store.commit('client/updateFromModal', { clientid, newPlan, index })
    },
    getColor (plan) {
      if (plan === '5f52a6fe2824f015ac8ceb58') {
        return 'blue'
      } else if (plan === '5f52a70a2824f015ac8ceb59') {
        return 'green'
      } else if (plan === '5f52a7572824f015ac8ceb5e') {
        return 'red'
      } else if (plan === '5f52a75f2824f015ac8ceb5f') {
        return 'black'
      }
    },
    getModel (model) {
      if (model === 0) {
        return 'grey'
      } else if (model === 1) {
        return 'cyan'
      }
    },
    getTechnology (technology) {
      if (technology === '5f832eadb0c43e2c64b3743b') {
        return 'cyan'
      } else if (technology === '5f832ea7b0c43e2c64b3743a') {
        return 'green'
      }
    },
    createClient (client) {
      Object.assign(this.dataTable[0], client)
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
      if (this.role.allowed_components) {
        const allowedComponents = this.role.allowed_components.map((c) => {
          return c.name
        })
        const currentComponent = component
        const res = allowedComponents.includes(currentComponent)
        return res
      }
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
</style>
