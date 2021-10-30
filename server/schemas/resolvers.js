const { AuthenticationError, ApolloError } = require('apollo-server-express');
const { PubSub, withFilter } = require('graphql-subscriptions');
const { signToken } = require('../utils/auth');
const { User, World, Section, Placement, SectionNode, Character, Feature, Friend, Message } = require('../models');

const pubsub = new PubSub();

class FriendError extends ApolloError {
  constructor(message) {
    super(message, 'ADD_FRIEND_ERROR');

    Object.defineProperty(this, 'name', { value: 'FriendError' });
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
        }).populate('receiving').populate('requesting').populate({
          path: 'messages',
          model: 'Message',
          populate: {
            path: 'sender',
            model: 'User'
          }
        });
        //console.log(context.user)
        return friends;
      }
      throw new AuthenticationError('You need to be logged in!');    
    },
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
        if (context.user.username===username) {
          throw new FriendError('You cannot add yourself!');
        }
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
          if(!alreadyFriends){
            let friend = await Friend.create({
              requesting: context.user._id, 
              receiving: user._id, 
              status: 0
            })
            friend = await friend.populate('receiving').populate('requesting').execPopulate();
            pubsub.publish('FRIEND_ADDED', { friendAdded: friend});
            return friend;
          }
          else if(alreadyFriends.status===0){
            throw new FriendError('Friend request already pending!');
          }
          else if(alreadyFriends.status===1){
            throw new FriendError('Already friends!');
          }
          else throw new FriendError('You have blocked this user.');
        }
        throw new FriendError('User not found!');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    confirmFriend: async (_, {id},context) => {
      if (context.user) {
        let friend = await Friend.findByIdAndUpdate({_id:id},{status:1},{new:true});
        friend = await friend.populate('receiving').populate('requesting').execPopulate();
        pubsub.publish('FRIEND_UPDATED', {friendUpdated: friend});
        return friend;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    cancelFriend: async (_, {id},context) => {
      if (context.user) {
        let friend = await Friend.findOneAndDelete({_id:id});
        if(!friend) throw new FriendError('Friend already removed.');
        friend = await friend.populate('receiving').populate('requesting').execPopulate();
        friend.messages.forEach( async message=>{
          await Message.findByIdAndDelete({_id:message._id})
        });
        pubsub.publish('FRIEND_CANCELED', {friendCanceled: friend});
        return friend;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    login: async (_, { email, password }) => {
      let user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      user = await User.findOneAndUpdate({email},{status:"online"})

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
    },
    sendMessage: async(_,{id,message},context) => {
      if (context.user) {
        let friend = await Friend.findById({_id:id});
        if(friend && friend.status===1){
          let newMessage = await Message.create({sender:context.user._id,message,status:1});
          newMessage = await newMessage.populate('sender').execPopulate();
          friend = await Friend.findByIdAndUpdate({_id:id},{$push: {messages: newMessage._id}},{new:true});
          friend = await friend.populate('receiving').populate('requesting').execPopulate();
          
          pubsub.publish('MESSAGE_SENT',{
            messageSent: {
              _id: id,
              message: newMessage
            },
            requesting: friend.requesting.username,
            receiving: friend.receiving.username
          })
          
          return {
            _id: id,
            message: newMessage
          }
        }
        throw new FriendError('You must be friends to message this user.');
      }
      throw new AuthenticationError('You need to be logged in!');
    }
  },

  Subscription : {
    friendAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('FRIEND_ADDED'),
        ({friendAdded},_,context) => {
          console.log(
            friendAdded.receiving.username===context.username ||
            friendAdded.requesting.username===context.username
          )
          return (
            friendAdded.receiving.username===context.username ||
            friendAdded.requesting.username===context.username
          );
        }
      ),
    },
    friendUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('FRIEND_UPDATED'),
        ({friendUpdated},_,context) => {
          return (
            friendUpdated.receiving.username===context.username ||
            friendUpdated.requesting.username===context.username
          );
        }
      ),
    },
    friendCanceled: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('FRIEND_CANCELED'),
        ({friendCanceled},_,context) => {
          return (
            friendCanceled.receiving.username===context.username ||
            friendCanceled.requesting.username===context.username
          );
        }
      ),
    },
    messageSent: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('MESSAGE_SENT'),
        ({requesting, receiving},_,context) => {
          return (
            receiving===context.username ||
            requesting===context.username
          );
        }
      )
    },
    loggedIn: {
      subscribe: withFilter(
        ()=> pubsub.asyncIterator('LOGGED_IN'),
        ({filtered},_,context)=> {
          console.log('yoyo')
          return filtered.includes(context.username)
        }
      )
    },
    loggedOut: {
      subscribe: withFilter(
        ()=> pubsub.asyncIterator('LOGGED_OUT'),
        ({filtered},_,context)=> {
          console.log('logged out subscription works');
          return filtered.includes(context.username)
        }
      )
    }
  }
};

module.exports = resolvers;
