<template>
  <v-card>
    <v-card-title>Buscar Rutas MAC {{ cityName }}</v-card-title>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col
            cols="12"
            lg="12"
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
                  Encontrados: {{ foundCount }}
                </v-chip>
                <v-chip
                  color="red darken-4"
                >
                  No entontrado: {{ errorCount }}
                </v-chip>
              </v-col>
            </v-row>
            <v-textarea
              v-model="input"
              outlined
              label="MAC 00:00:00:00:00:00"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <client-only>
              <v-data-table
                no-data-text="Aun no MAC para buscar"
                :items="filteredList"
                :headers="headers"
                :loading="loading"
              />
            </client-only>
          </v-col>
        </v-row>
      </v-container>
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
import gqlt from 'graphql-tag'
export default {
  apollo: {
    plans () {
      return {
        query: gqlt`
        query{
          plans{
            _id
            name
            mikrotik_name
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
      title: 'Rutas OLT ',
      page: 1,
      pageCount: 0,
      itemsPerPage: 50,
      search: '',
      errorCount: 0,
      foundCount: 0,
      clientCount: 0,
      secretList: [],
      filteredList: [],
      dataTable: [],
      successfulCuts: [],
      input: '',
      headers: [
        { text: 'MAC', sortable: true, value: 'mac_address' },
        { text: 'Nombre', sortable: true, value: 'name' },
        { text: 'Code', sortable: true, value: 'code' },
        { text: 'Tec.', sortable: true, value: 'technology.name' },
        { text: 'Barrio', sortable: true, value: 'neighborhood.name' },
        { text: 'Direccion', sortable: true, value: 'address' },
        { text: 'Aciones', value: 'actions', sortable: false }
      ],
      snack: false,
      snackColor: '',
      snackText: '',
      loading: true
    }
  },
  created () {
    this.getSecretsFromMikrotik()
    this.getDatabaseClients()
  },
  methods: {
    getSecretsFromMikrotik () {
      this.secretList = []
      this.$apollo.query({
        query: gqlt`
        query($city: String) {
          getClientSecrets(city: $city){
            name
            mac_address
          }
        }
      `,
        variables: {
          city: this.$route.query.city
        }
      }).then((input) => {
        this.secretList = input.data.getClientSecrets
        this.loading = false
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.initialLoading = false
      })
    },
    getDatabaseClients () {
      this.initialLoading = true
      this.dataTable = []
      this.$apollo.query({
        query: gqlt`
        query($city: ID!) {
          city(id: $city){
            name
            clients{
              _id
              code
              name
              address
              neighborhood{
                name
              }
              city{
                name
              }
              dni
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
        const search = this.secretList.filter(c => c.mac_address == input[i])
        if (search.length > 0) {
          const macSearch = search[0].name
          // eslint-disable-next-line eqeqeq
          const clientDatabaseSearch = this.dataTable.filter(c => c.code == macSearch)
          if (clientDatabaseSearch < 1) {
            // eslint-disable-next-line eqeqeq
            const clientDatabaseSearch2 = this.dataTable.filter(c => c.dni == macSearch)
            if (clientDatabaseSearch2 < 1) {
              // no existe
            } else {
              this.filteredList.push(clientDatabaseSearch2[0])
              this.foundCount++
            }
          } else {
            this.filteredList.push(clientDatabaseSearch[0])
            this.foundCount++
          }
        } else {
          this.errorCount++
        }
      }
    },
    async exec () {
      this.loading = true
      const city = this.$route.query.city
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
            mutation: gqlt`mutation ($input: DxInfoInput){
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
                  id: this.setPlan._id,
                  name: this.setPlan.mikrotik_name
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
