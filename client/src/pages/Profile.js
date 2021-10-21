// Node Modules
import React, {useState,useEffect} from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
// Utilities
import { QUERY_FRIENDS, QUERY_ME } from '../utils/queries';
import { ADD_FRIEND, CONFIRM_FRIEND, CANCEL_FRIEND } from '../utils/mutations';
import { FRIEND_ADDED } from "../utils/subscriptions";
// Auth
import Auth from '../utils/auth';

const AddFriend = ({setShowAddFriend}) => {
  const [username,setUsername] = useState('');
  const [addFriend] = useMutation(ADD_FRIEND);

  const handleChange = (event) => {
    setUsername(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    console.log('Adding friend: ', username);
    event.preventDefault();
    try {
      const {data} = await addFriend({
        variables: {username}
      });
      console.log(data)
    } catch (e) {
      console.log(e)
    }
  }

  const handleFormCancel = (event) => {
    event.preventDefault();
    setUsername('');
    setShowAddFriend(false);
  }

  return (
    <div className="col-12 mb-5">
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
  )
}

const RenderAdded = ({friends,user}) => {
  const [cancelFriend] = useMutation(CANCEL_FRIEND);
  const added = friends.filter(friend=>friend.status===1);
  if(!added.length) return <h4>No friends added yet.</h4>


  const onCancel = async id => {
    const {data} = await cancelFriend({
      variables: {id}
    });
    console.log(data);
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
  console.log(friends);
  const [confirmFriend] = useMutation(CONFIRM_FRIEND);
  const [cancelFriend] = useMutation(CANCEL_FRIEND);
  const pending = friends.filter(friend=>friend.status===0);
  const incoming = pending.filter(friend=>user.username===friend.receiving.username);
  const outgoing = pending.filter(friend=>user.username===friend.requesting.username);
  console.log(pending);
  if(!pending.length) return <h4>No pending requests.</h4>

  const onAccept = async id => {
    const {data} = await confirmFriend({
      variables: {id}
    });
    console.log(data);
  }

  const onCancel = async id => {
    const {data} = await cancelFriend({
      variables: {id}
    });
    console.log(data);
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
  if(!blocked.length) return <h4>No blocked users.</h4>
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

const RenderFriendList = ({data}) => {
  const { loading: friendsLoading, data: friendsData, error: friendsErr} = useQuery(QUERY_FRIENDS);
  let { loading: newFriendDataLoading, data: newFriendData} = useSubscription(FRIEND_ADDED);

  const [showAddFriend,setShowAddFriend] = useState(false)
  const [status,setStatus] = useState(1);
  const [friends,setFriends]=useState([]);

  useEffect(()=>{
    if(!friendsLoading&&!friends.length)
      setFriends([...friendsData.friends]);
  },[friendsLoading,friendsData])

  useEffect(()=>{
    if(!newFriendDataLoading){
      console.log(newFriendData);
      setFriends(friends=>[...friends,newFriendData.friendAdded]);
    }
  },[newFriendData, newFriendDataLoading])

  const renderList = [
    <RenderPending friends={friends} user={data.me}/>,
    <RenderAdded friends={friends} user={data.me}/>,
    <RenderBlocked friends={friends} user={data.me}/>
  ];
  return (
    <div style={{border:"2px dotted black"}}>
      <h3 className="col-12 bg-dark text-light p-3 mb-5" style={{fontSize:"1rem"}}>
        Friends List:
        <button className="addFriend" onClick={()=>setShowAddFriend(!showAddFriend)} style={{fontSize: "1rem", float:"right"}}><i className="fa fa-plus"></i>Add</button>
      </h3>
      {showAddFriend?<AddFriend setShowAddFriend={setShowAddFriend}/>:[]}
      <div className="row" style={{padding:"4px"}}>
        <div className="col-4" style={{textAlign:"center"}}><button onClick={()=>setStatus(1)}>Friends</button></div>
        <div className="col-4" style={{textAlign:"center"}}><button onClick={()=>setStatus(0)}>Pending</button></div>
        <div className="col-4" style={{textAlign:"center"}}><button onClick={()=>setStatus(2)}>Blocked</button></div>
      </div>
      <hr></hr>
      {friendsLoading? <h4>Loading...</h4>:renderList[status]}

    </div>
  );
};

const Profile = () => {
  const { loading, data, error } = useQuery(QUERY_ME);
  

  
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
    console.log(data);
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
        <RenderFriendList data={data}/>
      </div>
    </div>
  );
};

export default Profile;
