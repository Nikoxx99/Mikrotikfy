import { auth } from './auth'
import User from './models/User'
import Client from './models/Client'
import City from './models/City'
import Neighborhood from './models/Neighborhood'
import Plan from './models/Plan'
import Technology from './models/Technology'
import { mkCreateClient, mkDeleteClient, mkClientStatus } from './mikrotik/functions'
const simpleResponse = async (success, path, message) => {
  return { success: success, errors: [{ path: path, message: message }] }
}
export const resolvers = {
  Query: {
    Client: async (_, { _id }) => {
      return await Client.findById(_id)
    },
    Clients: async (_, { limit }) => {
      return await Client.find().limit(limit).sort({ 'code': 'desc' })
    },
    City: async (_, { id }) => {
      return await City.findOne({id: id})
    },
    Cities: async (_, { limit }) => {
      return await City.find().limit(limit)
    },
    Neighborhood: async (_, { _id }) => {
      return await Neighborhood.findById(_id)
    },
    Neighborhoods: async (_, { limit }) => {
      return await Neighborhood.find().limit(limit)
    },
    Plan: async (_, { _id }) => {
      return await Plan.findById(_id)
    },
    Plans: async (_, { limit }) => {
      return await Plan.find().limit(limit)
    },
    Technology: async (_, { _id }) => {
      return await Technology.findById(_id)
    },
    Technologies: async (_, { limit }) => {
      return await Technology.find().limit(limit)
    },
  },
  Mutation: {
    createClient: async (_, { input: {city, neighborhood, plan, technology, ...data} }) => {
      const newClient = new Client({city,plan,neighborhood,technology,...data})
      const newCity = await City.find({id: city},{name: 1, ip:1, _id:0})
      const newNeighborhood = await Neighborhood.find({id: neighborhood},{name: 1, _id:0})
      const newPlan = await Plan.find({id: plan},{name: 1, mikrotik_name: 1, _id:0})
      const newTechnology = await Technology.find({id: technology},{name: 1, _id:0})
      const res = await newClient.save()
      if (res) {
        await mkCreateClient({newCity,newNeighborhood,newPlan,newTechnology,...data})
        return simpleResponse(true, 'Create Client', 'Client Created Successfullly.')
      } else {
        return simpleResponse(false, 'Create Client', 'Error Creating Client.')
      }
    },
    editClient: async (_,{input}) => {
      const id = input._id
      const res = await Client.updateOne({_id: id}, input, {multi: false})
      if(res){
        return simpleResponse(true,'Edit Client','Client Edited Successfuly')
      }else{
        return simpleResponse(false,'Edit Client','Error Editing Client')
      }
    },
    editClientPlan: async (_,{input}) => {
      console.log(input)
      const id = input.id
      const plan = input.plan
      const res = await Client.updateOne({_id: id}, {plan}, {multi: false})
      if(res){
        return simpleResponse(true,'Edit Client Plan','Client Plan Edited Successfuly')
      }else{
        return simpleResponse(false,'Edit Client Plan','Error Editing Client Plan')
      }
    },
    deleteClient: async (_,{id}) => {
      const search = await Client.find({_id: id})
      const searchCity = search[0].city
      const city = await City.find({id: searchCity})
      const newCity = city[0].ip
      const client = search[0].code
      const deleteEpisode = await Client.findByIdAndDelete(id)
      const delMikrotik = await mkDeleteClient({client,newCity})
      if(deleteEpisode && delMikrotik){
        return simpleResponse(true,'Delete Client','Client deleted successfully.')
      }else{
        return simpleResponse(false,'Delete Client','Error deleting Client.')
      }
    },
    getClientStatus: async (_,{id}) => {
      const search = await Client.find({_id: id})
      const searchCity = search[0].city
      const city = await City.find({id: searchCity})
      const newCity = city[0].ip
      const client = search[0].code
      const status = await mkClientStatus({client, newCity})
      return status
    },
    createCity: async (_, { input }) => {
      const newCity = new City(input)
      const res = await newCity.save()
      if (res) {
        return simpleResponse(true, 'Create City', 'City Created Successfullly.')
      } else {
        return simpleResponse(false, 'Create City', 'Error Creating City.')
      }
    },
    createNeighborhood: async (_, { input }) => {
      const newNeighborhood = new Neighborhood(input)
      const res = await newNeighborhood.save()
      if (res) {
        return simpleResponse(true, 'Create Neighborhood', 'Neighborhood Created Successfullly.')
      } else {
        return simpleResponse(false, 'Create Neighborhood', 'Error Creating Neighborhood.')
      }
    },
    createPlan: async (_, { input }) => {
      const newPlan = new Plan(input)
      const res = await newPlan.save()
      if (res) {
        return simpleResponse(true, 'Create Plan', 'Plan Created Successfullly.')
      } else {
        return simpleResponse(false, 'Create Plan', 'Error Creating Plan.')
      }
    },
    createTechnology: async (_, { input }) => {
      const newTechnology = new Technology(input)
      const res = await newTechnology.save()
      if (res) {
        return simpleResponse(true, 'Create Technology', 'Technology Created Successfullly.')
      } else {
        return simpleResponse(false, 'Create Technology', 'Error Creating Technology.')
      }
    },
    createUser: async function (_,{input: {...data}}){
      const emailUser = await User.findOne({email: data.email})
      const userUser = await User.findOne({username: data.username})
      const role = 1
      if(emailUser){
        return simpleResponse(false,'Create User','Email already exists.')
      }else if (userUser){
        return simpleResponse(false,'Create User','Username already exists.')
      }else{
        const newUser = new User({role,...data})
        newUser.password = await newUser.encryptPassword(data.password)
        const res = await newUser.save()
        if(res){
          return simpleResponse(true,'Create User','User created successfully.')
        }else{
          return simpleResponse(false,'Create User','User creating error.')
        }
      }
    },
    login: async (_, {input}, SECRET) => auth.login(input, User, SECRET)
  },
  Client: {
    city({ city }) {
      return City.findOne({ id: city})
    },
    neighborhood({ neighborhood }){
      return Neighborhood.findOne({ id: neighborhood})
    },
    plan({ plan }) {
      return Plan.findOne({ id: plan})
    },
    technology({ technology }) {
      return Technology.findOne({ id: technology})
    }
  },
  City: {
    clients({ id }) {
      return Client.find({ city: id }).sort({ 'code': 'desc' })
    },
    neighborhoods({ id }) {
      return Neighborhood.find({ city: id }).sort({ 'code': 'desc' })
    }
  },
  Neighborhood: {
    clients({ id }) {
      return Client.find({ city: id }).sort({ 'code': 'desc' })
    },
    cities({ city }) {
      return City.find({ id: city }).sort({ 'code': 'desc' })
    }
  },
  Plan: {
    clients({ id }) {
      return Client.find({ plan: id }).sort({ 'code': 'desc' })
    },
  },
  Technology: {
    clients({ id }) {
      return Client.find({ technology: id }).sort({ 'code': 'desc' })
    },
  }
}