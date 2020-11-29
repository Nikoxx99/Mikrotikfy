<template>
  <div>
    <v-text-field v-model="searchClient" label="search" />
    <client-only>
      <v-data-table
        :headers="headers"
        :items="dataTable"
        :page.sync="page"
        :options.sync="options"
        :server-items-length="totalDesserts"
        :items-per-page.sync="itemsPerPage"
        :loading="loading"
        hide-default-footer
        @page-count="pageCount = $event"
      />
    </client-only>
    <v-pagination
      v-if="isPaginationActive"
      v-model="page"
      :length="pageCount"
    />
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'Page',
  data () {
    return {
      isPaginationActive: true,
      initialLoad: true,
      searchClient: '',
      answer: '',
      totalDesserts: 0,
      dataTable: [],
      loading: true,
      page: 1,
      itemsPerPage: 5,
      pageCount: 0,
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
      ]
    }
  },
  apollo: {
    City () {
      return {
        query: gql`
        query($city: Int, $startIndex: Int, $limit: Int) {
          City(id: $city){
            name
            color
            clientCount
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
          city: 1,
          startIndex: 0,
          limit: 5
        }
      }
    },
    SearchClient () {
      return {
        query: gql`
        query($search: String, $limit: Int){
          SearchClient(search: $search, limit: $limit) {
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
      this.debouncedGetAnswer()
      if (!this.searchClient) {
        this.clientApiCall()
      }
    },
    params: {
      handler () {
        this.clientApiCall()
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
    this.initialLoad = false
  },
  methods: {
    getClientBySearch () {
      const search = this.searchClient
      if (this.searchClient) {
        this.$apollo.queries.SearchClient.fetchMore({
        // New variables
          variables: {
            search,
            limit: 1000
          },
          // Transform the previous result with new data
          updateQuery: (previousResult, { fetchMoreResult }) => {
            const newClients = fetchMoreResult.SearchClient
            this.itemsPerPage = newClients.length
            this.totalDesserts = newClients.length
            this.dataTable = newClients
            this.isPaginationActive = false
          }
        })
      }
    },
    clientApiCall () {
      this.loading = true
      if (!this.searchClient) {
        this.getDataFromApi().then((data) => {
          this.dataTable = data.items
          this.totalDesserts = this.City.clientCount
          this.loading = false
          this.isPaginationActive = true
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
            this.dataTable = newClients
          }
        })
      }
      return this.dataTable
    }
  },
  head: {
    script: [
      {
        src: 'https://cdn.jsdelivr.net/npm/lodash@4.13.1/lodash.min.js'
      }
    ]
  }
}
</script>

<style>

</style>
