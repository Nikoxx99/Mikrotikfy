<template>
  <v-card width="560px">
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
              :value="nap.name ? name.toUpperCase() : ''"
              label="Codigo"
              required
              @input="nap.name = $event.toUpperCase()"
            />
            <v-select
              v-model="nap.port"
              :items="items"
              item-text="name"
              item-value="value"
              label="Puertos"
              chips
            />
            <v-text-field
              v-model="nap.address"
              label="Direccion"
              required
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
              return-object
            />
            <v-select
              v-model="nap.technology"
              item-text="name"
              item-value="id"
              :items="technologies"
              return-object
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
    this.nap.city = {
      id: this.$route.query.city
    }
  },
  created () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'blue darken-4'
      this.createdMessage = 'Ciudad creada correctamente.'
    }
  },
  methods: {
    createNap () {
      this.isSubmitting = !this.isSubmitting
    }
  }
}
</script>

<style>

</style>
