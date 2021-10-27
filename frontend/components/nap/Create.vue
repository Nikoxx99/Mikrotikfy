<template>
  <v-card>
    <form v-if="cities">
      <v-container>
        <v-alert
          v-if="alertBox"
          type="info"
          :class="alertBoxColor"
          tile
          dismissible
        >
          {{ createdMessage }}
        </v-alert>
        <v-row>
          <v-container>
            <v-text-field
              :v-model="nap.name"
              label="Codigo"
              required
              outlined
              @click="alertBox = false"
            />
            <v-select
              v-model="nap.port"
              :items="items"
              item-text="name"
              item-value="value"
              label="Puertos"
              outlined
              chips
            />
            <v-text-field
              v-model="nap.address"
              label="Direccion"
              required
              outlined
            />
            <v-select
              v-model="nap.city"
              item-text="name"
              item-value="id"
              :items="cities"
              label="Ciudad"
              outlined
              dense
              hide-details
            />
            <v-autocomplete
              v-model="nap.neighborhood"
              item-text="name"
              item-value="id"
              :items="neighborhoods"
              label="Barrio"
              outlined
              dense
              hide-details
            />
            <v-select
              v-model="nap.technology"
              item-text="name"
              item-value="id"
              :items="technologies"
              label="Tecnología"
              outlined
              dense
              required
              hide-details
            />
            <v-btn
              class="mr-4 blue darken-4"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="createNap"
            >
              Crear NAP
            </v-btn>
          </v-container>
        </v-row>
      </v-container>
    </form>
  </v-card>
</template>

<script>
export default {
  name: 'CreateNap',
  data: () => ({
    nap: {
      name: '',
      address: '',
      city: '',
      neighborhood: '',
      technology: '',
      port: ''
    },
    alertBox: false,
    alertBoxColor: '',
    createdMessage: '',
    isSubmitting: false,
    items: [
      {
        value: 16, name: 'NAP X16'
      },
      {
        value: 8, name: 'NAP X8'
      }
    ]
  }),
  computed: {
    cities () {
      return this.$store.state.cities
    },
    neighborhoods () {
      return this.$store.state.neighborhoods
    },
    technologies () {
      return this.$store.state.technologies
    }
  },
  mounted () {
    this.nap.city = this.$route.query.city
  },
  created () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'blue darken-4'
      this.createdMessage = 'Nap creada correctamente.'
    }
  },
  methods: {
    createNap () {
      this.isSubmitting = !this.isSubmitting
      this.$store.dispatch('nap/createNap', this.nap)
        .then(() => {
          this.isSubmitting = !this.isSubmitting
          this.alertBox = true
          this.alertBoxColor = 'info darken-4'
          this.createdMessage = 'NAP creada correctamente.'
        })
        .catch(() => {
          this.isSubmitting = !this.isSubmitting
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = 'Error al crear la NAP.'
        })
    }
  }
}
</script>

<style>

</style>
