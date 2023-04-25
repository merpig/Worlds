const express = require('express');
const { ApolloServer, PubSub } = require('apollo-server-express');
const { User, Friend } = require('./models')
const { makeExecutableSchema} = require('@graphql-tools/schema');
const path = require('path');
const { createServer } = require('http');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const db = require('./config/connection');
const PORT = process.env.PORT || 3001;
const jwt = require('jsonwebtoken');
const secret = 'mysecretssshhhhhhh'; // TODO: move to .env
const expiration = '2h';
const app = express();
const schema = makeExecutableSchema({typeDefs,resolvers});
const httpServer = createServer(app);
const ps = new PubSub();

// //production redis url
// let redis_url = process.env.REDIS_URL;
// if (process.env.ENVIRONMENT === 'development') {  
//   require('dotenv').config();  
//   redis_url = "redis://127.0.0.1"; 
// }  
// //redis setup
// const client = require('redis').createClient(redis_url);
// const Redis = require('ioredis');
// const redis = new Redis(redis_url);


const server = new ApolloServer({
  schema,
  context: ({req, connection})=>{
    return connection?connection.context:{...authMiddleware({req}),ps}
  },
  // plugins: [{
  //   async serverWillStart(){
  //     return {
  //       async drainServer(){
  //         subscriptionServer.close();
  //       }
  //     }
  //   }
  // }],
  subscriptions: {
    onConnect: async (connectionParams,a,b) => {
      const token = connectionParams.authToken.split(' ').pop().trim();
      if(token){
        try {
          const { data } = jwt.verify(token, secret, { maxAge: expiration });
          
          const userData = await User.findOneAndUpdate({_id: data._id},{connection:"connected", status: "offline"});
          if(userData.connection!=="disconnected") return {...data,ps};
          if(userData.statusPreference==="offline") return {...data,ps};
          console.log(`${data.username} has connected`);
          const friends = await Friend.find({
              $and: [
                {$or: [{ requesting: data._id }, { receiving: data._id }]},
                {status: 1}
              ]
            },'receiving requesting')
            .populate('receiving')
            .populate('requesting');

          const filtered = friends.map(friend=>{
            return friend.requesting.username === data.username?
              friend.receiving.username:friend.requesting.username;
          });

          ps.publish('UPDATE_STATUS',{
            filtered,
            updateStatus: {
              _id: userData._id,
              status: "online",
              type: "connecting"
            }
          });

          return {...data,ps}
        } catch {
          //console.log('Invalid token');
          return false;
        }
      }
      return false;
    },
    onDisconnect(_,context){
      context.initPromise.then( async user=>{
        if(user){

          const reconnectingUser = await User.findOneAndUpdate({_id: user._id},{connection: "reconnecting"});

          setTimeout(async ()=>{

            const userData = await User.findOneAndUpdate({_id: user._id,connection: "reconnecting"},{connection:"disconnected"},{new:"true"});
            if(!userData) return;
            console.log(`${user.username} has disconnected`);
            const friends = await Friend.find({
                $and: [
                  {$or: [{ requesting: user._id }, { receiving: user._id }]},
                  {status: 1}
                ]
              },'receiving requesting')
              .populate('receiving')
              .populate('requesting');
  
            const filtered = friends.map(friend=>{
              return friend.requesting.username === user.username?
                friend.receiving.username:friend.requesting.username;
            });
            ps.publish('UPDATE_STATUS',{
              filtered,
              updateStatus: {
                _id: userData._id,
                status: "offline",
                type: "disconnecting"
              }
            });
          }, 3000)
        }
      })
    }
  }
})

server.applyMiddleware({app})
server.installSubscriptionHandlers(httpServer);

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
