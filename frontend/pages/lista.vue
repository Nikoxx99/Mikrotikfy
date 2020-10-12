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
          <v-card-title
            :style="`color:${cityColor};`"
          >
            Clientes {{ cityName }}
            <v-spacer />
            <v-text-field
              v-model="search"
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
              :items="dataTable"
              :search="search"
              :items-per-page="itemsPerPage"
              :page.sync="page"
              :loading="initialLoading"
              sort-by="created_at"
              calculate-widths
              sort-desc
              no-data-text="No hay informacion para mostrar aun..."
              loading-text="Cargando información de clientes..."
              dense
              hide-default-footer
              mobile-breakpoint="100"
              @page-count="pageCount = $event"
            >
              <!-- ########################### -->
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
              <template v-slot:item.status="{ item }">
                <svg height="13" width="20">
                  <circle :id="item._id" cx="10" cy="8" r="5" :fill="item.status" />
                </svg>
              </template>
              <!-- ########################### -->
              <template v-slot:top>
                <v-toolbar flat>
                  <v-dialog v-model="dialog" max-width="650px" :retain-focus="false">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        :color="cityColor"
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
                        Activos: {{ active_users }}
                      </v-chip>
                      <v-chip
                        color="red lighten-1 white--text"
                        small
                        class="mr-4 d-none d-md-flex d-lg-flex d-xl-flex"
                      >
                        En Mora: {{ inactive_users }}
                      </v-chip>
                      <v-chip
                        color="primary"
                        small
                        class="mr-4 d-none d-sm-flex d-md-flex d-lg-flex d-xl-flex"
                      >
                        Totales: {{ Object.keys(dataTable).length }}
                      </v-chip>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            v-bind="attrs"
                            :color="cityColor"
                            dark
                            class="mr-4"
                            :disabled="initialLoading"
                            :loading="initialLoading"
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
                        <span class="headline" :style="`color:${cityColor}`">Crear Cliente en {{ cityName }}</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container>
                          <CreateForm :citycolor="cityColor" />
                        </v-container>
                      </v-card-text>
                    </v-card>
                  </v-dialog>
                  <v-dialog v-model="dialogEdit" max-width="500px" :retain-focus="false">
                    <v-card>
                      <v-card-title>
                        <span class="headline">Editar Cliente</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container>
                          <EditForm
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
              <template v-slot:item.actions="{ item }">
                <ClientStatus :name="item.name" :clientid="item._id" />
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
            <v-pagination v-model="page" :length="pageCount" />
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
import gql from 'graphql-tag'
import CreateForm from '../components/create/CreateForm'
import EditForm from '../components/edit/EditForm'
import DeleteClient from '../components/delete/DeleteClient'
import ClientStatus from '../components/main/ClientStatus'
export default {
  components: {
    CreateForm,
    EditForm,
    DeleteClient,
    ClientStatus
  },
  middleware: ['defaultCity', 'authenticated'],
  apollo: {
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
    }
  },
  data () {
    return {
      key: 0,
      page: 1,
      pageCount: 0,
      itemsPerPage: 50,
      search: '',
      currentCity: 'Mariquita',
      cityName: '',
      cityColor: '',
      alertBox: false,
      dialog: false,
      dialogEdit: false,
      initialLoading: false,
      headers: [
        { text: 'Codigo', sortable: true, value: 'code' },
        { text: 'Estado', sortable: false, value: 'status' },
        { text: 'Nombre', sortable: true, value: 'name' },
        { text: 'Cedula', sortable: true, value: 'dni' },
        { text: 'Direccion', sortable: false, value: 'address' },
        { text: 'Barrio', sortable: true, value: 'neighborhood.name' },
        { text: 'Telefono', sortable: false, value: 'phone' },
        { text: 'Plan', sortable: true, value: 'plan.name' },
        { text: 'Tecnologia', sortable: true, value: 'technology.name' },
        { text: 'Tipo', sortable: true, value: 'newModel' },
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
    this.initialLoading = true
  },
  mounted () {
    this.getInitialData()
  },
  methods: {
    getInitialData () {
      this.initialLoading = true
      this.dataTable = []
      this.$apollo.query({
        query: gql`
        query($city: ID!) {
          city(id: $city){
            name
            color
            clients{
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
              operator{
                username
              }
              createdAt
              newModel
            }
          }
        }
      `,
        variables: {
          city: this.$route.query.city
        }
      }).then((input) => {
        this.cityName = input.data.city.name
        this.cityColor = input.data.city.color
        for (let i = 0; i < input.data.city.clients.length; i++) {
          const dataTable = {}
          dataTable._id = input.data.city.clients[i]._id
          dataTable.status = '#777'
          dataTable.code = input.data.city.clients[i].code
          dataTable.name = input.data.city.clients[i].name
          dataTable.dni = input.data.city.clients[i].dni
          dataTable.address = input.data.city.clients[i].address
          dataTable.neighborhood = input.data.city.clients[i].neighborhood
          dataTable.city = input.data.city.clients[i].city
          dataTable.phone = input.data.city.clients[i].phone
          dataTable.plan = input.data.city.clients[i].plan
          dataTable.technology = input.data.city.clients[i].technology
          dataTable.wifi_ssid = input.data.city.clients[i].wifi_ssid
          dataTable.wifi_password = input.data.city.clients[i].wifi_password
          dataTable.mac_address = input.data.city.clients[i].mac_address
          dataTable.comment = input.data.city.clients[i].comment
          dataTable.operator = input.data.city.clients[i].operator
          dataTable.created_at = input.data.city.clients[i].created_at
          dataTable.newModel = input.data.city.clients[i].newModel
          dataTable.citycolor = input.data.city.color
          this.dataTable.push(dataTable)
        }
        this.initialLoading = false
        this.activeClients(false)
        this.calculateState()
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.initialLoading = false
      })
    },
    async activeClients (refetch) {
      this.initialLoading = true
      this.online_users = this.getActiveClients.length
      if (refetch) {
        await this.$apollo.queries.getActiveClients.refetch()
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
      this.initialLoading = false
    },
    calculateState () {
      if (this.dataTable) {
        const clients = this.dataTable.filter(c => c.plan.id < 7)
        this.active_users = clients.length
        const inactiveClients = this.dataTable.filter(c => c.plan.id >= 7)
        this.inactive_users = inactiveClients.length
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
      title: this.cityName + this.title,
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
      ]
    }
  }
}
</script>
<style>
.new-model {
  background-color: #1f2c38 !important;
}
.old-model {
  background-color: #222 !important;
}
table {
  overflow: hidden;
}
</style>
