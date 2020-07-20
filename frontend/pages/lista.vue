<template>
  <div>
    <v-row>
      <v-col>
        <Navbar />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
      >
        <v-card>
          <v-card-title
            :class="cityColor"
          >
            Clientes {{ city }}
            <v-chip
              color="blue darken-3 white--text"
              small
              class="mx-4"
            >
              Activos: 900
            </v-chip>
            <v-chip
              color="red darken-4 white--text"
              small
              class="mr-4"
            >
              En Mora: 100
            </v-chip>
            <v-chip
              color="primary"
              small
              class="mr-4"
            >
              Totales: 1000
            </v-chip>
            <v-spacer />
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Buscar Cliente"
              single-line
              hide-details
              class="white--text"
            />
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="City.clients"
            :search="search"
            hide-default-footer
            :page.sync="page"
            :items-per-page="itemsPerPage"
            @page-count="pageCount = $event"
          />
          <div class="text-center pt-2">
            <v-pagination v-model="page" :length="pageCount" />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import Navbar from '../components/main/Navbar'
export default {
  components: {
    Navbar
  },
  middleware: 'defaultCity',
  apollo: {
    City () {
      return {
        query: gql`
        query($city: Int) {
          City(id: $city){
            name
            clients{
              code
              name
              dni
              address
              neighborhood{
                name
              }
              city{
                name
              }
              phone
              plan{
                name
              }
              technology{
                name
              }
              operator
            }
          }
        }
      `,
        variables: {
          city: parseInt(this.$route.query.city, 10)
        }
      }
    }
  },
  data () {
    return {
      page: 1,
      pageCount: 0,
      itemsPerPage: 50,
      search: '',
      city: 'Mariquita',
      cityColor: 'blue darken-3 white--text',
      headers: [
        {
          text: 'Codigo',
          align: 'start',
          sortable: true,
          value: 'code'
        },
        { text: 'Nombre', sortable: true, value: 'name' },
        { text: 'Cedula', sortable: true, value: 'dni' },
        { text: 'Direccion', sortable: true, value: 'address' },
        { text: 'Barrio', sortable: true, value: 'neighborhood.name' },
        { text: 'Ciudad', sortable: true, value: 'city.name' },
        { text: 'Telefono', sortable: true, value: 'phone' },
        { text: 'Plan', sortable: true, value: 'plan.name' },
        { text: 'Tecnologia', sortable: true, value: 'technology.name' },
        { text: 'Op.', sortable: true, value: 'operator' }
      ]
    }
  },
  created () {
    if (this.$route.query.city === '2') {
      this.cityColor = 'green darken-3 white--text'
      this.city = 'Fresno'
    }
  }
}
</script>
