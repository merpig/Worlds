// Node Modules
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
// Utilities
import { ADD_FRIEND, CONFIRM_FRIEND, CANCEL_FRIEND } from '../utils/mutations';
// Auth
import Auth from '../utils/auth';
// CSS
import "./Profile.css"

const AddFriend = ({setShowAddFriend}) => {
  const [username,setUsername] = useState('');
  const [addFriend] = useMutation(ADD_FRIEND);
  const [requestStatus,setRequestStatus] = useState({
    success: false,
    message: ''
  })

  const handleChange = (event) => {
    setUsername(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      const {data} = await addFriend({
        variables: {username}
      });
      setRequestStatus({
        success: true,
        message: `Added ${data.addFriend.receiving.username}!`
      })
    } catch (e) {
      setRequestStatus({
        success: false,
        message: e.message
      })
    }
  }

  const handleFormCancel = (event) => {
    event.preventDefault();
    setUsername('');
    setShowAddFriend(false);
  }

  return (
    <div className="col-12 mb-3 mt-3 px-0">
      <div className="add-friend p-3">
      {requestStatus.message.length?
      <p style={{color: requestStatus.success?'green':'red'}}>{requestStatus.message}</p>
      :[]}
      <form onSubmit={handleFormSubmit}>
        <input
          className="form-input"
          placeholder="username"
          type="text"
          name="username"
          value={username}
          onChange={handleChange}
        />
        <button className="btn confirm-btn" type='submit'>Add</button>
        <button className="btn cancel-btn" onClick={handleFormCancel}>Cancel</button>
      </form>
      </div>
    </div>
  )
}

const RenderAdded = ({friends,user,setFromProfile}) => {
  const [cancelFriend] = useMutation(CANCEL_FRIEND);
  const added = friends.filter(friend=>friend.status===1);
  if(!added.length) return <h4 className="text-light text-center">No friends added yet.</h4>


  const onCancel = async id => {
    try{
      //const {data} =
      await cancelFriend({
        variables: {id}
      });
    } catch(e){
      console.log(e.message)
    }
  }

  const onMessage = (id,friend) => {
    setFromProfile({
      showFriend:false,
      id: id,
      friend : user.username===friend.requesting.username?friend.receiving.username:friend.requesting.username,
      show:true
    })
  }

  return (
    <div className="row">
      {added.map(friend=>
      <div key={friend._id} className="col-12">
        <div className="p-2 friend-row">
          {user.username===friend.requesting.username?
            <h6 className="text-dark"><div className={`status-circle ${friend.receiving.status==="online"?"online":"offline"}`}></div>{friend.receiving.username}</h6>:
            <h6 className="text-dark"><div className={`status-circle ${friend.requesting.status==="online"?"online":"offline"}`}></div>{friend.requesting.username}</h6>}
          <div >
            <Link to={`/users/${friend._id}`}>
              <button className="btn go-btn"><i className="fa fa-user"></i></button>
            </Link>
            <button className="btn go-btn" onClick={()=>onMessage(friend._id,friend)}><i className="fa fa-envelope"></i></button>
            <button className="btn cancel-btn" onClick={()=>onCancel(friend._id)}><i className="fa fa-trash"></i></button>
          </div>
        </div>
      </div>)}  
    </div>
  )
}

const RenderPending = ({friends,user}) => {
  const [confirmFriend] = useMutation(CONFIRM_FRIEND);
  const [cancelFriend] = useMutation(CANCEL_FRIEND);
  const pending = friends.filter(friend=>friend.status===0);
  const incoming = pending.filter(friend=>user.username===friend.receiving.username);
  const outgoing = pending.filter(friend=>user.username===friend.requesting.username);
  if(!pending.length) return <h4 className="text-light text-center">No pending requests.</h4>

  const onAccept = async id => {
    try {
      //const {data} = 
      await confirmFriend({
        variables: {id}
      });
    } catch (e){
      console.log(e.message)
    }
  }

  const onCancel = async id => {
    try{
      //const {data} = 
      await cancelFriend({
        variables: {id}
      });
    } catch (e){
      console.log(e.message)
    }
  }

  return (
    <div className="row">
      
      {!incoming.length?
        <div className="col-12 text-light text-center">No incoming requests</div>:
          incoming.map((friend,i)=>
          <div key={friend._id} className="col-12">
            {i===0?<div className="col-12 text-light text-center">Incoming Requests:</div>:[]}
            <div className="p-2 pending-request mt-1">
              {friend.requesting.username}
              <div style={{float: "right"}}>
                <button className="btn confirm-btn" onClick={()=>onAccept(friend._id)}>Add</button>
                <button className="btn cancel-btn" onClick={()=>onCancel(friend._id)}>Decline</button>
              </div>
            </div>
            <hr></hr>
          </div>)
      }
      
      {!outgoing.length?
        <div className="col-12 text-light text-center">No outgoing requests</div>:
        outgoing.map((friend,i)=>
          <div key={friend._id} className="col-12">
            {i===0?<div className="col-12 text-light text-center"><hr></hr>Outgoing Requests:</div>:[]}
            <div className="p-2 pending-request mt-1">
              {friend.receiving.username}
              <button className="btn cancel-btn" onClick={()=>onCancel(friend._id)}>Cancel</button>
            </div>
            <hr></hr>
          </div>)
      }
    </div>
  )
}

const RenderBlocked = ({friends,user}) => {
  const blocked = friends.filter(friend=>friend.status===2);
  if(!blocked.length) return <h4 className="text-center text-light">No blocked users.</h4>
  return (
    <div className="row">
      {blocked.map(friend=><div className="col-12">
        {user.username===friend.requesting.username?
          friend.receiving.username:
          friend.requesting.username}
      </div>)}
    </div>
  )
}

const RenderFriendList = ({data,friends,friendsLoading,setFromProfile}) => {
  const [showAddFriend,setShowAddFriend] = useState(false)
  const [status,setStatus] = useState(1);

  const renderList = [
    <RenderPending friends={friends} user={data.me}/>,
    <RenderAdded friends={friends} user={data.me} setFromProfile={setFromProfile}/>,
    <RenderBlocked friends={friends} user={data.me}/>
  ];
  return (
    <div className="col-md-6 friends-list bg-dark pb-3">
      <h4 className="text-light py-2">
        Friends:
        <button className="btn confirm-btn" onClick={()=>setShowAddFriend(!showAddFriend)} style={{fontSize: "1rem", float:"right"}}><i className="fa fa-plus"></i></button>
      </h4>
      {showAddFriend?<AddFriend setShowAddFriend={setShowAddFriend}/>:[]}
      <div className="flex-row tab-container mb-1">
        <div className="col-4 p-0">
          <button className={`btn tab-btn text-center p-1 ${status===1?`tab-active`:``}`} onClick={()=>status===1?{}:setStatus(1)} style={{width:"100%",height:"40px"}}><strong>Friends</strong></button>
        </div>
        <div className="col-4 p-0">
          <button className={`btn tab-btn text-center p-1 ${status===0?`tab-active`:``}`} onClick={()=>status===0?{}:setStatus(0)} style={{width:"100%",height:"40px"}}>Pending</button>
        </div>
        <div className="col-4 p-0">
          <button className={`btn tab-btn text-center p-1 ${status===2?`tab-active`:``}`} onClick={()=>status===2?{}:setStatus(2)} style={{width:"100%",height:"40px"}}>Blocked</button>
        </div>
      </div>
      <div style={{minHeight: "100px"}}>

        {friendsLoading||friends===undefined? <h4>Loading...</h4>:renderList[status]}
      </div>

    </div>
  );
};

const Profile = ({loading,data,error,friends,friendsLoading,setFromProfile}) => {
  // const { loading, data, error } = useQuery(QUERY_ME);
  if (error) console.log(error);
  
  if (loading) {
    return <h4>Loading...</h4>;
  }
  
  if (!Auth.loggedIn()) {
    return (
      <h4 className="bg-dark text-light">
        You need to be logged in to see this. Use the navigation links above to
        sign up or log in!
      </h4>
    );
  }

  const renderCurrentUserInfo = () => {
    if (loading) return null;
    return (
      <div className="col-12 bg-dark text-light profile-info mb-3">
        <div className="row my-2">
          <div className="col-sm-6">
            <img alt="character image" height="400px"></img>
          </div>
          <div className="col-sm-6">
            <h3 className="text-center">User Info</h3>
            <ul className="list-group">
              <li className="list-group-item">username: {data.me.username}</li>
              <li className="list-group-item">email: {data.me.email}</li>
              <li className="list-group-item last">worlds: {data.me.worlds.length}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const renderCharacterInfo = () => {
    if (loading) return null;
    if(!data.me.character){
      return (
        <ul>
          {/* <li>username: {user.username}</li> */}
        </ul>
      );
    }
  }

  return (
    <div>
      <div className="flex-row justify-center mb-3">
        <h2 className="col-12 bg-dark text-center text-light p-3 mb-5 profile-header">
          Viewing your profile.
        </h2>
        {renderCurrentUserInfo()}
        {/* {renderCharacterInfo()} */}
        <div className="col-md-6">

        </div>
        <RenderFriendList data={data} friends={friends} friendsLoading={friendsLoading} setFromProfile={setFromProfile}/>
      </div>
    </div>
  );
};

export default Profile;
