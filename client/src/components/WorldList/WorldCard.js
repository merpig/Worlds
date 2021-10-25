import React, {useState} from 'react';
import Auth from '../../utils/auth';
import { DELETE_WORLD } from '../../utils/mutations';
import { useMutation } from '@apollo/client';
import CreateWorld from "./CreateWorld";
import "./index.css";

const WorldCard = ({ _id, worldname, privacySetting, visitSetting, players, setWorlds, worlds }) => {
    const [deleteWorld] = useMutation(DELETE_WORLD);
    const [createWorld,showCreateWorld] = useState(false);
    const worldData = {_id,worldname,privacySetting,visitSetting};

    const onDeleteWorld = async (id) => {
      let response = await deleteWorld({
        variables: {id,userId:Auth.getProfile().data._id}
      })
  
      if(response.data.deleteWorld.ok){
        setWorlds(worlds.filter(world=>world._id!==id));
      }
    };
  
    const onEditWorld = async (event) => {
        event.preventDefault();
        showCreateWorld(!createWorld)
    };
  
    return (
      <div key={_id} className="card mb-3">
        <h4 className="card-header bg-dark text-light p-2 m-0">
          {/* <Link className="text-light" to={`/world/${_id}`}> */}
            {worldname}
          {/* </Link> */}
          <button className="worldSetting" onClick={onEditWorld}><i className="fa fa-gear"></i></button>
        </h4>
        {createWorld?
        <CreateWorld showCreateWorld={showCreateWorld} worlds={worlds} setWorlds={setWorlds} edit={true} worldData={worldData}/>:
        <div>
            <div> {privacySetting} can visit when you're {visitSetting}.</div>
            <div> There are currently {players.length} players in this world. </div>
            <button>Enter World</button>
            <button className="deleteWorld" onClick={()=>onDeleteWorld(_id)}>Delete World</button>
        </div>}
      </div>
    );
};

export default WorldCard;