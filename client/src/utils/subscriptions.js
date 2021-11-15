import { gql } from '@apollo/client';

export const FRIEND_ADDED = gql`
  subscription friendAdded{
    friendAdded{
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
  subscription friendUpdated{
    friendUpdated{
      receiving {
          username
          status
      }
      requesting {
          username
          status
      }
      status
    }
  }
`

export const FRIEND_CANCELED = gql`
  subscription friendCanceled{
    friendCanceled{
      receiving {
          username
      }
      requesting {
          username
      }
    }
  }
`;

export const MESSAGE_SENT = gql`
  subscription messageSent{
    messageSent{
      _id
      message {
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

export const LOGGED_IN = gql`
  subscription loggedIn{
    loggedIn{
      _id
      username
    }
  }
`;

export const LOGGED_OUT = gql`
  subscription loggedOut{
    loggedOut{
      _id
      username
    }
  }
`;