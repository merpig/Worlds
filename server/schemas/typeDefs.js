const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email: String
    password: String
    character: Character
    currentLocation: Placement
    worlds: [World]
    locations: [Placement]
    status: String
    statusPreference: String
  }


  type Character {
    _id: ID
    characterType: String
    hasHair: Boolean
    hairColor: String
    shirtColor: String
    skinColor: String
    pantsColor: String
    shoeColor: String
  }

  type Placement {
    _id: ID
    world: World
    section: Section
    x: Int
    y: Int
  }

  type World {
    _id: ID
    worldname: String
    ownedBy: User
    privacySetting: String
    visitSetting: String
    mainSection: Section
    sections: [Section]
    players: [User]
  }

  type Section {
    _id: ID
    belongsTo: World
    features: [Feature]
    players: [User]
    nodes: SectionNode
  }

  type Feature {
    _id: ID
    name: String
    blocking: Boolean
    x: Int
    y: Int
  }

  type SectionNode {
    _id: ID
    north: Section
    east: Section
    south: Section
    west: Section
  }

  type Message {
    _id: ID
    sender: User
    message: String
    status: Int
    createdAt: String
  }

  type newMessage {
    _id: ID
    message: Message
  }

  type Friend {
    _id: ID
    requesting: User
    receiving: User
    status: Int
    messages: [Message]
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    users: [User]
    friends: [Friend]
    user(id: ID!): User
    me: User
  }

  type DeleteWorldResponse {
    ok: Boolean!
  }

  type LogoutResponse {
    ok: Boolean!
  }

  type StatusResponse {
    ok: Boolean!
  }

  type Status {
    _id: ID!
    status: String!
    type: String
  }

  type Subscription {
    messageSent: newMessage
    friendAdded: Friend
    friendUpdated: Friend
    friendCanceled: Friend
    loggedIn: User
    loggedOut: User
    newMessage: Boolean
    updateLocation: Placement
    updateStatus: Status
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth

    addFriend(username: String!): Friend
    confirmFriend(id: ID!): Friend
    cancelFriend(id: ID!): Friend

    sendMessage(id: ID!,message: String!): newMessage

    login(email: String!, password: String!): Auth
    logout: LogoutResponse
    statusUpdate(status: String!, type: String, statusPreference: String): StatusResponse

    addWorld(id: ID!, worldname: String!, privacySetting: String!, visitSetting: String!): World
    editWorld(id: ID!, worldname: String!, privacySetting: String!, visitSetting: String!): World
    deleteWorld(id: ID!, userId: ID!): DeleteWorldResponse
    enterWorld(id: ID!): World

    createPosition: Placement
  }
`;

module.exports = typeDefs;
