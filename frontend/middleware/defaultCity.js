export default function ({ route, redirect }) {
  if (!route.query.city) {
    if (route.path === '/') {
      return redirect('/lista?city=1')
    }
    const path = route.path
    return redirect(path + '?city=1')
  }
}
