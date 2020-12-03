<template>
  <div v-if="dataTable">
    <v-row v-if="alertBox">
      <v-col>
        <v-alert
          type="info"
          :class="alertBoxColor"
          tile
          dismissible
        >
          {{ createdMessage }}
        </v-alert>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
      >
        <v-card>
          <v-card-title>
            Clientes {{ City.name }}
            <v-spacer />
            <v-text-field
              v-model="searchClient"
              prepend-icon="mdi-magnify"
              label="Buscar Cliente"
              single-line
              hide-details
              outlined
              autofocus
              dense
              class="white--text"
            />
          </v-card-title>
          <client-only>
            <v-data-table
              :key="key"
              :headers="headers"
              :items.sync="dataTable"
              :server-items-length="totalClients"
              :items-per-page.sync="itemsPerPage"
              :page.sync="page"
              :options.sync="options"
              :loading="loadingDataTable"
              no-data-text="No hay informacion para mostrar aun..."
              loading-text="Cargando información de clientes..."
              dense
              hide-default-footer
              mobile-breakpoint="100"
              @page-count="pageCount = $event"
            >
              <!-- ########################### -->
              <!-- eslint-disable -->
              <template v-slot:item.plan.name="props">
                <v-edit-dialog
                  :return-value.sync="props.item.plan"
                  persistent
                  large
                  cancel-text="Cancelar"
                  save-text="Guardar"
                  @save="save(props.item._id, props.item.plan.id, props.item.newModel)"
                  @cancel="cancel"
                  @close="close"
                >
                  <v-chip small :color="getColor(props.item.plan.id)" class="white--text">
                    {{ props.item.plan.name }}
                  </v-chip>
                  <template v-slot:input>
                    <v-select
                      v-model="props.item.plan"
                      item-text="name"
                      item-value="id"
                      :items="Plans"
                      return-object
                      single-line
                      label="Plan"
                      dense
                    />
                  </template>
                </v-edit-dialog>
              </template>
              <!-- ########################### -->
              <!-- eslint-disable -->
              <template v-slot:item.technology.name="{ item }">
                <span :class="getTechnology(item.technology.id) + '--text'">
                  {{ item.technology.name }}
                </span>
              </template>
              <!-- ########################### -->
              <!-- eslint-disable -->
              <template v-slot:item.newModel="{ item }">
                <svg height="13" width="20">
                  <circle cx="10" cy="8" r="5" :fill="getModel(item.newModel)" />
                </svg>
              </template>
              <!-- ########################### -->
              <!-- eslint-disable -->
              <template v-slot:item.status="{ item }">
                <svg height="13" width="20">
                  <circle :id="item._id" cx="10" cy="8" r="5" :fill="item.status" />
                </svg>
              </template>
              <!-- ########################### -->
              <template v-slot:top>
                <v-toolbar flat>
                  <v-dialog v-model="dialog" max-width="650px" :retain-focus="false" fullscreen>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        :color="City.color"
                        dark
                        class="mr-4"
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon>mdi-plus</v-icon>
                        Nuevo Cliente
                      </v-btn>
                      <v-chip
                        color="white white--text"
                        small
                        outlined
                        class="mr-4 d-none d-sm-flex d-md-flex d-lg-flex d-xl-flex"
                      >
                        En Linea: {{ online_users }}
                      </v-chip>
                      <v-chip
                        color="green darken-3 white--text"
                        small
                        class="mr-4 d-none d-md-flex d-lg-flex d-xl-flex"
                      >
                        Activos: {{ City.clientActiveCount }}
                      </v-chip>
                      <v-chip
                        color="red lighten-1 white--text"
                        small
                        class="mr-4 d-none d-md-flex d-lg-flex d-xl-flex"
                      >
                        En Mora: {{ City.clientDisabledCount }}
                      </v-chip>
                      <v-chip
                        color="primary"
                        small
                        class="mr-4 d-none d-sm-flex d-md-flex d-lg-flex d-xl-flex"
                      >
                        Totales: {{ City.clientCount }}
                      </v-chip>
                      <v-tooltip bottom>
                        <!-- eslint-disable -->
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            v-bind="attrs"
                            :color="City.color"
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
                            @click="dialog = false"
                          >
                            <v-icon>mdi-close</v-icon>
                          </v-btn>
                          <v-toolbar-title><span class="headline">Crear Cliente en {{ City.name }}</span></v-toolbar-title>
                        </v-toolbar>
                      </v-card-title>
                      <v-card-text>
                        <v-container>
                          <CreateForm
                            v-if="dialog"
                            :citycolor="City.color"
                            @createClient="createClient($event)"
                            @createClientDialog="createClientDialog($event)"
                            @createClientSnack="createClientSnack($event)"
                          />
                        </v-container>
                      </v-card-text>
                    </v-card>
                  </v-dialog>
                  <v-dialog v-model="dialogEdit" max-width="500px" :retain-focus="false" fullscreen>
                    <v-card>
                      <v-card-title>
                        <v-toolbar
                          dark
                        >
                          <v-btn
                            icon
                            dark
                            @click="dialogEdit = false"
                          >
                            <v-icon>mdi-close</v-icon>
                          </v-btn>
                          <v-toolbar-title>Editar Cliente</v-toolbar-title>
                        </v-toolbar>
                      </v-card-title>
                      <v-card-text>
                        <v-container>
                          <EditForm
                            v-if="dialogEdit"
                            v-bind="client"
                            @updateClient="updateClient($event)"
                            @updateComment="updateComment($event)"
                          />
                        </v-container>
                      </v-card-text>
                    </v-card>
                  </v-dialog>
                </v-toolbar>
              </template>
              <!-- ########################### -->
              <!-- eslint-disable -->
              <template v-slot:item.actions="{ item }">
                <ClientStatus :name="item.name" :clientid="item._id" :code="item.code" />
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      v-bind="attrs"
                      color="yellow darken-4"
                      v-on="on"
                      @click="editItem(item)"
                    >
                      mdi-pencil
                    </v-icon>
                  </template>
                  <span>Editar Cliente</span>
                </v-tooltip>
                <DeleteClient :name="item.name" :clientid="item._id" />
              </template>
              <!-- ########################### -->
            </v-data-table>
          </client-only>
          <div class="text-center pt-2">
            <v-pagination
              v-if="isPaginationActive"
              v-model="page"
              :length="pageCount"
            />
          </div>
        </v-card>
      </v-col>
    </v-row>
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
    <v-snackbar
      v-model="editSnack"
      :timeout="3000"
      color="yellow darken-4"
      top
      vertical
    >
      {{ editSnackText }}

      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="editSnack = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
  <div
    v-else
    style="display:grid;place-items:center"
  >
    <h1>
      No hay informacion agregada aún.
    </h1>
  </div>
</template>

<script>
/* eslint-disable */
import gql from 'graphql-tag'
import CreateForm from '../components/create/CreateForm'
import EditForm from '../components/edit/EditForm'
import DeleteClient from '../components/delete/DeleteClient'
import ClientStatus from '../components/main/ClientStatus'
export default {
  name: 'Lista',
  components: {
    CreateForm,
    EditForm,
    DeleteClient,
    ClientStatus
  },
  middleware: ['defaultCity', 'authenticated'],
  apollo: {
    Plans () {
      return {
        query: gql`
        query{
          Plans{
            id
            name
          }
        }
      `
      }
    },
    getActiveClients () {
      return {
        query: gql`
        query($city: Int){
          getActiveClients(city: $city){
            name
          }
        }
      `,
        variables: {
          city: parseInt(this.$route.query.city, 10)
        }
      }
    },
    City () {
      return {
        query: gql`
        query($city: Int, $startIndex: Int, $limit: Int) {
          City(id: $city){
            name
            color
            clientCount
            clientActiveCount
            clientDisabledCount
            clients (startIndex: $startIndex, limit: $limit){
              _id
              code
              name
              dni
              address
              neighborhood{
                id
                name
              }
              city{
                id
                name
              }
              phone
              plan{
                id
                name
              }
              technology{
                id
                name
              }
              wifi_ssid
              wifi_password
              mac_address
              comment
              operator
              created_at
              newModel
            }
          }
        }
      `,
        variables: {
          city: parseInt(this.$route.query.city, 10),
          startIndex: 0,
          limit: 25
        }
      }
    },
    SearchClient () {
      return {
        query: gql`
        query($search: String, $limit: Int, $city: Int){
          SearchClient(search: $search, limit: $limit, city: $city) {
            _id
            code
            name
            dni
            address
            neighborhood{
              id
              name
            }
            city{
              id
              name
            }
            phone
            plan{
              id
              name
            }
            technology{
              id
              name
            }
            wifi_ssid
            wifi_password
            mac_address
            comment
            operator
            created_at
            newModel
          }
        }
        `,
        variables: {
          limit: 1
        }
      }
    }
  },
  data () {
    return {
      isPaginationActive: true,
      initialLoad: true,
      refreshLoading: false,
      loadingDataTable: true,
      key: 0,
      page: 1,
      pageCount: 0,
      itemsPerPage: 25,
      searchClient: '',
      totalClients: 0,
      currentCity: 'Mariquita',
      cityName: '',
      cityColor: '',
      alertBox: false,
      dialog: false,
      dialogEdit: false,
      options: {},
      headers: [
        { text: 'Codigo', sortable: true, value: 'code', align: ' d-none d-lg-table-cell'},
        { text: 'Estado', sortable: false, value: 'status' },
        { text: 'Nombre', sortable: true, value: 'name' },
        { text: 'Cedula', sortable: true, value: 'dni', align: ' d-none d-lg-table-cell' },
        { text: 'Direccion', sortable: false, value: 'address'},
        { text: 'Barrio', sortable: true, value: 'neighborhood.name', align: ' d-none d-lg-table-cell' },
        { text: 'Telefono', sortable: false, value: 'phone', align: ' d-none d-lg-table-cell' },
        { text: 'Plan', sortable: true, value: 'plan.name' },
        { text: 'Tecnologia', sortable: true, value: 'technology.name', align: ' d-none d-lg-table-cell' },
        { text: 'Tipo', sortable: true, value: 'newModel', align: ' d-none d-lg-table-cell' },
        { text: 'Aciones', value: 'actions', sortable: false }
      ],
      editedIndex: -1,
      client: {
        Client: {
          code: 1,
          name: '',
          dni: '',
          address: '',
          neighborhood: 0,
          city: 0,
          phone: '',
          plan: 0,
          wifi_ssid: '',
          wifi_password: '',
          technology: '',
          mac_address: '',
          comment: '',
          created_at: '',
          newModel: 0,
          citycolor: '1'
        }
      },
      snack: false,
      snackColor: '',
      snackText: '',
      editSnack: false,
      editSnackText: '',
      active_users: 0,
      inactive_users: 0,
      online_users: 0,
      title: ' Base de datos',
      dataTable: []
    }
  },
  computed: {
    params (nv) {
      return {
        ...this.options,
        query: this.search
      }
    }
  },
  watch: {
    // eslint-disable-next-line object-shorthand
    searchClient: function () {
      if (this.searchClient.length > 3 || !this.searchClient) {
        this.debouncedGetAnswer()
        if (!this.searchClient) {
          this.clientApiCall()
        }
      }
    },
    params: {
      handler () {
        if (!this.initialLoad) {
          this.clientApiCall()
        }
      },
      deep: true
    }
  },
  created () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'blue darken-4'
      this.createdMessage = 'Cliente Creado Satisfactoriamente'
    }
    if (this.$route.query.edited) {
      this.alertBox = true
      this.alertBoxColor = 'yellow darken-4'
      this.createdMessage = 'Cliente Editado Satisfactoriamente.'
    }
    if (this.$route.query.deleted) {
      this.alertBox = true
      this.alertBoxColor = 'red darken-4'
      this.createdMessage = 'Cliente Eliminado Satisfactoriamente.'
    }
  },
  mounted () {
    // eslint-disable-next-line no-undef
    this.debouncedGetAnswer = _.debounce(this.getClientBySearch, 700)
    // eslint-disable-next-line no-undef
    this.debouncedGetResult = _.debounce(this.getDataFromApi, 100)
    this.clientApiCall()
  },
  methods: {
    async getClientBySearch () {
      const search = this.searchClient
      if (search || search.length > 4) {
        await this.$apollo.queries.SearchClient.fetchMore({
        // New variables
          variables: {
            search,
            limit: 100,
            city: parseInt(this.$route.query.city, 10)
          },
          // Transform the previous result with new data
          updateQuery: (previousResult, { fetchMoreResult }) => {
            const newClients = fetchMoreResult.SearchClient
            this.itemsPerPage = newClients.length
            this.totalClients = newClients.length
            this.dataTable = newClients
            this.isPaginationActive = false
            this.activeClients()
            this.refreshLoading = false
          }
        })
      }
    },
    clientApiCall () {
      this.loadingDataTable = true
      if (!this.searchClient) {
        this.getDataFromApi().then((data) => {
          this.dataTable = data.items
          this.totalClients = this.City.clientCount
          this.loadingDataTable = false
          this.isPaginationActive = true
          this.activeClients(false)
          this.initialLoad = false
          this.refreshLoading = false
        })
      }
    },
    async getDataFromApi () {
      const { sortBy, sortDesc, page, itemsPerPage } = this.options

      let items = await this.getClients((page - 1) * itemsPerPage, itemsPerPage)

      if (this.options.sortBy) {
        items = items.sort((a, b) => {
          const sortA = a[sortBy]
          const sortB = b[sortBy]

          if (sortDesc) {
            if (sortA < sortB) { return 1 }
            if (sortA > sortB) { return -1 }
            return 0
          } else {
            if (sortA < sortB) { return -1 }
            if (sortA > sortB) { return 1 }
            return 0
          }
        })
      }

      const total = items.length
      return {
        items,
        total
      }
    },
    async getClients (startIndex, limit) {
      if (this.City.clients < 1) {
        return {}
      }
      if (this.initialLoad) {
        return await this.City.clients
      } else {
        await this.$apollo.queries.City.fetchMore({
          // New variables
          variables: {
            startIndex,
            limit
          },
          // Transform the previous result with new data
          updateQuery: (previousResult, { fetchMoreResult }) => {
            const newClients = fetchMoreResult.City.clients
            const newClientsMod = newClients.map(function (c) {
              c.status = 'white'
              return c
            })
            this.dataTable = newClientsMod
          }
        })
      }
      return this.dataTable
    },
    async activeClients (refetch) {
      this.refreshLoading = true
      this.online_users = this.getActiveClients.length
      if (refetch) {
        await this.$apollo.queries.getActiveClients.refetch()
        this.refreshLoading = false
      }
      for (let i = 0; i < this.dataTable.length; i++) {
        // eslint-disable-next-line eqeqeq
        const search = this.getActiveClients.find(c => c.name == this.dataTable[i].code)
        if (search) {
          this.dataTable[i].status = 'green'
        } else {
          // eslint-disable-next-line eqeqeq
          const search2 = this.getActiveClients.find(c => c.name == this.dataTable[i].dni)
          if (search2) {
            this.dataTable[i].status = 'green'
          } else {
            this.dataTable[i].status = 'red'
          }
        }
      }
    },
    editItem (item) {
      this.editedIndex = this.dataTable.indexOf(item)
      this.client.Client = Object.assign({}, item)
      this.dialogEdit = true
    },
    getColor (plan) {
      if (plan === 1) {
        return 'blue'
      } else if (plan === 2) {
        return 'green'
      } else if (plan === 7) {
        return 'red'
      } else if (plan === 8) {
        return 'black'
      }
    },
    getTechnology (technology) {
      if (technology === 0) {
        return 'cyan'
      } else if (technology === 1) {
        return 'green'
      }
    },
    updateKey () {
      this.key++
    },
    getModel (model) {
      if (model === 0) {
        return 'grey'
      } else if (model === 1) {
        return 'cyan'
      }
    },
    updateClient (input) {
      if (this.editedIndex > -1) {
        Object.assign(this.dataTable[this.editedIndex], input)
      } else {
        this.dataTable.push(input)
      }
      this.dialogEdit = false
      this.editSnack = true
      this.editSnackText = 'Cliente editado exitosamente'
    },
    updateComment (input) {
      if (this.editedIndex > -1) {
        this.dataTable[this.editedIndex].comment = input
      }
    },
    createClient (client) {
      this.dataTable.push(client)
    },
    createClientDialog (value) {
      this.dialog = false
    },
    createClientSnack (value) {
      this.snack = value
      this.snackText = 'Cliente creado con éxito!'
      this.snackColor = 'info'
    },
    save (clientId, newPlan, newModel) {
      this.$apollo.mutate({
        mutation: gql`mutation ($input: EditClientPlanInput){
          editClientPlan(input: $input){
            success
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          input: {
            id: clientId,
            plan: newPlan,
            model: newModel
          }
        }
      }).then((input) => {
        this.snack = true
        this.snackColor = 'success'
        this.snackText = 'Cambio de plan exitoso'
      }).catch((error) => {
        this.snack = true
        this.snackColor = 'red'
        this.snackText = error
      })
    },
    cancel () {
      this.snack = true
      this.snackColor = 'error'
      this.snackText = 'Operacion cancelada'
    },
    close () {
      // eslint-disable-next-line no-console
      console.log('Info closed')
    }
  },
  head () {
    return {
      title: this.City.name + this.title,
      meta: [
        { hid: 'language', name: 'language', content: 'es' },
        { hid: 'audience', name: 'audience', content: 'all' },
        { hid: 'rating', name: 'rating', content: 'general' },
        { hid: 'distribution', name: 'distribution', content: 'global' },
        { hid: 'document-type', name: 'document-type', content: 'Public' },
        { hid: 'MSSmartTagsPreventParsing', name: 'MSSmartTagsPreventParsing', content: 'true' },
        { hid: 'robots', name: 'robots', content: 'all' },
        { hid: 'robots', name: 'robots', content: 'all, index, follow' },
        { hid: 'googlebot', name: 'googlebot', content: 'all, index, follow' },
        { hid: 'yahoo-slurp', name: 'yahoo-slurp', content: 'all, index, follow' },
        { hid: 'msnbot', name: 'msnbot', content: 'index, follow' },
        { hid: 'googlebot-image', name: 'googlebot-image', content: 'all' },
        { hid: 'title', name: 'title', content: this.title },
        { hid: 'og:title', property: 'og:title', content: this.title },
        { hid: 'og:description', property: 'og:description', content: 'ARNOProducciones - Base de datos interactiva' },
        { hid: 'author', name: 'author', content: 'Nicolas Echeverry' }
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/lodash@4.13.1/lodash.min.js'
        }
      ]
    }
  }
}
</script>
