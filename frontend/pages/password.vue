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
            Cambios de Clave
            <v-spacer />
            <v-text-field
              v-model="search"
              prepend-icon="mdi-magnify"
              label="Buscar Cambios por DNI"
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
              :items="PasswordChanges"
              :search="search"
              :items-per-page="itemsPerPage"
              :page.sync="page"
              :loading="initialLoading"
              sort-by="created_at"
              calculate-widths
              sort-desc
              no-data-text="No hay informacion para mostrar aun..."
              loading-text="Cargando información de clientes..."
              dense
              hide-default-footer
              mobile-breakpoint="100"
              @page-count="pageCount = $event"
            >
              <template v-slot:item.closed="props">
                <v-edit-dialog
                  :return-value.sync="props.item.closed"
                  persistent
                  large
                  cancel-text="Cancelar"
                  save-text="Guardar"
                  @save="save(props.item._id, props.item.closed)"
                  @cancel="cancel"
                  @close="close"
                >
                  <v-chip small :color="getColor(props.item.closed)" class="white--text">
                    {{ getState(props.item.closed) }}
                  </v-chip>
                  <template v-slot:input>
                    <v-select
                      v-model="props.item.closed"
                      item-text="name"
                      item-value="value"
                      :items="States"
                      return-object
                      single-line
                      label="Estado"
                      dense
                    />
                  </template>
                </v-edit-dialog>
              </template>
              <template v-slot:item.created_at="{ item }">
                <span>
                  {{ getDate(item.created_at) }}
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
export default {
  components: {
  },
  middleware: 'authenticated',
  apollo: {
    PasswordChanges () {
      return {
        query: gql`
        query{
          PasswordChanges(limit: 100){
            _id
            dni
            old_password
            new_password
            closed {
              name
              value
            }
            created_at
          }
        }
      `
      }
    }
  },
  data () {
    return {
      key: 0,
      page: 1,
      pageCount: 0,
      itemsPerPage: 50,
      search: '',
      currentCity: 'Mariquita',
      cityName: '',
      cityColor: '',
      alertBox: false,
      dialog: false,
      dialogEdit: false,
      initialLoading: false,
      headers: [
        { text: 'Cedula', sortable: true, value: 'dni' },
        { text: 'Clave Anterior', sortable: false, value: 'old_password' },
        { text: 'Clave Nueva', sortable: true, value: 'new_password' },
        { text: 'Estado', sortable: true, value: 'closed' },
        { text: 'Fecha', sortable: false, value: 'created_at' }
      ],
      title: 'Cambios de Clave',
      States: [{ name: 'Abierto', value: false }, { name: 'Cerrado', value: true }],
      snack: false,
      snackColor: '',
      snackText: ''
    }
  },
  methods: {
    getDate (date) {
      const dateObject = new Date(parseInt(date))
      const humanDateFormat = dateObject.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric' })
      return humanDateFormat
    },
    getColor (state) {
      if (state.value) {
        return 'red'
      } else {
        return 'blue'
      }
    },
    getState (state) {
      if (state.value) {
        return 'Cerrado'
      } else {
        return 'Abierto'
      }
    },
    save (id, status) {
      this.$apollo.mutate({
        mutation: gql`mutation ($input: UpdatePasswordChangeInput){
          updatePasswordChangeRequest(input: $input){
            success
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          input: {
            _id: id,
            closed: {
              name: status.name,
              value: status.value
            }
          }
        }
      }).then((input) => {
        this.snack = true
        this.snackColor = 'info'
        this.snackText = 'Petición actualizada con éxito.'
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
  },
  head () {
    return {
      title: this.title,
      meta: [
        { hid: 'language', name: 'language', content: 'es' },
        { hid: 'audience', name: 'audience', content: 'all' },
        { hid: 'rating', name: 'rating', content: 'general' },
        { hid: 'distribution', name: 'distribution', content: 'global' },
        { hid: 'document-type', name: 'document-type', content: 'Public' },
        { hid: 'MSSmartTagsPreventParsing', name: 'MSSmartTagsPreventParsing', content: 'true' },
        { hid: 'robots', name: 'robots', content: 'all' },
        { hid: 'robots', name: 'robots', content: 'all, index, follow' },
        { hid: 'googlebot', name: 'googlebot', content: 'all, index, follow' },
        { hid: 'yahoo-slurp', name: 'yahoo-slurp', content: 'all, index, follow' },
        { hid: 'msnbot', name: 'msnbot', content: 'index, follow' },
        { hid: 'googlebot-image', name: 'googlebot-image', content: 'all' },
        { hid: 'title', name: 'title', content: this.title },
        { hid: 'og:title', property: 'og:title', content: this.title },
        { hid: 'og:description', property: 'og:description', content: 'ARNOProducciones - Base de datos interactiva' },
        { hid: 'author', name: 'author', content: 'Nicolas Echeverry' }
      ]
    }
  }
}
</script>
