<template>
  <v-row>
    <v-col>
      <v-card>
        <v-card-title>
          Inventario General
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="headers"
            :items="materialList"
            :page.sync="pagination.page"
            :items-per-page="pagination.pageSize"
            no-data-text="No hay nada para mostrar aún..."
            loading-text="Cargando información de inventario..."
            dense
            hide-default-footer
            @page-count="pagination.pageCount = $event"
          >
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
      pagination: {
        page: 1,
        pageCount: 1,
        pageSize: 24
      },
      headers: [
        { text: '#', value: 'id', sortable: false },
        { text: 'Material', value: 'name', sortable: false },
        { text: 'Cantidad Disponible', value: 'quantity', sortable: false },
        { text: 'Fecha de Adición', value: 'createdAt', sortable: false },
        { text: 'Fecha ultimo movimiento', value: 'updatedAt', sortable: false }
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
        this.getMaterialList(this.pagination)
      },
      deep: false
    }
  },
  mounted () {
    this.getMaterialList(this.pagination)
  },
  methods: {
    getMaterialList (pagination) {
      this.$store.dispatch('inventory/getMaterialList', { token: this.$store.state.auth.token, city: this.$route.query.city, pagination }).then(() => {
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
