export default function ({ store, redirect }) {
  if (!store.state.auth) {
    return redirect('/login')
  }
  if (store.state.auth.role === 'Authenticated') {
    return redirect('/prohibited')
  }
}
