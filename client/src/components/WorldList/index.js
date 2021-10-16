import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import Auth from '../../utils/auth';
import { useMutation } from '@apollo/client';
import { ADD_WORLD } from '../../utils/mutations';

const World = ({ _id, worldname, privacySetting, visitSetting, mainSection, players }) => {
  const pSetting = privacySetting.charAt(0).toUpperCase()+privacySetting.slice(1)
  return (
    <div key={_id} className="card mb-3">
      <h4 className="card-header bg-dark text-light p-2 m-0">
        {/* <Link className="text-light" to={`/world/${_id}`}> */}
          {worldname}
        {/* </Link> */}
      </h4>
        <div> {pSetting} can visit.</div>
        <div> Players can visit when you're {visitSetting}.</div>
        <div> There are currently {players.length} players in this world. </div>
        <button>Enter World</button>
    </div>
  );
};

const CreateWorld = ({showCreateWorld}) => {
  const [addWorld, { error, data }] = useMutation(ADD_WORLD);
  const [formState, setFormState] = useState({
    worldname: '',
    privacySetting: 'anyone',
    visitSetting: 'offline',
  });

  const handleChange = (event) => {
    let { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log(Auth.getProfile().data._id);
    if(formState.worldname.length){
      try {
        console.log({ ...formState, id: Auth.getProfile().data._id })
        const { data } = await addWorld({
          variables: { ...formState, id: Auth.getProfile().data._id }
        });
        console.log(data);
      } catch (e) {
        console.error(e);
      }
      setFormState({
        worldname: '',
        privacySetting: 'anyone',
        visitSetting: 'offline',
      });
      showCreateWorld(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <input
          className="form-input"
          placeholder="World name"
          name="worldname"
          type="text"
          value={formState.worldname}
          onChange={handleChange}
        />
        <label htmlFor="privacySetting">Privacy Setting:</label>
        <select name="privacySetting" onChange={handleChange}>
          <option value="anyone">Anyone</option>
          <option value="friends">Friends</option>
          <option value="none">No one</option>
        </select>
        <label htmlFor="visitSetting">Players can visit when you're: </label>
        <select name="visitSetting" onChange={handleChange}>
          <option value="offline">Offline</option>
          <option value="online">Online</option>
          <option value="present">In the world</option>
        </select>
        <br/>
        <button type="submit">Create</button>
      </form>
    </div>
  )
}

const WorldList = ({ worlds, title }) => {
  //console.log(worlds)
  const [createWorld,showCreateWorld] = useState(false);

  const renderWorlds = () => {
    if (!worlds.length) return <h4>No Worlds created yet</h4>;
    return worlds.map(world => <World key={world._id} {...world} />);
  }

  return (
    <>
      <h3>{title}</h3>
      <button onClick={()=>showCreateWorld(true)}>Create World</button>
      {createWorld?<CreateWorld showCreateWorld={showCreateWorld} />:[]}
      <hr></hr>
      {renderWorlds()}
    </>
  );
};

export default WorldList;
