//equire('dotenv').config();
const { GraphQLServer } = require('graphql-yoga');
const {importSchema} = require('graphql-import'); // para importat archivos importamos schema

const typeDefs = importSchema('./schema.graphql'); // lo pasamos como valor a typedefs
const {makeExecutableSchema} = require('graphql-tools') //

const verifyToken = require('./services/verifyToken') // exportamos verificacion de token como funcion sin llaves
const { AuthDirective } = require('./services/AuthDirectives') // exportamos directiva auth

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true},(err) =>{
      if(!err){console.log('conectando a Mongo')}
})
// Mutations
const { createUser, login, addPhoto } = require('./resolvers/Mutations/auth')
const { createEvent } = require('./resolvers/Mutations/event')
const { getAllEvents, getEvent } = require('./resolvers/Querys/event')
const resolvers = {
      Query:{     
            saludo: (root, args) => `Hello ${args.name}`,
            getAllEvents,
            getEvent
      },
      Mutation:{
            createUser,
            login,
            createEvent,
            addPhoto
      }
}
const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
      schemaDirectives : {
            auth: AuthDirective
      }
})

const server = new GraphQLServer({ 
      schema,
      context: async({request}) => verifyToken(request)
})
const options = {
      port: process.env.PORT || 4000,
      cors:{
            'origin':"*"
      }
}
server.start(options,({port})=> console.log(`corriendo en puerto ${port}`))