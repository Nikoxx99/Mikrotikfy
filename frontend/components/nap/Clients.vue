<template>
  <div v-if="napdata">
    <v-card :loading="loading">
      <v-card-title>
        Nap {{ napdata.code }}
      </v-card-title>
      <v-card-text>
        <client-only>
          <v-data-table
            :headers="headersNapClientList"
            :items="napClientsList"
            class="elevation-1"
            no-data-text="No hay clientes que mostrar"
          />
        </client-only>
      </v-card-text>
      <!-- <v-card-text>
        <client-only>
          <v-data-table
            :headers="headersClientList"
            :items="clientList"
            no-data-text="No han cargando los clientes"
            no-results-text="Error al cargar los clientes"
            class="elevation-1"
          />
        </client-only>
      </v-card-text> -->
    </v-card>
  </div>
</template>
<script>
export default {
  props: {
    napdata: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      loading: true,
      napClientsList: [],
      headersNapClientList: [
        { text: 'Codigo', value: 'code' },
        { text: 'Cedula', value: 'dni' },
        { text: 'Nombre', value: 'name' },
        { text: 'Direccion', value: 'address' },
        { text: 'Acciones', value: 'actions' }
      ],
      headersClientList: [
        { text: 'Codigo', value: 'code' },
        { text: 'Puertos', value: 'ports' },
        { text: 'Barrio', value: 'neighborhood.name' },
        { text: 'Direccion', value: 'address' },
        { text: 'Acciones', value: 'actions' }
      ]
    }
  },
  watch: {
    napdata () {
      this.getNapClients()
    }
  },
  mounted () {
    if (this.napdata) {
      this.getNapClients()
    }
    // this.getClients()
  },
  methods: {
    async getNapClients () {
      this.loading = true
      await this.$strapi.findOne('naps', this.napdata.id).then((response) => {
        this.napClientsList = response.clients
        this.loading = false
      })
    }
  }
}

</script>
