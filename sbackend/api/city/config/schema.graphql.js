module.exports = {
  definition: `
    type ActiveClientList {
      name: String
    }
    type MikrotikClientList {
      name: String
      comment: String
    }
    type MikrotikStatusInfo {
      name: String
      uptime: String
      memory: String
      cpu: String
      version: String
      buildtime: String
      factorysoftware: String
      totalmemory: String
      cpucount: String
      cpufrequency: String
      freehddspace: String
      totalhddspace: String
      architecturename: String
      boardname: String
      platform: String
    }
  `,
  query: `
    ActiveClients(city: String): [ActiveClientList]
    MikrotikClient(city: String): [MikrotikClientList]
    MikrotikStatus(city: String): [MikrotikStatusInfo]
  `,
  type: {
    ActiveClient: {
      name: 'returns the list of all active clients'
    },
    MikrotikClient: {
      name: 'returns the list of all clients on mikrotik'
    },
    MikrotikStatus: {
      name: 'returns the mikrotik information'
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
      },
      MikrotikStatus: {
        description: 'Return the mikrotik status information',
        resolver: 'application::city.city.getMikrotikStatus'
      }
    },
  },
};