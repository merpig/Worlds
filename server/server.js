const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { User, Friend } = require('./models')
const { PubSub } = require('graphql-subscriptions');
const { makeExecutableSchema} = require('@graphql-tools/schema');
const { execute, subscribe } = require('graphql')
const path = require('path');
const { createServer } = require('http');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const db = require('./config/connection');
const PORT = process.env.PORT || 3001;
const jwt = require('jsonwebtoken');
const secret = 'mysecretssshhhhhhh'; // TODO: move to .env
const expiration = '2h';
const pubsub = new PubSub();
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
  context: authMiddleware,
  execute,
  subscribe,
  onConnect(connectionParams) {
    const token = connectionParams.authToken.split(' ').pop().trim();
    if(token){
      try {
        const { data } = jwt.verify(token, secret, { maxAge: expiration });

        // Friend.find({
        //   $and: [
        //     {$or: [{ requesting: data._id }, { receiving: data._id }]},
        //     {status: 1}
        //   ]
        // },'receiving requesting').populate('receiving').populate('requesting').then(friends=>{
        //   const filtered = friends.map(friend=>{
        //     return friend.requesting.username === data.username?
        //       friend.receiving.username:friend.requesting.username;
        //   });
        //   pubsub.publish('LOGGED_IN',{
        //     filtered,
        //     loggedIn: {} // returned user data here
        //   });
        //   console.log(filtered)
        // });

        console.log(`${data.username} has connected`);
        return data
      } catch {
        console.log('Invalid token');
      }
    }
    return false;
  },
  onDisconnect(_,context){
    context.initPromise.then( async user=>{
      if(user){
        console.log(`${user.username} has disconnected`)
      }
    })
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
