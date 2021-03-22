<template>
  <v-card>
    <v-card-title>
      Clientes
    </v-card-title>
    <v-card-text>
      <v-row
        class="mx-1"
      >
        <v-spacer class="d-none d-xs-none d-sm-block d-md-block d-lg-block d-lx-block" />
        <v-btn
          color="blue darken-4"
          dark
          :loading="loadingDataTable"
          class="mr-2"
          style="margin-top:2px;"
          @click="getClientBySearch()"
        >
          Buscar
        </v-btn>
        <v-text-field
          ref="searchClient"
          v-model="searchClientInput"
          label="Buscar Cliente"
          single-line
          hide-details
          outlined
          dense
          class="white--text"
          style="max-width: 1000px"
          @keyup.enter="getClientBySearch()"
        />
      </v-row>
    </v-card-text>
    <v-card-text>
      <client-only>
        <v-data-table
          :headers="headers"
          :items.sync="clients"
          :server-items-length="totalClients"
          :items-per-page.sync="itemsPerPage"
          :page.sync="page"
          :options.sync="options"
          :loading="loadingDataTable"
          no-data-text="No hay resultados a la busqueda..."
          loading-text="Cargando información de clientes..."
          dense
          hide-default-footer
          mobile-breakpoint="100"
          @page-count="pageCount = $event"
        >
          <template v-slot:item.plan.name="props">
            <v-edit-dialog
              :return-value.sync="props.item.plan"
              large
              cancel-text="Cancelar"
              save-text="Guardar"
              @save="savePlanFromModal(props.item._id, props.item.plan, isRx, $store.state.auth.id)"
            >
              <v-chip small label outlined :color="getColor(props.item.plan.id)" class="white--text">
                {{ props.item.plan.name }}
              </v-chip>
              <template v-slot:input>
                <v-select
                  :value="props.item.plan"
                  item-text="name"
                  item-value="id"
                  :items="plans"
                  return-object
                  single-line
                  label="Plan"
                  dense
                  @change="updatePlanFromModal(props.item._id, $event, clients.map(function(x) {return x._id; }).indexOf(props.item._id))"
                />
                <v-switch
                  v-model="isRx"
                  label="Es reconexion?"
                />
              </template>
            </v-edit-dialog>
          </template>
          <template v-slot:item.status="{ item }">
            <svg height="13" width="20">
              <circle :id="item._id" cx="10" cy="8" r="5" :fill="item.status" />
            </svg>
          </template>
        </v-data-table>
      </client-only>
      <v-pagination
        v-model="page"
        :length="pageCount"
      />
    </v-card-text>
  </v-card>
</template>

<script>

export default {
  name: 'Test',
  data () {
    return {
      headers: [
        { text: 'Codigo', value: 'code', sortable: false },
        { text: 'Estado', sortable: false, value: 'status' },
        { text: 'Nombre', value: 'name', sortable: false },
        { text: 'Cedula', value: 'dni', sortable: false },
        { text: 'Direccion', sortable: false, value: 'address' },
        { text: 'Barrio', value: 'neighborhood.name', sortable: false },
        { text: 'Telefono', sortable: false, value: 'phone' },
        { text: 'Plan', value: 'plan.name', sortable: false },
        { text: 'Tecnologia', value: 'technology.name', sortable: false },
        { text: 'Tipo', value: 'newModel', sortable: false },
        { text: 'Activo', value: 'active', sortable: false },
        { text: 'Aciones', value: 'actions', sortable: false }
      ],
      isRx: true,
      itemsPerPage: 5,
      loadingDataTable: false,
      options: {},
      page: 1,
      pageCount: 0,
      searchClientInput: '',
      totalClients: 1000
    }
  },
  computed: {
    clients () {
      return this.$store.state.client.clients
    },
    plans () {
      return this.$store.state.plan.plans
    }
  },
  watch: {
    page () {
      const start = (this.page - 1) * this.itemsPerPage
      const limit = this.itemsPerPage
      const city = this.$route.query.city
      this.$store.dispatch('client/getUsersFromDatabase', { start, limit, city })
    }
  },
  mounted () {
    const city = this.$route.query.city
    this.$store.dispatch('client/getUsersFromDatabase', { start: 0, limit: 5, city })
    this.$store.dispatch('plan/getPlansFromDatabase')
  },
  methods: {
    getClientBySearch () {
      const city = this.$route.query.city
      const search = this.searchClientInput
      if (search) {
        this.$store.dispatch('client/getUsersFromDatabaseBySearch', { search, limit: 5, city })
      } else {
        this.$store.dispatch('client/getUsersFromDatabase', { start: 0, limit: 5, city })
      }
    },
    savePlanFromModal (clientId, newPlan, isRx, operator, index) {
      this.$store.dispatch('client/setPlanFromModal', { clientId, newPlan, isRx, operator, index })
    },
    updatePlanFromModal (clientid, newPlan, index) {
      this.$store.commit('client/updateFromModal', { clientid, newPlan, index })
    },
    getColor (plan) {
      if (plan === '5f52a6fe2824f015ac8ceb58') {
        return 'blue'
      } else if (plan === '5f52a70a2824f015ac8ceb59') {
        return 'green'
      } else if (plan === '5f52a7572824f015ac8ceb5e') {
        return 'red'
      } else if (plan === '5f52a75f2824f015ac8ceb5f') {
        return 'black'
      }
    }
  }
}
</script>

<style>
.done {
  text-decoration: line-through;
}
</style>
