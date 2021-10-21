import { gql } from '@apollo/client';

export const FRIEND_ADDED = gql`
  subscription friendAdded {
    friendAdded {
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