<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <h1>Crear Ciudad</h1>
        <CreateCity />
      </v-col>
      <v-col cols="6">
        <h1>Crear Barrio</h1>
        <CreateNeighborhood />
      </v-col>
      <v-col cols="6">
        <h1>Crear Plan</h1>
        <CreatePlan />
      </v-col>
      <v-col cols="6">
        <h1>Crear Tecnologia</h1>
        <CreateTechnology />
      </v-col>
      <v-col cols="6">
        <h1>Crear Bot de Telegram</h1>
        <CreateTelegramBot />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import CreateCity from '../components/create/CreateCity'
import CreateNeighborhood from '../components/create/CreateNeighborhood'
import CreatePlan from '../components/create/CreatePlan'
import CreateTechnology from '../components/create/CreateTechnology'
import CreateTelegramBot from '../components/create/CreateTelegrambot'
export default {
  components: {
    CreateCity,
    CreateNeighborhood,
    CreatePlan,
    CreateTechnology,
    CreateTelegramBot
  },
  middleware: 'authenticated'
}
</script>

<style>

</style>
