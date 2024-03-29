import { useMutation } from '@apollo/client';
import React from 'react';
import { Link } from 'react-router-dom';

import Auth from '../../utils/auth';
import { STATUS_UPDATE } from '../../utils/mutations';

const Header = (props) => {
  const [statusUpdate] = useMutation(STATUS_UPDATE);

  const logout = async (event) => {
    event.preventDefault();
    // try {
    //   const {data} = await statusUpdate({
    //     variables: {
    //       status: "offline"
    //     }
    //   });
    //   console.log(data)
    // } catch(e){
    //   console.log(e);
    // }
    Auth.logout();
  };

  const renderControls = () => {
    // If logged in show logout controls
    if (Auth.loggedIn()) {
      return (
        <>
          <Link className="btn btn-lg btn-info m-2" to="/me">
            {Auth.getProfile().data.username}'s profile
          </Link>
          <button className="btn btn-lg btn-light m-2" onClick={logout}>
            Logout
          </button>
        </>
      );
    }
    // If logged out show login controls
    return (
      <>
        <Link className="btn btn-lg btn-info m-2" to="/login">
          Login
        </Link>
        <Link className="btn btn-lg btn-light m-2" to="/signup">
          Signup
        </Link>
      </>
    )
  };

  return (
    <header className="bg-dark text-light mb-4 py-3 flex-row align-center">
      <div className="container flex-row justify-space-between-lg justify-center align-center">
        <div>
          <Link className="text-light" to="/">
            <h1 className="m-0">Worlds</h1>
          </Link>
        </div>
        <div>
          <p className="m-0 text-center">A place to create and join worlds</p>
          {renderControls()}
        </div>
      </div>
    </header>
  );
};

export default Header;
