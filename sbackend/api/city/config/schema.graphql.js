module.exports = {
  definition: `
    type ActiveClientList {
      name: String
    }
    type MikrotikClientList {
      name: String
      comment: String
    }
  `,
  query: `
    ActiveClients(city: String): [ActiveClientList]
    MikrotikClient(city: String): [MikrotikClientList]
  `,
  type: {
    ActiveClient: {
      name: 'returns the list of all active clients'
    },
    MikrotikClient: {
      name: 'returns the list of all clients on mikrotik'
    }
  },
  resolver: {
    Query: {
      ActiveClients: {
        description: 'Return the active clients',
        resolver: 'application::city.city.getActiveClients'
      },
      MikrotikClient: {
        description: 'Return the clients on mikrotik',
        resolver: 'application::city.city.getMikrotikClients'
      }
    },
  },
};