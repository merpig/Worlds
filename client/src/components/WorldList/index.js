import React, {useState} from 'react';
import "./index.css";
import WorldCard from "./WorldCard";
import CreateWorld from "./CreateWorld";



const WorldList = ({ worlds,title }) => {
  const [createWorld,showCreateWorld] = useState(false);
  const [storedWorlds,setWorlds] = useState(worlds);

  const renderWorlds = () => {
    if (!storedWorlds.length) return <h4>No Worlds created yet</h4>;
    return storedWorlds.map(world => <WorldCard key={world._id} {...world} setWorlds={setWorlds} storedWorlds={storedWorlds} />);
  }

  return (
    <>
      <h3>{title}</h3>
      {createWorld?
        <CreateWorld showCreateWorld={showCreateWorld} worlds={storedWorlds} setWorlds={setWorlds}/>:
        <button onClick={()=>showCreateWorld(true)}>Create World</button>
      }
      <hr></hr>
      {renderWorlds()}
    </>
  );
};

export default WorldList;
