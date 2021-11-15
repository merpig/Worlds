import React, { useState, useEffect } from 'react';

import { SEND_MESSAGE } from '../../utils/mutations';
import { useMutation } from '@apollo/client';

import './index.css'

const MessagesButton = ({setShowMessages}) => {
    return(
        <div className="message-button circle" onClick={()=>setShowMessages(true)}>
            💬
        </div>
    )
}

const FriendsWithMessage = ({setShowMessages,setShowFriends,friends,data,setFriend,setId}) => {
    const [input,setInput] = useState('')
    const friendsWithMessages = friends.filter(friend=>friend.messages.length);
    //console.log(friendsWithMessages)
    const inputChange = (e) => {
        setInput(e.target.value);
    }
    
    const handleFriendClick = ({friend,id}) => {
        setFriend(friend);
        setId(id);
        setShowFriends(false);
    }

    const convertTime = epoch => {
        let d = new Date(parseInt(epoch)).toLocaleString().replace(',','').split(' ');
        let today = new Date().toLocaleString().replace(',','').split(' ');;
        if(d[0]===today[0]){
            let [hour,minute] = d[1].split(":");
            return `${hour}:${minute} ${d[2]}`
        }
        return d[0]
    }

    return (
        <div>
            <div className="message-header p-3">
                <div className="new-message circle-mid" onClick={()=>setShowFriends(false)}>✉</div>
                <h3>Messages</h3>
                <div className="message-close alt-circle" onClick={()=>setShowMessages(false)}>✖</div>
            </div>
            <div className="row">
                <div className="col-12">
                    <form className="message-search">
                        <input className="form-input" onChange={e=>inputChange(e)} value={input} placeholder="Search"></input>
                    </form>
                </div>
            </div>
            <div className="row friends-with-messages">
                {friendsWithMessages.length?
                    friendsWithMessages
                        .filter(friend=>{
                            return (friend.receiving.username.includes(input)&&friend.receiving.username!==data.me.username)||
                            (friend.requesting.username.includes(input)&&friend.requesting.username!==data.me.username)}
                        )
                        .map(f=>({
                            username: f.receiving.username===data.me.username?f.requesting.username:f.receiving.username,
                            status:f.receiving.username===data.me.username?f.requesting.status:f.receiving.status,
                            id: f._id,
                            messages: f.messages,
                            lastSent: f.messages[f.messages.length-1].createdAt
                        }))
                        .sort((a,b)=>b.lastSent-a.lastSent)
                        .map(f=><div key={f.id} className="col-12">
                            <div className="message-friend" onClick={()=>{handleFriendClick({friend:f.username,id:f.id})}}>
                                <h6><div className={`status-circle ${f.status==="online"?"online":"offline"}`}></div>{f.username}</h6>
                                <p className="mb-0 last-message">{f.messages[f.messages.length-1].message}</p>
                                <div className="last-message-time">{convertTime(f.messages[f.messages.length-1].createdAt)}
                                    
                                </div>
                            </div>
                        </div>):
                    <div className="no-messages">No messages</div>}
            </div>
        </div>
    )
}

const MessagesWithFriend = ({setShowMessages,setShowFriends,friend,setFriend,friends,data,_id,fromProfile,setFriends}) => {
    const [sendMessage] = useMutation(SEND_MESSAGE)
    const [title,setTitle] = useState(friend.length?friend:'New Message');
    const [search,setSearch] = useState('');
    const [message,setMessage] = useState('');
    const [showSearch,setShowSearch] = useState(friend.length?false:true);
    const [friendId,setFriendId] = useState(_id?_id:'');
    const [errorMsg,setErrorMsg] = useState('')
    const [newMsg,setNewMsg]=useState(null);

    useEffect(()=>{
        if(fromProfile.show){
            setTitle(fromProfile.friend);
            setFriendId(fromProfile.id);
        }
    },[fromProfile])

    const [filteredFriend] = friends.filter(f=>{
        return f.requesting.username===title||f.receiving.username===title
    })

    let messages = title==='New Message'?[]:[...filteredFriend?.messages||[]].reverse();
    if(title!=='New Message'&&!filteredFriend) {
        return <>{setShowFriends(true)}</>;
    }

    const handleFriendClick = ({id,username}) => {
        setTitle(username);
        setFriendId(id);
        setShowSearch(false);
    }

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if(!message.length) return;
        let index = friends.findIndex(f=>f._id===friendId);
        let updatedFriend = {...friends[index]}
        updatedFriend.messages = [
            ...updatedFriend.messages,
            {
                message,
                sender: {
                    username: data.me.username
                },
                status: 0,
                _id: updatedFriend.messages.length
            }
        ];
        setFriends([
            ...friends.slice(0,index),
            updatedFriend,
            ...friends.slice(index+1)
        ]);
        try {
            await sendMessage({
                variables: {id: friendId,message}
            });
            setMessage('');
        } catch(e){
            console.log(e.message)
            setErrorMsg(e.message);
        }
    }

    return (
        <div>
            <div className="message-header p-3">
                <div className="new-message circle-mid" onClick={()=>{setShowFriends(true);setFriend('');}}>←</div>
                <h3 className="ml-3">{title}</h3>
                <div className="message-close alt-circle" onClick={()=>setShowMessages(false)}>✖</div>
            </div>
            {showSearch?<div className="row">
                <div className="col-12">
                    <form className="message-search" onSubmit={e=>e.preventDefault()}>
                        <input className="form-input" onChange={e=>setSearch(e.target.value)} value={search} placeholder="Search friends"></input>
                    </form>
                </div>
            </div>:[]}
            {showSearch?
            <div className="row search-friends-container">
                {
                    friends
                        .filter(f=>{
                            return ((f.receiving.username.includes(search)&&f.receiving.username!==data.me.username)||
                            (f.requesting.username.includes(search)&&f.requesting.username!==data.me.username))&&f.status===1}
                        )
                        .map(f=>({
                            username: f.receiving.username===data.me.username?f.requesting.username:f.receiving.username,
                            id: f._id
                        }))
                        .map(f=>
                            <div key={f.id} className="col-12">
                                <div className="search-friend" onClick={()=>handleFriendClick(f)}>
                                    {f.username}
                                </div>
                            </div>
                        )
                }
            </div>:
            <div className="row">
                <div className="col-12">
                    <div className="messages p-2">
                        {
                            messages.map(m=>m.sender.username===title?
                                <div key={m._id} className="row mb-1">
                                    <div className="col-8">
                                        <div className="from-friend">{m.message}</div><div></div>
                                    </div>
                                    <div className="col-4">
                                    </div>
                                </div>:
                                <div key={m._id} className="row mb-1">
                                    <div className="col-4">
                                    </div>
                                    <div className="col-8">
                                        <div className={`from-me status-${m.status}`}>{m.message}</div>
                                    </div>
                                </div>
                            )
                        }
                        {errorMsg?errorMsg:""}
                    </div>
                </div>
            </div>}
            {showSearch?[]:
                <form onSubmit={handleSendMessage}>
                    <div className="row send-message px-2">
                        <div className="col-10 pr-0">
                            <input className="form-input send-message-input" placeholder="message" value={message} onChange={e=>setMessage(e.target.value)}>
                            </input>
                        </div>
                        <div className="col-2 pl-0 py-2">
                            <div className="message-sent-btn" onClick={handleSendMessage}>
                                Send
                            </div>
                        </div>
                    </div>
                </form>
            }
        </div>
    )
}

const Messages = ({friends,data,fromProfile,setFriends}) => {
    const [showMessages,setShowMessages] = useState(false);
    const [showFriends,setShowFriends] = useState(true);
    const [friend,setFriend] = useState('');
    const [id,setId] = useState('');

    useEffect(()=>{
        if(fromProfile.show){
            setShowMessages(fromProfile.show)
            setShowFriends(fromProfile.showFriend)
            setFriend(fromProfile.friend)
            setId(fromProfile.id)
        }
    },[fromProfile])

    return (
        showMessages?
            <div className="message-container">
                {(showFriends)?
                    <FriendsWithMessage
                        setShowMessages={setShowMessages}
                        setShowFriends={setShowFriends}
                        friends={friends}
                        data={data}
                        setFriend={setFriend}
                        setId={setId}
                    />:
                    <MessagesWithFriend
                        setShowMessages={setShowMessages}
                        setShowFriends={setShowFriends} 
                        friend={friend} 
                        setFriend={setFriend}
                        setId={setId}
                        friends={friends}
                        data={data}
                        _id={id}
                        fromProfile={fromProfile}
                        setFriends={setFriends}
                    />}
            </div>:
            <MessagesButton setShowMessages={setShowMessages}/>
    )
}

export default Messages;