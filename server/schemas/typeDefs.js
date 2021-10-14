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
  }

  type Character {
    _id: ID
    characterType: String
    hasHair: Boolean
    hairColor: String
    skinColor: String
    pantsColor: String
    shoeColor: String
  }

  type Placement {
    world: World
    section: Section
    x: Int
    y: Int
  }

  type World {
    _id: ID
    name: String
    ownedBy: User
    privacySetting: Int
    canVisitOffline: Boolean
    mainSection: Section
    players: [User]
  }

  type Section {
    belongsTo: World
    features: [Feature]
    players: [User]
    nodes: SectionNode
  }

  type Feature {
    name: String
    blocking: Boolean
    x: Int
    y: Int
  }

  type SectionNode {
    north: Section
    east: Section
    south: Section
    west: Section
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    users: [User]
    user(id: ID!): User
    me: User
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
  }
`;

module.exports = typeDefs;
