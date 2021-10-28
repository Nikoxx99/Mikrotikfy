<template>
  <v-container fluid>
    <v-row>
      <v-col cols="6">
        <NapCreate />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'NapManage',
  middleware: ['defaultCity', 'authenticated'],
  head () {
    return {
      title: 'Crear NAP'
    }
  }
}
</script>

<style>

</style>
