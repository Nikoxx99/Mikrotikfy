<template>
  <div>
    <v-row>
      <v-col>
        <v-alert
          v-if="alertBox"
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
      <v-col>
        <Navbar />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
      >
        <v-card>
          <v-card-title
            :class="cityColor"
          >
            Clientes {{ city }}
            <v-spacer />
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Buscar Cliente"
              single-line
              hide-details
              class="white--text"
            />
          </v-card-title>
          <v-data-table
            fixed-header
            :headers="headers"
            :items="City.clients"
            :search="search"
            hide-default-footer
            :page.sync="page"
            :items-per-page="itemsPerPage"
            dense
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
                @save="save(props.item._id, props.item.plan.id)"
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
            <template v-slot:item.status="{ item }">
              <svg height="13" width="20">
                <circle cx="10" cy="8" r="5" :fill="getStatus(item.code, item.dni)" />
              </svg>
            </template>
            <!-- ########################### -->
            <template v-slot:top>
              <v-toolbar flat>
                <v-dialog v-model="dialog" max-width="500px" :retain-focus="false">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      color="primary"
                      dark
                      class="mb-2 mr-4"
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon>mdi-plus</v-icon>
                      Nuevo Cliente
                    </v-btn>
                    <v-chip
                      color="blue darken-3 white--text"
                      small
                      class="mr-4"
                    >
                      Activos: {{ active_users }}
                    </v-chip>
                    <v-chip
                      color="red darken-4 white--text"
                      small
                      class="mr-4"
                    >
                      En Mora: {{ inactive_users }}
                    </v-chip>
                    <v-chip
                      color="primary"
                      small
                      class="mr-4"
                    >
                      Totales: {{ Object.keys(City.clients).length }}
                    </v-chip>
                  </template>
                  <v-card>
                    <v-card-title>
                      <span class="headline">Crear Cliente</span>
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <CreateForm />
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
                  <v-btn
                    v-bind="attrs"
                    class="yellow darken-4"
                    small
                    v-on="on"
                    @click="editItem(item)"
                  >
                    <v-icon>
                      mdi-pencil
                    </v-icon>
                  </v-btn>
                </template>
                <span>Editar Cliente</span>
              </v-tooltip>
              <DeleteClient :name="item.name" :clientid="item._id" />
            </template>
            <!-- ########################### -->
          </v-data-table>
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
</template>

<script>
import gql from 'graphql-tag'
import Navbar from '../components/main/Navbar'
import CreateForm from '../components/create/CreateForm'
import EditForm from '../components/edit/EditForm'
import DeleteClient from '../components/delete/DeleteClient'
import ClientStatus from '../components/main/ClientStatus'
export default {
  components: {
    Navbar,
    CreateForm,
    EditForm,
    DeleteClient,
    ClientStatus
  },
  middleware: ['defaultCity', 'authenticated'],
  apollo: {
    City () {
      return {
        query: gql`
        query($city: Int) {
          City(id: $city){
            name
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
              operator
            }
          }
        }
      `,
        variables: {
          city: parseInt(this.$route.query.city, 10)
        }
      }
    },
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
    }
  },
  data () {
    return {
      page: 1,
      pageCount: 0,
      itemsPerPage: 50,
      search: '',
      city: 'Mariquita',
      cityColor: 'blue darken-3 white--text',
      alertBox: false,
      dialog: false,
      dialogEdit: false,
      headers: [
        {
          text: 'Codigo',
          align: 'start',
          sortable: true,
          value: 'code'
        },
        { text: 'Estado', sortable: false, value: 'status', class: 'statusClass', width: '1%' },
        { text: 'Nombre', sortable: true, value: 'name' },
        { text: 'Cedula', sortable: true, value: 'dni' },
        { text: 'Direccion', sortable: false, value: 'address' },
        { text: 'Barrio', sortable: true, value: 'neighborhood.name' },
        { text: 'Ciudad', sortable: false, value: 'city.name' },
        { text: 'Telefono', sortable: false, value: 'phone' },
        { text: 'Plan', sortable: true, value: 'plan.name' },
        { text: 'Tecnologia', sortable: true, value: 'technology.name' },
        { text: 'Op.', sortable: true, value: 'operator' },
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
          comment: ''
        }
      },
      snack: false,
      snackColor: '',
      snackText: '',
      editSnack: false,
      editSnackText: '',
      active_users: 0,
      inactive_users: 0
    }
  },
  created () {
    if (this.$route.query.city === '2') {
      this.cityColor = 'green darken-3 white--text'
      this.city = 'Fresno'
    }
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
    const clients = this.City.clients.filter((c) => {
      return c.plan.id < 7
    })
    this.active_users = clients.length
    const inactiveClients = this.City.clients.filter((c) => {
      return c.plan.id >= 7
    })
    this.inactive_users = inactiveClients.length
  },
  methods: {
    editItem (item) {
      this.editedIndex = this.City.clients.indexOf(item)
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
      console.log(technology)
      if (technology === 0) {
        return 'cyan'
      } else if (technology === 1) {
        return 'green'
      }
    },
    getStatus (code, dni) {
      // eslint-disable-next-line eqeqeq
      const search = this.getActiveClients.find(c => c.name == code)
      if (search) {
        return 'green'
      } else {
        // eslint-disable-next-line eqeqeq
        const search2 = this.getActiveClients.find(c => c.name == dni)
        if (search2) {
          return 'green'
        } else {
          return 'red'
        }
      }
    },
    updateClient (input) {
      if (this.editedIndex > -1) {
        Object.assign(this.City.clients[this.editedIndex], input)
      } else {
        this.City.clients.push(input)
      }
      this.dialogEdit = false
      this.editSnack = true
      this.editSnackText = 'Cliente editado exitosamente'
    },
    save (clientId, newPlan) {
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
            plan: newPlan
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
  }
}
</script>
<style>
  .diez {
    color: red;
  }
</style>
