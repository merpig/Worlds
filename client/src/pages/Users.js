import React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import Auth from '../utils/auth';

const Users = () => {
    const { id } = useParams();

    if(!Auth.loggedIn()) return <Redirect to="/login" />

    console.log(id)
    if( !id ) {
        return (
            <form>
                <input className="form-input" placeholder="Search for a user">
                </input>
            </form>
        )
    }
    
    return (
        <div>
            
        </div>
    )
}

export default Users;