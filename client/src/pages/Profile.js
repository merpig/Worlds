// Node Modules
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
// Utilities
import { ADD_FRIEND, CONFIRM_FRIEND, CANCEL_FRIEND } from '../utils/mutations';
// Auth
import Auth from '../utils/auth';

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
    <div className="col-12 mb-3 mt-3">
      <div className="bg-light p-3" style={{borderRadius: ".25rem"}}>
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
        <button type='submit'>Add User</button>
        <button onClick={handleFormCancel}>Cancel</button>
      </form>
      </div>
    </div>
  )
}

const RenderAdded = ({friends,user}) => {
  const [cancelFriend] = useMutation(CANCEL_FRIEND);
  const added = friends.filter(friend=>friend.status===1);
  if(!added.length) return <h4 style={{textAlign:"center"}}>No friends added yet.</h4>


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

  return (
    <div className="row">
      {added.map(friend=>
      <div key={friend._id} className="col-12">
        <div style={{padding: "4px"}}>
          {user.username===friend.requesting.username?
            friend.receiving.username:
            friend.requesting.username}
          <div style={{float:"right"}}>
            <button>Message</button>
            <button onClick={()=>onCancel(friend._id)}>Remove</button>
          </div>
        </div>
        <hr></hr>
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
  if(!pending.length) return <h4 style={{textAlign:"center"}}>No pending requests.</h4>

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
        <div className="col-12" style={{textAlign:"center"}}>No incoming requests</div>:
          incoming.map((friend,i)=>
          <div key={friend._id} className="col-12">
            {i===0?<div style={{padding: "4px",textAlign:"center",width:"50%",margin:"auto"}}>Incoming Requests:</div>:[]}
            <div style={{padding: "4px"}}>
              {friend.requesting.username}
              <div style={{float: "right"}}>
                <button onClick={()=>onAccept(friend._id)}>Accept</button>
                <button onClick={()=>onCancel(friend._id)}>Decline</button>
              </div>
            </div>
            <hr></hr>
          </div>)
      }
      
      {!outgoing.length?
        <div className="col-12" style={{textAlign:"center",padding:"4px"}}>No outgoing requests</div>:
        outgoing.map((friend,i)=>
          <div key={friend._id} className="col-12">
            {i===0?<div style={{padding: "4px",textAlign:"center"}}><hr></hr>Outgoing Requests:</div>:[]}
            <div style={{padding: "4px"}}>
              {friend.receiving.username}
              <div style={{float: "right"}}>
                <button onClick={()=>onCancel(friend._id)}>Cancel</button>
              </div>
            </div>
            <hr></hr>
          </div>)
      }
    </div>
  )
}

const RenderBlocked = ({friends,user}) => {
  const blocked = friends.filter(friend=>friend.status===2);
  if(!blocked.length) return <h4 style={{textAlign:"center"}}>No blocked users.</h4>
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

const RenderFriendList = ({data,friends,friendsLoading}) => {
  const [showAddFriend,setShowAddFriend] = useState(false)
  const [status,setStatus] = useState(1);

  const renderList = [
    <RenderPending friends={friends} user={data.me}/>,
    <RenderAdded friends={friends} user={data.me}/>,
    <RenderBlocked friends={friends} user={data.me}/>
  ];
  return (
    <div className="col-md-4 col-sm-8" style={{border:"2px dotted black",padding: "0"}}>
      <h3 className="bg-dark text-light p-3 mb-0" style={{fontSize:"1rem"}}>
        Friends List:
        <button className="addFriend" onClick={()=>setShowAddFriend(!showAddFriend)} style={{fontSize: "1rem", float:"right"}}><i className="fa fa-plus"></i>Add</button>
      </h3>
      {showAddFriend?<AddFriend setShowAddFriend={setShowAddFriend}/>:[]}
      <div className="flex-row">
        <div className="col-4" style={{textAlign:"center",padding:"0"}}><button onClick={()=>status===1?{}:setStatus(1)} style={{width:"100%",height:"40px"}}>Friends</button></div>
        <div className="col-4" style={{textAlign:"center",padding:"0"}}><button onClick={()=>status===0?{}:setStatus(0)} style={{width:"100%",height:"40px"}}>Pending</button></div>
        <div className="col-4" style={{textAlign:"center",padding:"0"}}><button onClick={()=>status===2?{}:setStatus(2)} style={{width:"100%",height:"40px"}}>Blocked</button></div>
      </div>
      <div style={{minHeight: "100px"}}>

        {friendsLoading||friends===undefined? <h4>Loading...</h4>:renderList[status]}
      </div>

    </div>
  );
};

const Profile = ({loading,data,error,friends,friendsLoading}) => {
  // const { loading, data, error } = useQuery(QUERY_ME);
  if (error) console.log(error);
  
  if (loading) {
    return <h4>Loading...</h4>;
  }
  
  if (!Auth.loggedIn()) {
    return (
      <h4>
        You need to be logged in to see this. Use the navigation links above to
        sign up or log in!
      </h4>
    );
  }

  const renderCurrentUserInfo = () => {
    if (loading) return null;
    return (
      <ul>
        <li>username: {data.me.username}</li>
        <li>email: {data.me.email}</li>
      </ul>
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
        <h2 className="col-12 col-md-10 bg-dark text-light p-3 mb-5">
          Viewing your profile.
        </h2>
        {renderCurrentUserInfo()}
        {renderCharacterInfo()}
        <RenderFriendList data={data} friends={friends} friendsLoading={friendsLoading}/>
      </div>
    </div>
  );
};

export default Profile;
