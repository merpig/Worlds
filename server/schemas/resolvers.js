const { AuthenticationError, ApolloError } = require('apollo-server-express');
const { PubSub } = require('graphql-subscriptions');
const { signToken } = require('../utils/auth');
const { User, World, Section, Placement, SectionNode, Character, Feature, Friend, Message } = require('../models');

const pubsub = new PubSub();

class AddFriendError extends ApolloError {
  constructor(message) {
    super(message, 'ADD_FRIEND_ERROR');

    Object.defineProperty(this, 'name', { value: 'AddFriendError' });
  }
}

const resolvers = {
  Query: {
    users: async () => {
      return User.find().populate('worlds');
    },
    friends: async (_, args, context) => {
      if (context.user) {
        const friends = await Friend.find({
          //$and: [
            $or: [{ requesting: context.user._id }, { receiving: context.user._id }],
          //  {status: 1}
          //]
        }).populate('receiving').populate('requesting');
        //console.log(friends)
        return friends;
      }
      throw new AuthenticationError('You need to be logged in!');    
    },
    // pendingFriends: async (_, args, context){
    //   if (context.user) {
    //     return Friend.find({
    //       $and: [
    //         {$or: [{ requesting: context.user_id }, { receiving: context.user_id }]},
    //         {status: 1}
    //       ]
    //     });
    //   }
    //   throw new AuthenticationError('You need to be logged in!');
    // },
    user: async (_, args) => {
      return User.findOne({ _id: args.id });
    },
    me: async (_, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('worlds');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },

  Mutation: {
    addUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    addFriend: async (_, { username }, context) => {
      if (context.user) {
        const user = await User.findOne({username});
        if(user) {
          const alreadyFriends = await Friend.findOne({
            $or: [
              {$and: [
                { requesting: context.user._id },{ receiving: user._id }
              ]},
              {$and: [
                { requesting: user._id },{ receiving: context.user._id }
              ]}
            ]
          });
          //console.log(alreadyFriends)
          if(!alreadyFriends){
            console.log("creating friends...")
            let friend = await Friend.create({
              requesting: context.user._id, 
              receiving: user._id, 
              status: 0
            })
            friend = await friend.populate('receiving').populate('requesting').execPopulate();
            console.log(friend)
            pubsub.publish('FRIEND_ADDED', { friendAdded: friend });
            return friend;
          }
          else if(alreadyFriends.status===0){
            throw new AddFriendError('Friend request already pending!');
          }
          else if(alreadyFriends.status===1){
            throw new AddFriendError('Already friends!');
          }
          else throw new AddFriendError('You have blocked this user.');
        }
        throw new AddFriendError('User not found!');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    confirmFriend: async (_, {id},context) => {
      if (context.user) {
        const friend = await Friend.findByIdAndUpdate({_id:id},{status:1},{new:true});
        pubsub.publish('FRIEND_UPDATED', {friend});
        return friend;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    cancelFriend: async (_, {id},context) => {
      if (context.user) {
        const friend = await Friend.deleteOne({_id:id});
        pubsub.publish('FRIEND_CANCELED', {friend});
        return friend;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    addWorld: async (_, {id, worldname, privacySetting, visitSetting}, context) => {
      const preworld = await World.create({ownedBy: id, worldname, privacySetting, visitSetting});
      const sectionNode = await SectionNode.create({});
      const section = await Section.create({belongsTo: preworld._id, nodes: sectionNode._id});
      const world = await World.findOneAndUpdate({_id:preworld._id}, {mainSection: section._id, $push: {sections: section._id}},{
        returnOriginal: false
      });
      const user = await User.findOneAndUpdate({ _id: id },{$push: {worlds: world._id}});
      return world;
    },
    deleteWorld: async (_, {id,userId}) => {
      const res = await World.deleteOne({_id:id});
      const user = await User.findOneAndUpdate({_id: userId},{ $pull : {worlds:id}});
      return res;
    },
    editWorld: async (_, {id, worldname, privacySetting, visitSetting}) => {
      let world = await World.findOneAndUpdate({_id:id}, {worldname, privacySetting, visitSetting},{
        returnOriginal: false
      });
      return world;
    }
  },

  Subscription : {
    friendAdded: {
      // resolve: (payload) => {
      //   console.log(payload)
      //   return {data: payload}
      // },
      subscribe: () => {
        console.log("friend added subscribed");
        return pubsub.asyncIterator('FRIEND_ADDED')
      },
    },
    friendUpdated: {
      subscribe: () => pubsub.asyncIterator(['FRIEND_UPDATED']),
    },
    friendCanceled: {
      subscribe: () => pubsub.asyncIterator(['FRIEND_CANCELED']),
    }
  }
};

module.exports = resolvers;
