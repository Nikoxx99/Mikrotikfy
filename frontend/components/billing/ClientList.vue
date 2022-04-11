<template>
  <v-data-table
    v-if="headers"
    :headers="headers"
    :items.sync="clients"
    :items-per-page.sync="itemsPerPage"
    :page.sync="page"
    :options.sync="options"
    :loading="loadingDataTable"
    no-data-text="Realiza una busqueda para iniciar..."
    loading-text="Cargando información de clientes..."
    dense
    hide-default-footer
    mobile-breakpoint="100"
    @page-count="pageCount = $event"
  />
</template>
<script>
export default {
  data () {
    return {
      itemsPerPage: 10,
      page: 1,
      pageCount: 0,
      options: {},
      loadingDataTable: false
    }
  },
  computed: {
    clients () {
      return this.$store.state.billing.clients
    },
    headers () {
      return this.$store.state.billing.headers
    },
    search () {
      return this.$route.params.search
    }
  },
  mounted () {
    this.loadingDataTable = true
    this.page = 1
    this.getClientsBySearch()
    this.loadingDataTable = false
  },
  methods: {
    getClientsBySearch () {
      if (this.search) {
        this.$store.dispatch('billing/getClientsBySearch', {
          search: this.search,
          city: this.$route.query.city,
          clienttype: this.$route.query.clienttype,
          token: this.$store.state.auth.token
        })
      }
    }
  }
}
</script>
