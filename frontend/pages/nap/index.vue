<template>
  <v-container fluid>
    <v-row>
      <v-col cols="4">
        <NapCreate />
      </v-col>
      <v-col cols="4">
        <NapList @showNapInfo="showNapInfo" />
      </v-col>
      <v-col cols="4">
        <NapClients :napdata="napData" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'NapManage',
  middleware: ['defaultCity', 'authenticated'],
  data () {
    return {
      napData: {}
    }
  },
  computed: {
    currentCity () {
      // eslint-disable-next-line eqeqeq
      return this.$store.state.cities ? this.$store.state.cities.find(c => c.id == this.$route.query.city) : ''
    }
  },
  methods: {
    showNapInfo (data) {
      this.napData = data
    }
  },
  head () {
    return {
      title: 'Crear NAP'
    }
  }
}
</script>

<style>

</style>
