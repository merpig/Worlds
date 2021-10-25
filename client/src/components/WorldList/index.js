import React, {useState} from 'react';
import "./index.css";
import WorldCard from "./WorldCard";
import CreateWorld from "./CreateWorld";



const WorldList = ({ worlds,setWorlds,title }) => {
  const [createWorld,showCreateWorld] = useState(false);

  const renderWorlds = () => {
    if (!worlds.length) return <h4>No Worlds created yet</h4>;
    return worlds.map(world => <WorldCard key={world._id} {...world} setWorlds={setWorlds} worlds={worlds} />);
  }

  return (
    <>
      <h3>{title}</h3>
      {createWorld?
        <CreateWorld showCreateWorld={showCreateWorld} worlds={worlds} setWorlds={setWorlds}/>:
        <button onClick={()=>showCreateWorld(true)}>Create World</button>
      }
      <hr></hr>
      {renderWorlds()}
    </>
  );
};

export default WorldList;
