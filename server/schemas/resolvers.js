const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { User, World, Section, Placement, SectionNode, Character, Feature, Friend, Message } = require('../models');

const resolvers = {
  Query: {
    users: async () => {
      return User.find();
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
    addWorld: async (_, {id, worldname, privacySetting, visitSetting}) => {
      const preworld = await World.create({ownedBy: id, worldname, privacySetting, visitSetting});
      const sectionNode = await SectionNode.create({});
      const section = await Section.create({belongsTo: preworld._id, nodes: sectionNode._id});
      let world = await World.findOneAndUpdate({_id:preworld._id}, {mainSection: section._id});
      world = await World.findOne({_id:preworld._id})
      const user = await User.findOneAndUpdate({ _id: id },{$push: {worlds: world._id}});
      return world;
    }
  }
};

module.exports = resolvers;
