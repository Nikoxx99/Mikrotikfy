module.exports = {
  definition: `
    type ActiveClientList {
      name: String
    }
  `,
  query: `
    ActiveClients(city: String): [ActiveClientList]
  `,
  type: {
    ActiveClientList: {
      name: 'returns the list of all active clients'
    }
  },
  resolver: {
    Query: {
      ActiveClients: {
        description: 'Return the active clients',
        resolver: 'application::city.city.getActiveClients'
      }
    },
  },
};