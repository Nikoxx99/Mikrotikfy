<template>
  <div>
    <v-text-field v-model="search" label="search" />
    <p> {{ answer }} </p>
    <client-only>
      <v-data-table
        :headers="headers"
        :items="dataTable"
        :page.sync="page"
        :options.sync="options"
        :server-items-length="totalDesserts"
        :items-per-page="itemsPerPage"
        :loading="loading"
        class="elevation-1"
        hide-default-footer
        @page-count="pageCount = $event"
      />
    </client-only>
    <v-pagination
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
      search: '',
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
    search: function (newQuestion, oldQuestion) {
      this.answer = 'Waiting for you to stop typing...'
      this.debouncedGetAnswer()
    },
    params: {
      handler () {
        this.getDataFromApi().then((data) => {
          console.log('new input data 3', data)
          this.dataTable = data.items
          this.totalDesserts = this.City.clientCount
          this.debouncedGetResult()
        })
      },
      deep: true
    }
  },
  mounted () {
    // eslint-disable-next-line no-undef
    this.debouncedGetAnswer = _.debounce(this.getAnswer, 500)
    // eslint-disable-next-line no-undef
    this.debouncedGetResult = _.debounce(this.getDataFromApi, 1500)
    this.getDataFromApi().then((data) => {
      console.log('initial input data 3', data)
      this.dataTable = data.items
      this.totalDesserts = this.City.clientCount
    })
  },
  methods: {
    getAnswer (search) {

    },
    async getDataFromApi () {
      this.loading = true
      const { sortBy, sortDesc, page, itemsPerPage } = this.options
      const search = this.search.trim().toLowerCase()

      let items = await this.getClients((page - 1) * itemsPerPage, itemsPerPage)
      console.log('Items return 2', items)

      if (search) {
        items = items.filter((item) => {
          return Object.values(item)
            .join(',')
            .toLowerCase()
            .includes(search)
        })
      }

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

      if (itemsPerPage > 0) {
        items = items.slice(
          (page - 1) * itemsPerPage,
          page * itemsPerPage
        )
      }
      const total = items.length
      this.loading = false
      return {
        items,
        total
      }
    },
    async getClients (limit, startIndex) {
      if (this.City.clients < 1) {
        return {}
      }
      if (this.page < 2) {
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
            console.log('newCLients 1', newClients)
            return {
              City: {
                __typename: previousResult.City.__typename,
                // Merging the tag list
                clients: newClients
              }
            }
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
