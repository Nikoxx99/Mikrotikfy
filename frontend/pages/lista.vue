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
            Clientes {{ city.name }}
            <v-spacer />
            <v-text-field
              v-model="searchClientInput"
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
              no-data-text="No hay resultados a la busqueda..."
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
                  large
                  cancel-text="Cancelar"
                  save-text="Guardar"
                  @save="save(props.item._id, props.item.plan.id)"
                  @cancel="cancel"
                  @close="close"
                >
                  <v-chip small label :color="getColor(props.item.plan.id)" class="white--text">
                    {{ props.item.plan.name }}
                  </v-chip>
                  <template v-slot:input>
                    <v-select
                      v-model="props.item.plan"
                      item-text="name"
                      item-value="id"
                      :items="plans"
                      return-object
                      single-line
                      label="Plan"
                      dense
                    />
                  </template>
                </v-edit-dialog>
              </template>
              <!-- ########################### -->
              <template v-slot:item.technology.name="{ item }">
                <span :class="getTechnology(item.technology.id) + '--text'">
                  {{ item.technology.name }}
                </span>
              </template>
              <!-- ########################### -->
              <template v-slot:item.newModel="{ item }">
                <svg height="13" width="20">
                  <circle cx="10" cy="8" r="5" :fill="getModel(item.newModel)" />
                </svg>
              </template>
              <!-- ########################### -->
              <template v-slot:item.active="props">
                <v-tooltip left>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-if="can('CreateForm')"
                      :color="props.item.active ? 'green darken-3' : 'red darken-3'"
                      dark
                      small
                      :loading="props.item.loading"
                      v-bind="attrs"
                      text
                      v-on="on"
                      @click="updateStatus(props.item.active, dataTable.map(function(x) {return x._id; }).indexOf(props.item._id))"
                    >
                      <v-icon>mdi-{{ props.item.active ? 'check' : 'close' }} {{ props.index }}</v-icon>
                    </v-btn>
                  </template>
                <span>Activar Cliente</span>
                </v-tooltip>
              </template>
              <!-- ########################### -->
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
                        v-if="can('CreateForm')"
                        :color="city.color"
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
                        En Linea: {{ ActiveClients.length }}
                      </v-chip>
                      <v-chip
                        color="green darken-3 white--text"
                        small
                        class="mr-4 d-none d-md-flex d-lg-flex d-xl-flex"
                      >
                        Activos: {{ clientCountActive }}
                      </v-chip>
                      <v-chip
                        color="red lighten-1 white--text"
                        small
                        class="mr-4 d-none d-md-flex d-lg-flex d-xl-flex"
                      >
                        En Mora: {{ clientCountDisable }}
                      </v-chip>
                      <v-chip
                        color="primary"
                        small
                        class="mr-4 d-none d-sm-flex d-md-flex d-lg-flex d-xl-flex"
                      >
                        Totales: {{ clientCount }}
                      </v-chip>
                      <v-tooltip bottom>
                        <!-- eslint-disable -->
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            v-bind="attrs"
                            :color="city.color"
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
                          <v-toolbar-title><span class="headline">Crear Cliente en {{ city.name }}</span></v-toolbar-title>
                        </v-toolbar>
                      </v-card-title>
                      <v-card-text>
                        <v-container>
                          <CreateForm
                            v-if="dialog"
                            :citycolor="city.color"
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
              <!-- COMPONENTS IMPLEMETATION -->
              <!-- eslint-disable -->
              <template v-slot:item.actions="{ item }">
                <ClientStatus v-if="can('ClientStatus')" :name="item.name" :clientid="item._id" :code="item.code" />
                <EditForm
                    v-if="can('EditForm')"
                    :item="item"
                    :editIndex="dataTable.indexOf(item)"
                    :dataTable="dataTable"
                    @updateClient="updateClient($event)"
                    @updateComment="updateComment($event)"
                  />
                <DeleteClient v-if="can('DeleteClient')" :name="item.name" :clientid="item._id" />
              </template>
              <!-- ########################### -->
            </v-data-table>
          </client-only>
          <div class="text-center pt-2 justify-center" style="max-width:80%;margin:auto;">
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
    <v-snackbar
      v-model="editSnack"
      :timeout="3000"
      color="yellow darken-4"
      bottom
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
    city () {
      return {
        query: gql`
        query($city: ID!, $start: Int, $limit: Int) {
          city(id: $city){
            name
            color
            clients (start: $start, limit: $limit, sort: "createdAt:desc"){
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
              createdAt
              updatedAt
              newModel
              active
            }
          }
        }
      `,
        variables: {
          city: this.$route.query.city,
          start: 0,
          limit: 15
        }
      }
    },
    plans () {
      return {
        query: gql`
        query{
          plans{
            id
            name
          }
        }
      `
      }
    },
    role () {
      return {
        query: gql`
        query($id: ID!){
          role(id: $id){
            name
            allowed_components{
              name
            }
          }
        }
      `,
        variables: {
          id: this.$store.state.auth.role
        }
      }
    },
    ActiveClients () {
      return {
        query: gql`
        query($city: String){
          ActiveClients(city: $city){
            name
          }
        }
      `,
        variables: {
          city: this.$route.query.city
        }
      }
    },
    clientCount () {
      return {
        query: gql`
          query($city: String) {
            clientCount(city: $city)
          }
        `,
        variables: {
          city: this.$route.query.city
        }
      }
    },
    clientCountActive () {
      return {
        query: gql`
          query($city: String) {
            clientCountActive(city: $city)
          }
        `,
        variables: {
          city: this.$route.query.city
        }
      }
    },
    clientCountDisable () {
      return {
        query: gql`
          query($city: String) {
            clientCountDisable(city: $city)
          }
        `,
        variables: {
          city: this.$route.query.city
        }
      }
    },
    searchClient () {
      return {
        query: gql`
        query($search: String, $limit: Int, $city: String){
          searchClient(search: $search, limit: $limit, city: $city) {
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
            active
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
      itemsPerPage: 15,
      searchClientInput: '',
      totalClients: 0,
      currentCity: 'Mariquita',
      cityName: '',
      cityColor: '',
      alertBox: false,
      dialog: false,
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
        { text: 'Activo', sortable: true, value: 'active' },
        { text: 'Aciones', value: 'actions', sortable: false }
      ],
      editedIndex: -1,
      snack: false,
      snackColor: '',
      snackText: '',
      editSnack: false,
      editSnackText: '',
      active_users: 0,
      inactive_users: 0,
      online_users: 0,
      title: ' Base de datos',
      dataTable: [],
      clientRes: true,
      allowed_components: []
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
    searchClientInput: function () {
      if (this.searchClientInput.length > 3 || !this.searchClientInput) {
        this.debouncedGetAnswer()
        if (!this.searchClientInput) {
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
  mounted () {
    // eslint-disable-next-line no-undef
    this.debouncedGetAnswer = _.debounce(this.getClientBySearch, 700)
    // eslint-disable-next-line no-undef
    this.debouncedGetResult = _.debounce(this.getDataFromApi, 100)
    this.clientApiCall()
    this.allowed_components = this.role.allowed_components.map(c => {
      return c.name
    })
    // console.log(this.$options.components)
    if(!this.can('active')){
      this.headers.splice(10,1)
    }
  },
  methods: {
    clientApiCall () {
      this.loadingDataTable = true
      if (!this.searchClientInput) {
        this.getDataFromApi().then((data) => {
          this.mapDatabase(data.items)
          this.totalClients = this.clientCount
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
    async mapDatabase (items) {
      for (let i = 0; i < items.length; i++) {
        this.$set(items[i], 'status', 'white')
        this.$set(items[i], 'loading', false)
      }
      this.dataTable = items
    },
    async getClients (start, limit) {
      if (this.city.clients < 1) {
        return {}
      }
      if (this.initialLoad) {
        return await this.city.clients
      } else {
        await this.$apollo.queries.city.fetchMore({
          variables: {
            start,
            limit
          },
          updateQuery: (previousResult, { fetchMoreResult }) => {
            const newClients = fetchMoreResult.city.clients
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
      if (refetch) {
        await this.$apollo.queries.ActiveClients.refetch()
        this.refreshLoading = false
      }
      for (let i = 0; i < this.dataTable.length; i++) {
        // eslint-disable-next-line eqeqeq
        const search = this.ActiveClients.find(c => c.name == this.dataTable[i].code)
        if (search) {
          this.dataTable[i].status = 'green'
        } else {
          // eslint-disable-next-line eqeqeq
          const search2 = this.ActiveClients.find(c => c.name == this.dataTable[i].dni)
          if (search2) {
            this.dataTable[i].status = 'green'
          } else {
            this.dataTable[i].status = 'red'
          }
        }
      }
    },
    async getClientBySearch () {
      const search = this.searchClientInput
      if (search || search.length > 3) {
        await this.$apollo.queries.searchClient.fetchMore({
          variables: {
            search,
            city: this.$route.query.city
          },
          updateQuery: async (previousResult, { fetchMoreResult }) => {
            const newClients = fetchMoreResult.searchClient
            this.itemsPerPage = newClients.length
            this.totalClients = newClients.length
            this.mapDatabase(newClients)
            this.isPaginationActive = false
            await this.activeClients(false)
            this.refreshLoading = false
          }
        })
      }
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
    getTechnology (technology) {
      if (technology === '5f832eadb0c43e2c64b3743b') {
        return 'cyan'
      } else if (technology === '5f832ea7b0c43e2c64b3743a') {
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
    updateClient (input, editIndex) {
      if (editIndex > -1) {
        Object.assign(this.dataTable[this.editIndex], input)
      } else {
        this.dataTable.push(input)
      }
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
    save (clientId, newPlan) {
      this.$apollo.mutate({
        mutation: gql`mutation ($id: String, $plan: String){
          editClientPlan(id: $id, plan: $plan)
        }`,
        variables: {
          id: clientId,
          plan: newPlan,
        }
      }).then((input) => {
        this.snack = true
        this.snackColor = 'info'
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
    },
    can (component) {
      const allowed_components = this.allowed_components
      const current_component = component
      return allowed_components.includes(current_component)
    },
    updateStatus (status, index) {
      if (status === true) {
        this.dataTable[index].active = !this.dataTable[index].active
        this.dataTable[index].loading = !this.dataTable[index].loading
        this.$apollo.mutate({
          mutation: gql`mutation ($input: adminDeleteInput){
            adminDelete(input: $input)
          }`,
          variables: {
            input: {
              id: this.dataTable[index]._id
            }
          }
        }).then((input) => {
          this.dataTable[index].loading = !this.dataTable[index].loading
          this.snack = true
          this.snackColor = 'red'
          this.snackText = 'Cliente eliminado de la mikrotik'
        }).catch((error) => {
          this.snack = true
          this.snackColor = 'red'
          this.snackText = error
        })
      } else {
        this.dataTable[index].active = !this.dataTable[index].active
        this.dataTable[index].loading = !this.dataTable[index].loading
        const currentClientToCreate = this.dataTable[index]
        this.$apollo.mutate({
          mutation: gql`mutation ($input: adminCreateInput){
            adminCreate(input: $input)
          }`,
          variables: {
            input: {
              id: currentClientToCreate._id,
              code: currentClientToCreate.code,
              name: currentClientToCreate.name,
              dni: currentClientToCreate.dni,
              address: currentClientToCreate.address,
              neighborhood: currentClientToCreate.neighborhood.id,
              city: currentClientToCreate.city.id,
              phone: currentClientToCreate.phone,
              plan: currentClientToCreate.plan.id,
              wifi_ssid: currentClientToCreate.wifi_ssid,
              wifi_password: currentClientToCreate.wifi_password,
              technology: currentClientToCreate.technology.id,
              mac_address: currentClientToCreate.mac_address,
              comment: currentClientToCreate.comment
            }
          }
        }).then((input) => {
          this.dataTable[index].loading = !this.dataTable[index].loading
          this.snack = true
          this.snackColor = 'info'
          this.snackText = 'Cliente aprovado'
        }).catch((error) => {
          this.snack = true
          this.snackColor = 'red'
          this.snackText = error
        })
      }
    }
  },
  head () {
    return {
      title: this.city.name + this.title,
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
