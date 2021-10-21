const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const { createServer } = require('http');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const db = require('./config/connection');
const PORT = process.env.PORT || 3001;
const app = express();
const {User} = require('./models')
const jwt = require('jsonwebtoken');

const secret = 'mysecretssshhhhhhh'; // TODO: move to .env
const expiration = '2h';

// const userPromise = new Promise((resolve, reject) => {
//   if (connectionParams.jwt) {
//     jsonwebtoken.verify(
//       connectionParams.jwt,
//       JWT_SECRET,
//       (err, decoded) => {
//         if (err) {
//           reject(new Error('Invalid Token'))
//         }

//         resolve(
//           User.findOne({
//             where: { id: decoded.id }
//           })
//         )
//       }
//     )
//   } else {
//     reject(new Error('No Token'))
//   }
// })

const validateToken = (authToken) => {
  // ... validate token and return a Promise, rejects in case of an error
  return new Promise((resolve,reject)=>{
    if (authToken) {
      let token = authToken.split(' ').pop().trim();
      if(!token) reject(new Error('No Token'))

      jwt.verify(token, secret, { maxAge: expiration },
        (err,decoded)=>{
          if (err) {
            reject(new Error('Invalid Token'))
          }
  
          resolve(decoded);
        })
    }
      //     jsonwebtoken.verify(
      //       connectionParams.jwt,
      //       JWT_SECRET,
      //       (err, decoded) => {
      //         if (err) {
      //           reject(new Error('Invalid Token'))
      //         }
      
      //         resolve(
      //           User.findOne({
      //             where: { id: decoded.id }
      //           })
      //         )
      //       }
      //     )
      //   } else {
      //     reject(new Error('No Token'))
      //   }
  });
} 

const findUser = async ({data}) => {
  return new Promise((resolve,reject)=>{
    if(data){
      resolve(
        User.findById({_id:data._id})
      )
    } else {
      reject(new Error('No User Id'));
    }
  })
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  subscriptions: {
    onConnect: ({authToken}, webSocket, context) => {
      // validateToken(authToken)
      //   .then(findUser)
      //   .then((user)=>{
      //     //console.log(user)
      //     return user;
      //   })
      //   .catch(err=>{
      //     console.log(err)
      //   });
      console.log('Client connected')
    },
    onDisconnect: (webSocket, context) => {
      //console.log(webSocket);
      console.log('Client disconnected')
    },
    // keepAlive: 30000
  },
  
});

server.applyMiddleware({ app });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

db.once('open', () => {
  httpServer.listen({port:PORT}, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.subscriptionsPath}`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
