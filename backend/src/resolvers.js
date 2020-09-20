import { auth } from './auth'
import User from './models/User'
import Client from './models/Client'
import City from './models/City'
import Neighborhood from './models/Neighborhood'
import Plan from './models/Plan'
import Technology from './models/Technology'
import { mkCreateClient, mkDeleteClient, mkClientStatus, mkGetActiveClients, mkSetClientPlanInformation, mkGetComment, mkSetComment } from './mikrotik/functions'
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
    getActiveClients: async (_, {city}) =>{
      const search = await City.find({id: city})
      const newCity = search[0].ip
      const activeClients = await mkGetActiveClients({newCity})
      return activeClients
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
    createClient: async (_, { input: {city, neighborhood, plan, technology, sendToMikrotik, ...data} }) => {
      const newClient = new Client({city,plan,neighborhood,technology,...data})
      const newCity = await City.find({id: city},{name: 1, ip:1, _id:0})
      const newNeighborhood = await Neighborhood.find({id: neighborhood},{name: 1, _id:0})
      const newPlan = await Plan.find({id: plan},{name: 1, mikrotik_name: 1, _id:0})
      const newTechnology = await Technology.find({id: technology},{name: 1, _id:0})
      const res = await newClient.save()
      if (res) {
        if (sendToMikrotik) {
          await mkCreateClient({newCity,newNeighborhood,newPlan,newTechnology,...data})
        }
        return simpleResponse(true, 'Create Client', 'Client Created Successfullly.')
      } else {
        return simpleResponse(false, 'Create Client', 'Error Creating Client.')
      }
    },
    editClient: async (_,{input}) => {
      const id = input._id
      const search = await Client.find({_id: id})
      const code = search[0].code

      const searchCity = search[0].city
      const city = await City.find({id: searchCity})
      const newCity = city[0].ip

      const searchPlan = input.plan
      const plan = await Plan.find({id: searchPlan})
      const newPlan = plan[0].mikrotik_name

      const dni = input.dni
      const model = input.newModel

      const comment = input.comment

      const currentPlan = input.plan
      const dbPlan = search[0].plan
      var removeActive = false
      if (currentPlan == dbPlan) {
        // eslint-disable-next-line no-redeclare
        var removeActive = false
      } else {
        // eslint-disable-next-line no-redeclare
        var removeActive = true
      }

      const res = await Client.updateOne({_id: id}, input, {multi: false})
      const mkRes = await mkSetClientPlanInformation({newPlan, newCity, dni, code, model, comment, removeActive})
      await mkSetComment({newPlan, newCity, dni, code, model, comment})
      if(res && mkRes){
        return simpleResponse(true,'Edit Client','Client Edited Successfuly')
      }else{
        return simpleResponse(false,'Edit Client','Error Editing Client')
      }
    },
    editClientPlan: async (_,{input}) => {
      const id = input.id
      const search = await Client.find({_id: id})
      const code = search[0].code

      const searchCity = search[0].city
      const city = await City.find({id: searchCity})
      const newCity = city[0].ip

      const searchPlan = input.plan
      const plan = await Plan.find({id: searchPlan})
      const savePlan = plan[0].id
      const newPlan = plan[0].mikrotik_name

      const dni = search[0].dni
      const model = search[0].newModel

      const removeActive = true

      const res = await Client.updateOne({_id: id}, {savePlan}, {multi: false})
      const mkRes = await mkSetClientPlanInformation({newPlan, newCity, dni, code, model, removeActive})
      if(res && mkRes){
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
      const code = search[0].code
      const dni = search[0].dni
      const model = search[0].newModel
      const status = await mkClientStatus({dni, code, newCity, model})
      return status
    },
    getClientComment: async (_,{id}) => {
      const search = await Client.find({_id: id})
      const searchCity = search[0].city
      const city = await City.find({id: searchCity})
      const newCity = city[0].ip
      const code = search[0].code
      const dni = search[0].dni
      const model = search[0].newModel
      const comment = await mkGetComment({dni, code, newCity, model})
      return comment
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
    updateCity: async (_,{input}) => {
      const updateCity = await City.updateOne({id: input.id}, input, {multi: false})
      if(updateCity){
        return simpleResponse(true,'Update City','City updated successfully.')
      }else{
        return simpleResponse(false,'Update City','Error updating City.')
      }
    },
    deleteCity: async (_,{id}) => {
      const deleteCity = await City.findOneAndRemove(id)
      if(deleteCity){
        return simpleResponse(true,'Delete City','City deleted successfully.')
      }else{
        return simpleResponse(false,'Delete City','Error deleting City.')
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
    updateNeighborhood: async (_,{input}) => {
      const updateNeighborhood = await Neighborhood.updateOne({id: input.id}, input, {multi: false})
      if(updateNeighborhood){
        return simpleResponse(true,'Update Neighborhood','Neighborhood updated successfully.')
      }else{
        return simpleResponse(false,'Update Neighborhood','Error updating Neighborhood.')
      }
    },
    deleteNeighborhood: async (_,{id}) => {
      const deleteNeighborhood = await Neighborhood.findOneAndRemove(id)
      if(deleteNeighborhood){
        return simpleResponse(true,'Delete Neighborhood','Neighborhood deleted successfully.')
      }else{
        return simpleResponse(false,'Delete Neighborhood','Error deleting Neighborhood.')
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
    updatePlan: async (_,{input}) => {
      const updatePlan = await Plan.updateOne({id: input.id}, input, {multi: false})
      if(updatePlan){
        return simpleResponse(true,'Update Plan','Plan updated successfully.')
      }else{
        return simpleResponse(false,'Update Plan','Error updating Plan.')
      }
    },
    deletePlan: async (_,{id}) => {
      const deletePlan = await Plan.findOneAndRemove(id)
      if(deletePlan){
        return simpleResponse(true,'Delete Plan','Plan deleted successfully.')
      }else{
        return simpleResponse(false,'Delete Plan','Error deleting Plan.')
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
    updateTechnology: async (_,{input}) => {
      const updateTechnology = await Technology.updateOne({id: input.id}, input, {multi: false})
      if(updateTechnology){
        return simpleResponse(true,'Update Technology','Technology updated successfully.')
      }else{
        return simpleResponse(false,'Update Technology','Error updating Technology.')
      }
    },
    deleteTechnology: async (_,{id}) => {
      const deleteTechnology = await Technology.findOneAndRemove(id)
      if(deleteTechnology){
        return simpleResponse(true,'Delete Technology','Technology deleted successfully.')
      }else{
        return simpleResponse(false,'Delete Technology','Error deleting Technology.')
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
    clients({ id }, {limit}) {
      return Client.find({ city: id }).sort({ 'code': 'desc' }).limit(limit)
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