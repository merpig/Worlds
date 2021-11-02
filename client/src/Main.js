import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Beforeunload } from 'react-beforeunload';

import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Header from './components/Header';
import Footer from './components/Footer';
import Messages from './components/Messages';
import World from './pages/World';
import Users from './pages/Users';

import Auth from './utils/auth';

import { QUERY_ME, QUERY_FRIENDS } from './utils/queries';
import { LOGOUT_USER } from './utils/mutations';
import { FRIEND_ADDED, FRIEND_CANCELED, FRIEND_UPDATED, MESSAGE_SENT } from './utils/subscriptions';

const Main = () => {
    const { loading, data, error } = useQuery(QUERY_ME);
    const { loading: friendsLoading, data: friendsData} = useQuery(QUERY_FRIENDS);

    const [logout] = useMutation(LOGOUT_USER)

    const { loading: newFriendDataLoading, data: newFriendData} = useSubscription(FRIEND_ADDED);
    const { loading: friendUpdatedLoading, data: friendUpdatedData} = useSubscription(FRIEND_UPDATED);
    const { loading: friendCanceledLoading, data: friendCanceledData} = useSubscription(FRIEND_CANCELED);
    const { loading: messageLoading, data: messageData} = useSubscription(MESSAGE_SENT);

    const [friends,setFriends]=useState([]);
    const [worlds,setWorlds]=useState([]);
    const [messageFromProfile,setMessageFromProfile]=useState({});

    useEffect(()=>{
      // let tokenCheck = setTimeOut(()=>{
      //   if(!Auth.loggedIn()){
      //     if(data){

      //     }
      //   };
      // })
      // return {
      //   clearTimeout(tokenCheck);
      // }
    },[])

    useEffect(()=>{
        if(!loading&&data)
            setWorlds([...data.me.worlds]);
    },[loading,data]);

    useEffect(()=>{
        if(!friendsLoading&&friendsData)
            setFriends([...friendsData.friends]);
    },[friendsLoading,friendsData]);

    useEffect(()=>{
        if(!messageLoading&&messageData){
            setFriends(friends=>{
                let index = friends.findIndex(e=>e._id===messageData.messageSent._id);
                let updatedFriend = {...friends[index]};
                let messageIndex = updatedFriend.messages.length;
                for(let i = updatedFriend.messages.length-1; i>=0;i--){
                  if(updatedFriend.messages[i].message === messageData.messageSent.message.message &&
                    updatedFriend.messages[i].sender.username===messageData.messageSent.message.sender.username&&
                    updatedFriend.messages[i].status===0){
                      messageIndex = i;
                    }
                }
                updatedFriend.messages= [
                  ...updatedFriend.messages.slice(0,messageIndex),
                  messageData.messageSent.message,
                  ...updatedFriend.messages.slice(messageIndex+1)
                ];
                return [
                ...friends.slice(0,index),
                updatedFriend,
                ...friends.slice(index+1)
                ]
            });
        }
    },[messageLoading,messageData]);

    useEffect(()=>{
        if(!newFriendDataLoading&&newFriendData){
        setFriends(friends=>[...friends,newFriendData.friendAdded]);
        } 
    },[newFriendData, newFriendDataLoading]);

    useEffect(()=>{ 
        if(!friendUpdatedLoading&&friendUpdatedData){
        setFriends(friends=>{
            let {friendUpdated} = friendUpdatedData;
            let index = friends.findIndex(friend=>
            friend.requesting.username===friendUpdated.requesting.username&&
            friend.receiving.username===friendUpdated.receiving.username
            )
            let updatedFriend = {...friends[index]};
            updatedFriend.status = friendUpdated.status
            return [
            ...friends.slice(0,index),
            updatedFriend,
            ...friends.slice(index+1)
            ]
        });
        }
    },[friendUpdatedData, friendUpdatedLoading]);

    useEffect(()=>{ 
        if(!friendCanceledLoading&&friendCanceledData){
        setFriends(friends=>{
            let {friendCanceled} = friendCanceledData;
            let index = friends.findIndex(friend=>
            friend.requesting.username===friendCanceled.requesting.username&&
            friend.receiving.username===friendCanceled.receiving.username
            )
            return [
            ...friends.slice(0,index),
            ...friends.slice(index+1)
            ]
        });
        }
    },[friendCanceledData, friendCanceledLoading]);

    const beforeUnload = () => {
      logout();
    }

    return(<Beforeunload onBeforeunload={beforeUnload}>
      <Router>
        <div className="flex-column justify-flex-start min-100-vh">
          <Header />
          <div className="container">
            <Route exact path="/">
              <Home 
                loading={loading}
                data={data}
                worlds={worlds}
                setWorlds={setWorlds}
              />
            </Route>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/signup">
              <Signup />
            </Route>
            <Route exact path="/me">
              <Profile 
                loading={loading} 
                data={data} 
                error={error} 
                friends={friends} 
                friendsLoading={friendsLoading}
                setFromProfile={setMessageFromProfile}
                />
            </Route>
            <Route exact path="/users/:id">
              <Users />
            </Route>
            <Route exact path="/users">
              <Users />
            </Route>
            <Route exact path="/world/:id">
              <World />
            </Route>
          </div>
          {Auth.loggedIn()?<Messages friends={friends} data={data} fromProfile={messageFromProfile} setFriends={setFriends}/>:[]}
          <Footer />
        </div>
    </Router></Beforeunload>);
}

export default Main;