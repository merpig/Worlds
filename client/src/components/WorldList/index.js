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
    <div className="worlds-wrapper">
      <div className="worlds-header bg-dark text-light mb-5">
        <h3><u>{title}</u></h3>
        
        {createWorld?
          <CreateWorld showCreateWorld={showCreateWorld} worlds={worlds} setWorlds={setWorlds}/>:
          <button className="btn create-world" onClick={()=>showCreateWorld(true)}><strong>Create World</strong></button>
        }
      </div>
      
      {renderWorlds()}
    </div>
  );
};

export default WorldList;
