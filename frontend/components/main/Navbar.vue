<template>
  <v-row>
    <v-col>
      <v-card>
        <v-card-title>
          <v-btn
            class="mr-4"
            color="red darken-3 white--text"
          >
            <v-icon>mdi-trash</v-icon>
            Desconectar Clientes
          </v-btn>
          <v-btn
            class="mr-4"
            color="success"
          >
            <v-icon>mdi-key</v-icon>
            Cambios de Clave
          </v-btn>
          <v-spacer />
          <v-btn
            class="mr-4"
            color="primary"
            href="/lista?city=1"
          >
            Mariquita
          </v-btn>
          <v-btn
            class="mr-4"
            color="success"
            href="/lista?city=2"
          >
            Fresno
          </v-btn>
        </v-card-title>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
}
</script>

<style>

</style>
