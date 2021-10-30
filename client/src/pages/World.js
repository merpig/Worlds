import React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import Auth from '../utils/auth';

const World = () => {
    const { id } = useParams();

    if(!Auth.loggedIn()) return <Redirect to="/login" />

    return (
        <div>
            
        </div>
    )
}

export default World;