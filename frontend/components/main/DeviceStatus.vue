<template>
  <div>
    <v-row class="d-flex justify-center my-6">
      <v-col
        cols="10"
        xl="2"
        lg="2"
        md="3"
        sm="6"
        xs="12"
      >
        <v-card
          elevation="1"
          class="green darken-3 justify-center"
          style="display:grid;"
          shaped
        >
          <v-card-title>
            Clientes En Linea
          </v-card-title>
          <v-card-text>
            <h1>{{ active }}</h1>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="10"
        xl="2"
        lg="2"
        md="3"
        sm="6"
        xs="12"
      >
        <v-card
          elevation="1"
          class="blue darken-4 justify-center"
          style="display:grid;"
          shaped
        >
          <v-card-title>
            Clientes Activos
          </v-card-title>
          <v-card-text>
            <h1>{{ countActive }}</h1>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="10"
        xl="2"
        lg="2"
        md="3"
        sm="6"
        xs="12"
      >
        <v-card
          elevation="1"
          class="red darken-3 justify-center"
          style="display:grid;"
          shaped
        >
          <v-card-title>
            Clientes en Mora
          </v-card-title>
          <v-card-text>
            <h1>{{ countDisable }}</h1>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="10"
        xl="2"
        lg="2"
        md="3"
        sm="6"
        xs="12"
      >
        <v-card
          elevation="1"
          class="purple darken-4 justify-center"
          style="display:grid;"
          shaped
        >
          <v-card-title>
            Clientes Retirados
          </v-card-title>
          <v-card-text>
            <h1>{{ countRetired }}</h1>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="10"
        xl="2"
        lg="2"
        md="3"
        sm="6"
        xs="12"
      >
        <v-card
          elevation="1"
          class="cyan darken-4 justify-center"
          style="display:grid;"
          shaped
        >
          <v-card-title>
            Clientes Totales
          </v-card-title>
          <v-card-text>
            <h1>{{ count }}</h1>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <Mikrotik :data="mikrotikData" />
  </div>
</template>

<script>
import Mikrotik from '../misc/Mikrotik'
export default {
  name: 'DeviceStatus',
  components: {
    Mikrotik
  },
  data () {
    return {
      active: 0,
      count: 0,
      countActive: 0,
      countDisable: 0,
      countRetired: 0,
      mikrotikData: {}
    }
  },
  mounted () {
    this.countClientData()
    this.getMikrotikStatus()
  },
  methods: {
    async countClientData () {
      const data = await this.$strapi.graphql({
        query: `
          query($city: ID!) {
            city(id: $city) {
              active
              count
              countActive
              countDisable
              countRetired
            }
          }
        `,
        variables: {
          city: this.$route.query.city
        }
      })
      this.active = data.city.active
      this.count = data.city.count
      this.countActive = data.city.countActive
      this.countDisable = data.city.countDisable
      this.countRetired = data.city.countRetired
    },
    async getMikrotikStatus () {
      const data = await this.$strapi.graphql({
        query: `
          query($city: String) {
            mikrotiks(where:{
              city:$city
            }) {
              name
              city{
                name
              }
              ip
              uptime
              cpu
              memory
              version
              buildtime
              factorysoftware
              totalmemory
              cpucount
              cpufrequency
              freehddspace
              totalhddspace
              architecturename
              platform
              boardname
            }
          }
        `,
        variables: {
          city: this.$route.query.city
        }
      })
      this.mikrotikData = data.mikrotiks
    }
  }
  // computed: {
  //   activeClients () {
  //     return this.$store.state.activeClients
  //   },
  //   clientCount () {
  //     return this.$store.state.clientCount
  //   },
  //   clientCountActive () {
  //     return this.$store.state.clientCountActive
  //   },
  //   clientCountDisable () {
  //     return this.$store.state.clientCountDisable
  //   },
  //   clientCountRetired () {
  //     return this.$store.state.clientCountRetired
  //   }
  // }
}
</script>
