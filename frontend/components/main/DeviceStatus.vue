<template>
  <div>
    <Mikrotik />
    <v-row class="d-flex justify-center my-6 px-5">
      <v-col
        cols="3"
      >
        <v-card
          elevation="1"
          class="cyan darken-4 justify-center"
          style="display:grid;"
          shaped
        >
          <v-card-title>
            CCR
          </v-card-title>
          <v-card-text>
            Status
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="3"
      >
        <v-card
          elevation="1"
          class="cyan darken-4 justify-center"
          style="display:grid;"
          shaped
        >
          <v-card-title>
            CCR
          </v-card-title>
          <v-card-text>
            Status
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="3"
      >
        <v-card
          elevation="1"
          class="cyan darken-4 justify-center"
          style="display:grid;"
          shaped
        >
          <v-card-title>
            CCR
          </v-card-title>
          <v-card-text>
            Status
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="3"
      >
        <v-card
          elevation="1"
          class="cyan darken-4 justify-center"
          style="display:grid;"
          shaped
        >
          <v-card-title>
            CCR
          </v-card-title>
          <v-card-text>
            Status
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Mikrotik from '../misc/Mikrotik'
export default {
  name: 'DeviceStatus',
  components: {
    Mikrotik
  }
}
</script>
