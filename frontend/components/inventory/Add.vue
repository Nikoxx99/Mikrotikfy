<template>
  <v-row>
    <v-col>
      <v-card>
        <v-card-title>
          Agregar Material
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="10">
              <v-autocomplete
                :disabled="!(!$isAdmin() || !$isBiller())"
                item-text="name"
                item-value="id"
                :items="neighborhoods"
                return-object
                label="Material a agregar"
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
                Agregar
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col>
      <v-card>
        <v-card-title>
          Agregar Item
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                label="Item"
                outlined
                dense
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn
                color="success darken-4"
              >
                Agregar
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
