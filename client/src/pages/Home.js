// Node Modules
import React from 'react';
// Utilities
import Auth from '../utils/auth';
// Components
import WorldList from '../components/WorldList';

const Home = ({worlds,setWorlds,loading,data}) => {
  const renderUserList = () => {
    if (loading) {
      return <h2>Loading...</h2>
    } 
    else if(!data){
      return;
    }
    else {
      return <WorldList worlds={worlds} setWorlds={setWorlds} title="List of Worlds" />
    } 
  }

  const renderUsername = () => {
    if (!Auth.loggedIn()) return 'Please login or signup'; 
    return Auth.getProfile().data.username;
  }

  return ( 
    <main>
      <div className="flex-row justify-center">
        <div
          className="col-12 col-md-10 mb-3 p-3"
          style={{ border: '1px dotted #1a1a1a' }}
        >
          {renderUsername()}
        </div>
        <div className="col-12 col-md-8 mb-3">
          {renderUserList()}
        </div>
      </div>
    </main>
  );
};

export default Home;
