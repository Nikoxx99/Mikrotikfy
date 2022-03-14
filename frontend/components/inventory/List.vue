<template>
  <v-row>
    <v-col>
      <v-card>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="materialList"
            :page.sync="pagination.page"
            :items-per-page="pagination.pageSize"
            :sort-by.sync="sort.sortBy"
            :sort-desc.sync="sort.sortDesc"
            no-data-text="No hay nada para mostrar aún..."
            loading-text="Cargando información de inventario..."
            dense
            hide-default-footer
            @page-count="pagination.pageCount = $event"
          >
            <template v-slot:top>
              <div class="d-flex">
                <h3>Inventario General</h3>
                <v-spacer />
                <v-text-field
                  v-model="search"
                  outlined
                  dense
                  label="Busqueda de Material"
                  class="mx-4"
                  prepend-icon="mdi-magnify"
                  @keyup.enter="getMaterialList()"
                />
              </div>
            </template>
            <template v-slot:[`item.createdAt`]="{ item }">
              <span>
                {{ getDate(item.createdAt) }}
              </span>
            </template>
            <template v-slot:[`item.updatedAt`]="{ item }">
              <span>
                {{ getDate(item.updatedAt) }}
              </span>
            </template>
          </v-data-table>
          <div class="text-center pt-2">
            <v-pagination v-model="pagination.page" :length="pagination.pageCount" />
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data () {
    return {
      search: null,
      sort: {
        sortBy: 'name',
        sortDesc: true
      },
      pagination: {
        page: 1,
        pageCount: 1,
        pageSize: 24
      },
      headers: [
        { text: '#', value: 'id', sortable: true },
        { text: 'Material', value: 'name', sortable: true },
        { text: 'Cantidad Disponible', value: 'quantity', sortable: true }
      ]
    }
  },
  computed: {
    materialList () {
      return this.$store.state.inventory.materialList
    }
  },
  watch: {
    'pagination.page': {
      handler () {
        this.getMaterialList()
      },
      deep: false
    },
    'sort.sortBy': {
      handler () {
        this.getMaterialList()
      },
      deep: false
    }
  },
  mounted () {
    this.getMaterialList()
  },
  methods: {
    getMaterialList () {
      this.$store.dispatch('inventory/getMaterialList', { token: this.$store.state.auth.token, city: this.$route.query.city, pagination: this.pagination, sort: this.sort, search: this.search }).then(() => {
        this.pagination = { ...this.$store.state.inventory.paginationMaterialList }
      })
    },
    getDate (date) {
      const dateObject = new Date(date)
      const humanDateFormat = dateObject.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })
      return humanDateFormat
    }
  }
}
</script>
