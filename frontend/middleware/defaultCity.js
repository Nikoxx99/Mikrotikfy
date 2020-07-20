export default function ({ route, redirect }) {
  if (!route.query.city) {
    return redirect('/lista?city=1')
  }
}
