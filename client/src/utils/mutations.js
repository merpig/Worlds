import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const ADD_USER = gql`
  mutation addUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
        email
      }
    }
  }
`;

export const ADD_FRIEND = gql`
  mutation addFriend($username: String!){
    addFriend(username: $username){
      _id
      requesting {
        _id
        username
      }
      receiving {
        _id
        username
      }
      status
    }
  }
`;

export const CONFIRM_FRIEND = gql`
  mutation confirmFriend($id: ID!){
    confirmFriend(id: $id){
      _id
      status
    }
  }
`;

export const CANCEL_FRIEND = gql`
  mutation cancelFriend($id: ID!){
    cancelFriend(id: $id){
      _id
    }
  }
`;

export const ADD_WORLD = gql`
  mutation addWorld($id: ID!, $worldname: String!, $privacySetting: String!, $visitSetting: String!){
    addWorld(id: $id, worldname: $worldname, privacySetting: $privacySetting, visitSetting: $visitSetting){
      _id
      worldname
      players {
        username
      }
      privacySetting
      visitSetting
      mainSection {
        _id
      }
      sections {
        _id
      }
    }
  }
`;

export const DELETE_WORLD = gql`
  mutation deleteWorld($id: ID!,$userId: ID!){
    deleteWorld(id: $id, userId: $userId){
      ok
    }
  }
`;

export const EDIT_WORLD =gql`
  mutation editWorld($id: ID!, $worldname: String!, $privacySetting: String!, $visitSetting: String!){
    editWorld(id: $id, worldname: $worldname, privacySetting: $privacySetting, visitSetting: $visitSetting){
      _id
      worldname
      privacySetting
      visitSetting
    }
  }
`;
