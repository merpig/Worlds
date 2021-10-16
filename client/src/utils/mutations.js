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

export const ADD_WORLD = gql`
  mutation addWorld($id: ID!, $worldname: String!, $privacySetting: String!, $visitSetting: String!){
    addWorld(id: $id, worldname: $worldname, privacySetting: $privacySetting, visitSetting: $visitSetting){
      _id
      worldname
      privacySetting
      visitSetting
      mainSection {
        _id
      }
    }
  }
`;
