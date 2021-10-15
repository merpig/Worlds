import { gql } from '@apollo/client';

export const QUERY_USERS = gql`
  query users {
    users {
      _id
      username
    }
  }
`;

export const QUERY_USER = gql`
  query user($id: ID!) {
    user(id: $id) {
      _id
      username
    }
  }
`;

export const QUERY_ME = gql`
  query me {
    me {
      _id
      username
      email
      character {
        characterType
        hasHair
        hairColor
        shirtColor
        skinColor
        pantsColor
        shoeColor
      }
      worlds {
        name
        privacySetting
        canVisitOffline
        mainSection {
          _id
        }
        players {
          username
        }
      }
    }
  }
`;
