<template>
  <div>
    <v-row>
      <v-col
        cols="12"
      >
        <v-card>
          <v-card-title
            :style="`color:${cityColor};`"
          >
            Tickets
            <v-switch
              v-model="showClosedValue"
              class="ml-4"
              label="Mostrar cerrados"
              @change="showClosed(showClosedValue)"
            />
            <v-spacer />
            <v-text-field
              v-model="search"
              prepend-icon="mdi-magnify"
              label="Buscar Tickets"
              single-line
              hide-details
              outlined
              autofocus
              dense
              class="white--text"
            />
          </v-card-title>
          <client-only>
            <v-data-table
              :key="key"
              :headers="headers"
              :items="ticketList"
              :search="search"
              :items-per-page="itemsPerPage"
              :page.sync="page"
              :loading="initialLoading"
              sort-by="createdAt"
              calculate-widths
              sort-desc
              no-data-text="No hay informacion para mostrar aun..."
              loading-text="Cargando información de tickets..."
              dense
              hide-default-footer
              mobile-breakpoint="100"
              @page-count="pageCount = $event"
            >
              <template v-slot:item.active="props">
                <CreateTicketAdvance
                  :ticketid="props.item.id"
                  :name="props.item.client.name"
                />
                <!-- <v-edit-dialog
                  :return-value.sync="props.item.active"
                  persistent
                  large
                  cancel-text="Cancelar"
                  save-text="Guardar"
                  @save="save(props.item.id, props.item.active)"
                  @cancel="cancel"
                  @close="close"
                >
                  <v-chip small :color="getColor(props.item.active)" class="white--text">
                    {{ getState(props.item.active) }}
                  </v-chip>
                  <template v-slot:input>
                    <v-select
                      v-model="props.item.active"
                      item-text="name"
                      item-value="value"
                      :items="States"
                      single-line
                      label="Estado"
                      dense
                    />
                  </template>
                </v-edit-dialog> -->
              </template>
              <template v-slot:item.createdAt="{ item }">
                <span>
                  {{ getDate(item.createdAt) }}
                </span>
              </template>
            </v-data-table>
          </client-only>
          <div class="text-center pt-2">
            <v-pagination v-model="page" :length="pageCount" />
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar
      v-model="snack"
      :timeout="3000"
      :color="snackColor"
      top
      vertical
    >
      {{ snackText }}

      <template v-slot:action="{ attrs }">
        <v-btn v-bind="attrs" text @click="snack = false">
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import CreateTicketAdvance from '../create/CreateTicketAdvance'
export default {
  name: 'TicketChanges',
  components: {
    CreateTicketAdvance
  },
  apollo: {
    tickets () {
      return {
        query: gql`
        query($city: String){
          tickets(where: {
            city:$city
          }){
            id
            active
            client{
              name
            }
            tickettype{
              name
            }
            assiganted{
              username
            }
            details
            createdAt
          }
        }
      `,
        variables: {
          city: this.$route.query.city
        }
      }
    }
  },
  data () {
    return {
      key: 0,
      page: 1,
      pageCount: 0,
      itemsPerPage: 5,
      search: '',
      currentCity: 'Mariquita',
      cityName: '',
      cityColor: '',
      alertBox: false,
      dialog: false,
      dialogEdit: false,
      initialLoading: false,
      showClosedValue: false,
      headers: [
        { text: 'Estado', sortable: true, value: 'active' },
        { text: 'Cliente', sortable: true, value: 'client.name' },
        { text: 'Tipo', sortable: true, value: 'tickettype.name' },
        { text: 'Operador', sortable: false, value: 'assiganted.username' },
        { text: 'Detalles', sortable: true, value: 'details' },
        { text: 'Creado', sortable: true, value: 'createdAt' }
      ],
      title: 'Cambios de Clave',
      States: [{ name: 'Abierto', value: true }, { name: 'Cerrado', value: false }],
      snack: false,
      snackColor: '',
      snackText: '',
      ticketList: []
    }
  },
  mounted () {
    this.ticketList = this.tickets
    this.showClosed(false)
  },
  methods: {
    showClosed (value) {
      const newData = []
      this.tickets.map((ticket) => {
        if (value === false) {
          if (ticket.active) {
            newData.push(ticket)
          }
        } else {
          newData.push(ticket)
        }
      })
      this.ticketList = newData
    },
    getDate (date) {
      const dateObject = new Date(date)
      const humanDateFormat = dateObject.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })
      return humanDateFormat
    },
    getColor (state) {
      if (state) {
        return 'blue'
      } else {
        return 'red'
      }
    },
    getState (state) {
      if (state) {
        return 'Abierto'
      } else {
        return 'Cerrado'
      }
    },
    save (id, status) {
      this.$apollo.mutate({
        mutation: gql`mutation ($id: ID!, $status: Boolean){
          updateTicket(input: {
          where: {
            id: $id
          }
          data: {
            active: $status
          }
        }){
          ticket{
            id
          }
        }
        }`,
        variables: {
          id,
          status
        }
      }).then((input) => {
        this.snack = true
        this.snackColor = 'info'
        this.snackText = 'Ticket actualizado con éxito.'
      }).catch((error) => {
        this.snack = true
        this.snackColor = 'red'
        this.snackText = error
      })
    },
    cancel () {
      this.snack = true
      this.snackColor = 'error'
      this.snackText = 'Operacion cancelada'
    },
    close () {
      // eslint-disable-next-line no-console
      console.log('Info closed')
    }
  }
}
</script>
