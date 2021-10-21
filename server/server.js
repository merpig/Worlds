const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { makeExecutableSchema} = require('@graphql-tools/schema');
const { execute, subscribe } = require('graphql')
const path = require('path');
const { createServer } = require('http');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const db = require('./config/connection');
const PORT = process.env.PORT || 3001;

//(async function(){

  const app = express();
  const schema = makeExecutableSchema({typeDefs,resolvers});
  const httpServer = createServer(app);
  
  
  const server = new ApolloServer({
    schema,
    context: authMiddleware,
    plugins: [{
      async serverWillStart(){
        return {
          async drainServer(){
            subscriptionServer.close();
          }
        }
      }
    }]
  })
  
  const subscriptionServer = SubscriptionServer.create({
    schema,
    execute,
    subscribe,
    onConnect() {
      console.log("connected");
    }
  }, {
    server: httpServer,
    path: server.graphqlPath
  });
  server.applyMiddleware({app})
  
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
  
  
  db.once('open', () => {
    httpServer.listen(PORT, ()=>{
      console.log(`API server running on port ${PORT}!`);
      console.log(`Subscription endpoit ready at ws://localhost:${PORT}${server.subscriptionsPath}`);
      console.log(`GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  });
//})
