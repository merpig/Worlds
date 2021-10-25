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
        _id
        worldname
        privacySetting
        visitSetting
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

export const QUERY_FRIENDS = gql`
query friends {
  friends {
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
    messages {
      _id
      sender {
        username
      }
      message
      status
      createdAt
    }
  }
}
`;