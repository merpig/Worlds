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
`

export const FRIEND_UPDATED = gql`
  subscription friendUpdated($username: String!) {
    friendUpdated(username: $username) {
      receiving {
          username
      }
      requesting {
          username
      }
      status
    }
  }
`

export const FRIEND_CANCELED = gql`
  subscription friendCanceled($username: String!) {
    friendCanceled(username: $username) {
      receiving {
          username
      }
      requesting {
          username
      }
    }
  }
`;