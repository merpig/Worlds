import { gql } from '@apollo/client';

export const FRIEND_ADDED = gql`
  subscription friendAdded($username: String!) {
    friendAdded(username: $username) {
      _id
      receiving {
          _id
          username
      }
      requesting {
          _id
          username
      }
      status
      messages {
        message
      }
    }
  }
`;