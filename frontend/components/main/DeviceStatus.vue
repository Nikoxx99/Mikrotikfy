<template>
  <div>
    pasar las request de los datos por un microservicio estilo las ads de fenix que los actualice casa X tiempo
    <v-row class="d-flex justify-center my-6">
      <v-col
        cols="2"
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
            <h1>{{ activeClients }}</h1>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="2"
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
            <h1>{{ clientCountActive }}</h1>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="2"
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
            <h1>{{ clientCountDisable }}</h1>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="2"
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
            <h1>{{ clientCountRetired }}</h1>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="2"
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
            <h1>{{ clientCount }}</h1>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <Mikrotik />
  </div>
</template>

<script>
import Mikrotik from '../misc/Mikrotik'
export default {
  name: 'DeviceStatus',
  components: {
    Mikrotik
  },
  computed: {
    activeClients () {
      return this.$store.state.activeClients
    },
    clientCount () {
      return this.$store.state.clientCount
    },
    clientCountActive () {
      return this.$store.state.clientCountActive
    },
    clientCountDisable () {
      return this.$store.state.clientCountDisable
    },
    clientCountRetired () {
      return this.$store.state.clientCountRetired
    }
  }
}
</script>
