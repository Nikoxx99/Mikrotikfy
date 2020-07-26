<template>
  <v-img
    src="loginbg.jpg"
    style="width:100%!important;height:100vh!important;background-position:bottom!important"
  >
    <v-container>
      <v-row>
        <v-col
          cols="12"
          xs="12"
          sm="10"
          md="8"
          lg="4"
          lx="4"
          class="mx-auto"
        >
          <RegisterForm />
        </v-col>
      </v-row>
    </v-container>
  </v-img>
</template>

<script>
import RegisterForm from '../components/auth/RegisterForm'
export default {
  components: {
    RegisterForm
  },
  middleware: 'notAuthenticated'
}
</script>

<style>

</style>
