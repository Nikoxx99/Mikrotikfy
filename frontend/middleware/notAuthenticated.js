export default function ({ store, redirect }) {
  if (store.state.auth) {
    return redirect('/clients?city=5f832e8fb0c43e2c64b37437')
  }
}
