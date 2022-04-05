<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          :block="block"
          :text="!block"
          :x-small="!block"
          :color="$vuetify.theme.dark && !block ? 'white' : 'primary'"
          v-on="on"
          @click="initComponent"
        >
          <v-icon>mdi-newspaper-variant-outline</v-icon>
          <span v-if="block">
            Ficha Técnica
          </span>
        </v-btn>
      </template>
      <span>Ficha Técnica</span>
    </v-tooltip>
    <v-dialog
      v-model="dialog"
      width="680px"
    >
      <v-card>
        <v-toolbar
          dark
          color="primary"
        >
          <v-btn
            icon
            dark
            @click="dialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>Ficha Técnica</v-toolbar-title>
        </v-toolbar>
        <v-stepper
          v-model="e6"
          vertical
        >
          <v-stepper-step
            :complete="e6 > 1"
            step="1"
            editable
          >
            Calidad de señal
          </v-stepper-step>
          <v-stepper-content step="1">
            <v-select
              v-model="specs.quality"
              :items="quality"
              label="Calidad de señal"
              prepend-icon="mdi-signal"
              class="mb-5"
              outlined
              hide-details
            />
            <v-btn
              color="primary"
              @click="e6 = 2"
            >
              Siguiente
            </v-btn>
          </v-stepper-content>

          <v-stepper-step
            :complete="e6 > 2"
            step="2"
            editable
          >
            Medida DBs
          </v-stepper-step>
          <v-stepper-content step="2">
            <v-text-field
              v-model="specs.db"
              label="Medida de DBs"
              prepend-icon="mdi-volume-high"
              class="mb-5"
              outlined
              hide-details
            />
            <v-btn
              color="primary"
              @click="e6 = 3"
            >
              Siguiente
            </v-btn>
          </v-stepper-content>

          <v-stepper-step
            :complete="e6 > 3"
            step="3"
            editable
          >
            Medida Altos
          </v-stepper-step>
          <v-stepper-content step="3">
            <v-text-field
              v-model.number="specs.high"
              label="Altos"
              prepend-icon="mdi-arrow-up-bold-box"
              class="mb-5"
              type="number"
              outlined
              hide-details
            />
            <v-btn
              color="primary"
              @click="e6 = 4"
            >
              Siguiente
            </v-btn>
          </v-stepper-content>

          <v-stepper-step
            :complete="e6 > 4"
            step="4"
            editable
          >
            Medida Bajos
          </v-stepper-step>
          <v-stepper-content step="4">
            <v-text-field
              v-model.number="specs.down"
              label="Bajos"
              prepend-icon="mdi-arrow-down-bold-box"
              class="mb-5"
              type="number"
              outlined
              hide-details
            />
            <v-btn
              color="primary"
              @click="save()"
            >
              Guardar
            </v-btn>
          </v-stepper-content>
        </v-stepper>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>
export default {
  props: {
    clientid: {
      type: Number,
      default: -1
    },
    name: {
      type: String,
      default: ''
    },
    block: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      e6: 1,
      dialog: false,
      quality: [
        'Excelente',
        'Regular',
        'Mala'
      ],
      specs: {
        quality: null,
        db: -1
      }
    }
  },
  methods: {
    initComponent () {
      this.dialog = true
    },
    save () {
      this.dialog = false
      this.$toast.info('Guardando...', { duration: 2000 })
      this.e6 = 1
    }
  }
}
</script>
