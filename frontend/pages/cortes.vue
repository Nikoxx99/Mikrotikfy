<template>
  <v-card>
    <v-card-title>Desconectar clientes por mora en {{ cityName }}</v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col
            cols="12"
            lg="6"
            md="6"
          >
            <v-row>
              <v-col>
                <v-btn
                  color="blue darken-4"
                  @click="prepare()"
                >
                  Preparar Clientes
                </v-btn>
                <v-chip
                  color="info darken-4"
                >
                  Pendientes: {{ Object.keys(pendingCuts).length }}
                </v-chip>
                <v-chip
                  color="red darken-4"
                >
                  Errores: {{ errorCount }}
                </v-chip>
                <v-chip
                  color="primary darken-4"
                >
                  Clientes: {{ Object.keys(dataTable).length }}
                </v-chip>
              </v-col>
            </v-row>
            <v-textarea
              v-model="input"
              outlined
              label="Codigos a desconectar"
            />
          </v-col>
          <v-col
            cols="12"
            lg="6"
            md="6"
          >
            <v-row>
              <v-btn
                color="red darken-4"
                class="mr-4"
                :loading="loading"
                :disabled="loading"
                @click="exec()"
              >
                Ejecutar Cortes
              </v-btn>
              <v-select
                v-model="setPlan"
                :items="Plans"
                label="Aplicar Plan"
                item-value="id"
                item-text="name"
                dense
                return-object
                outlined
                width="150px"
                class="mr-4"
              />
              <v-select
                v-model="kickStat"
                :items="kick"
                item-value="id"
                item-text="name"
                return-object
                label="Patear?"
                dense
                outlined
                width="150px"
              />
            </v-row>
            <client-only>
              <v-data-table
                no-data-text="Aun no hay clientes por desconectar"
                :items="pendingCuts"
                :headers="headers"
                :loading="loading"
              />
            </client-only>
            <div class="text-center pt-2">
              <v-pagination v-model="page" :length="pageCount" />
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-text>
      <v-card-title>Clientes desconectados</v-card-title>
      <client-only>
        <v-data-table
          no-data-text="Aun no hay clientes desconectados en proceso"
          :items="successfulCuts"
          :headers="successfulCutsHeaders"
        />
      </client-only>
    </v-card-text>
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
  </v-card>
</template>

<script>
import gql from 'graphql-tag'
export default {
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
    }
  },
  components: {
  },
  middleware: ['defaultCity', 'authenticated'],
  data () {
    return {
      cityName: 'default',
      title: 'DX por Mora',
      page: 1,
      pageCount: 0,
      itemsPerPage: 50,
      search: '',
      pendingCuts: [],
      setPlan: { id: 0, name: 'SELEC. PLAN' },
      errorCount: 0,
      clientCount: 0,
      dataTable: [],
      successfulCuts: [],
      input: '',
      headers: [
        { text: 'Codigo', sortable: true, value: 'code' },
        { text: 'Nombre', sortable: true, value: 'name' },
        { text: 'Plan', sortable: true, value: 'plan.name' },
        { text: 'Aciones', value: 'actions', sortable: false }
      ],
      successfulCutsHeaders: [
        { text: 'Codigo', sortable: true, value: 'code' },
        { text: 'Nombre', sortable: true, value: 'name' },
        { text: 'Exitoso', sortable: true, value: 'success' }
      ],
      kickStat: { id: 1, name: 'No patear' },
      kick: [
        { id: 1, name: 'No patear' },
        { id: 2, name: 'Patear' }
      ],
      snack: false,
      snackColor: '',
      snackText: '',
      loading: false
    }
  },
  created () {
    this.getInitialData()
  },
  methods: {
    getInitialData () {
      this.initialLoading = true
      this.dataTable = []
      this.$apollo.query({
        query: gql`
        query($city: Int) {
          City(id: $city){
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
              operator
              created_at
              newModel
            }
          }
        }
      `,
        variables: {
          city: parseInt(this.$route.query.city, 10)
        }
      }).then((input) => {
        this.cityName = input.data.City.name
        for (let i = 0; i < input.data.City.clients.length; i++) {
          const dataTable = {}
          dataTable._id = input.data.City.clients[i]._id
          dataTable.status = '#777'
          dataTable.code = input.data.City.clients[i].code
          dataTable.name = input.data.City.clients[i].name
          dataTable.dni = input.data.City.clients[i].dni
          dataTable.address = input.data.City.clients[i].address
          dataTable.neighborhood = input.data.City.clients[i].neighborhood
          dataTable.city = input.data.City.clients[i].city
          dataTable.phone = input.data.City.clients[i].phone
          dataTable.plan = input.data.City.clients[i].plan
          dataTable.technology = input.data.City.clients[i].technology
          dataTable.wifi_ssid = input.data.City.clients[i].wifi_ssid
          dataTable.wifi_password = input.data.City.clients[i].wifi_password
          dataTable.mac_address = input.data.City.clients[i].mac_address
          dataTable.comment = input.data.City.clients[i].comment
          dataTable.operator = input.data.City.clients[i].operator
          dataTable.created_at = input.data.City.clients[i].created_at
          dataTable.newModel = input.data.City.clients[i].newModel
          dataTable.citycolor = input.data.City.color
          this.dataTable.push(dataTable)
        }
        this.initialLoading = false
        this.Plans.push({ id: 0, name: 'SELEC. PLAN' })
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.initialLoading = false
      })
    },
    prepare () {
      const input = this.input.split('\n')
      for (let i = 0; i < input.length; i++) {
        // eslint-disable-next-line eqeqeq
        const search = this.dataTable.filter(c => c.code == input[i])
        if (search.length > 0) {
          const inputObject = {
            code: 0,
            name: '',
            plan: {
              id: 0,
              name: ''
            }
          }
          inputObject.code = search[0].code
          inputObject.name = search[0].name
          inputObject.plan.id = search[0].plan.id
          inputObject.plan.name = search[0].plan.name
          // eslint-disable-next-line eqeqeq
          const clientExist = this.pendingCuts.filter(c => c.code == input[i])
          if (clientExist.length < 1) {
            this.pendingCuts.push(inputObject)
          }
        } else {
          const inputObject = {
            code: 0,
            name: '',
            plan: {
              id: 0,
              name: ''
            }
          }
          inputObject.code = 0
          inputObject.name = 'NO ENCONTRADO EN LA DB'
          inputObject.plan.id = 0
          inputObject.plan.name = 'NO ENCONTRADO'
          this.pendingCuts.push(inputObject)
        }
      }
    },
    async exec () {
      this.loading = true
      const city = parseInt(this.$route.query.city, 10)
      const pendingDx = this.pendingCuts
      if (this.setPlan.id === 0 || this.pendingCuts.length < 1) {
        this.snack = true
        this.snackColor = 'red darken-4'
        this.snackText = 'Debes ingresar datos antes de proceder.'
        this.loading = false
      } else {
        this.snack = true
        this.snackColor = 'info'
        this.snackText = 'El proceso ha comenzado...'
        for (let i = 0; i < pendingDx.length; i++) {
          this.$apollo.mutate({
            mutation: gql`mutation ($input: DxInfoInput){
              dxClient(input: $input){
                code
                name
                success
              }
            }`,
            variables: {
              input: {
                dx: pendingDx[i],
                dxPlan: {
                  id: this.setPlan.id,
                  name: this.setPlan.name
                },
                dxKick: this.kickStat.id,
                dxCity: city
              }
            }
          }).then((input) => {
            this.successfulCuts.push(input.data.dxClient[0])
          }).catch((error) => {
            this.snack = true
            this.snackColor = 'red'
            this.snackText = error
            this.loading = false
          })
          await this.sleep(1000)
        }
        this.loading = false
      }
    },
    sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  },
  head () {
    return {
      title: this.title,
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

</style>
