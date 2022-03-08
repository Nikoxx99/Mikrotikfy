<template>
  <v-row>
    <v-col cols="6">
      <v-card>
        <v-card-title>
          Entregar
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-autocomplete
                :disabled="!(!$isAdmin() || !$isBiller())"
                item-text="name"
                item-value="id"
                :items="neighborhoods"
                return-object
                label="Operario"
                outlined
                dense
                hide-details
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="10">
              <v-autocomplete
                :disabled="!(!$isAdmin() || !$isBiller())"
                item-text="name"
                item-value="id"
                :items="neighborhoods"
                return-object
                label="Material"
                outlined
                dense
                hide-details
              />
            </v-col>
            <v-col cols="2">
              <v-text-field
                label="Cantidad"
                type="number"
                outlined
                dense
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                color="red darken-4 text--white"
              >
                Entregar
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="6">
      <v-card>
        <v-card-title>
          Devolver
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-autocomplete
                :disabled="!(!$isAdmin() || !$isBiller())"
                item-text="name"
                item-value="id"
                :items="neighborhoods"
                return-object
                label="Operario"
                outlined
                dense
                hide-details
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="10">
              <v-autocomplete
                :disabled="!(!$isAdmin() || !$isBiller())"
                item-text="name"
                item-value="id"
                :items="neighborhoods"
                return-object
                label="Material"
                outlined
                dense
                hide-details
              />
            </v-col>
            <v-col cols="2">
              <v-text-field
                label="Cantidad"
                type="number"
                outlined
                dense
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                color="primary darken-4"
              >
                Devolver
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
}
</script>
