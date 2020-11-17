export default function ({ route, redirect }) {
  if (!route.query.city) {
    const path = route.path
    return redirect(path + '?city=1')
  }
}
