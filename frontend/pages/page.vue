<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="desserts"
      :options.sync="options"
      :server-items-length="totalDesserts"
      :loading="loading"
      class="elevation-1"
    />
  </div>
</template>

<script>
import gql from 'graphql-tag'
export default {
  data () {
    return {
      totalDesserts: 0,
      desserts: [],
      loading: true,
      options: {},
      headers: [
        { text: 'Codigo', sortable: true, value: 'code' },
        { text: 'Estado', sortable: false, value: 'status' },
        { text: 'Nombre', sortable: true, value: 'name' },
        { text: 'Cedula', sortable: true, value: 'dni', align: ' d-none d-lg-table-cell' },
        { text: 'Direccion', sortable: false, value: 'address', align: ' d-none d-lg-table-cell' },
        { text: 'Barrio', sortable: true, value: 'neighborhood.name', align: ' d-none d-lg-table-cell' },
        { text: 'Telefono', sortable: false, value: 'phone', align: ' d-none d-lg-table-cell' },
        { text: 'Plan', sortable: true, value: 'plan.name', align: ' d-none d-lg-table-cell' },
        { text: 'Tecnologia', sortable: true, value: 'technology.name', align: ' d-none d-lg-table-cell' },
        { text: 'Tipo', sortable: true, value: 'newModel', align: ' d-none d-lg-table-cell' },
        { text: 'Aciones', value: 'actions', sortable: false }
      ],
      dataTable: []
    }
  },
  watch: {
    options: {
      handler () {
        this.getDataFromApi()
      },
      deep: true
    }
  },
  mounted () {
    this.getDataFromApi()
  },
  methods: {
    getDataFromApi () {
      this.loading = true
      this.fakeApiCall().then((data) => {
        this.desserts = data.items
        this.totalDesserts = data.total
        this.loading = false
      })
    },
    /**
     * In a real application this would be a call to fetch() or axios.get()
     */
    async fakeApiCall () {
      const { sortBy, sortDesc, page, itemsPerPage } = this.options

      let items = await this.getInitialData((page - 1) * itemsPerPage, itemsPerPage)
      const total = items.length

      if (sortBy.length === 1 && sortDesc.length === 1) {
        items = items.sort((a, b) => {
          const sortA = a[sortBy[0]]
          const sortB = b[sortBy[0]]

          if (sortDesc[0]) {
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

      if (itemsPerPage > 0) {
        items = items.slice((page - 1) * itemsPerPage, page * itemsPerPage)
      }

      return { items, total }
    },
    getInitialData (sindex, ilimit) {
      this.initialLoading = true
      this.dataTable = []
      this.$apollo.query({
        query: gql`
        query($city: Int, $startIndex: Int, $limit: Int) {
          City(id: $city){
            name
            color
            clients(startIndex: $startIndex, limit: $limit){
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
          city: 1,
          startIndex: sindex,
          limit: ilimit
        }
      }).then((input) => {
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
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    }
  }
}
</script>

<style>

</style>
