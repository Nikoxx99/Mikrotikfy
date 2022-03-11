export default function ({ store, route, redirect }) {
  console.log(route.path)
  if (!store.state.auth) {
    return redirect('/login')
  }
  if (route.path !== '/inventario' && store.state.auth.role.name === 'inventory') {
    return redirect('/inventario')
  }
}
