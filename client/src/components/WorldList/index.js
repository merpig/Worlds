import React, {useState} from 'react';
import { Link } from 'react-router-dom';

const World = ({ _id, name }) => {
  return (
    <div key={_id} className="card mb-3">
      <h4 className="card-header bg-dark text-light p-2 m-0">
        {/* <Link className="text-light" to={`/world/${_id}`}> */}
          {name}
        {/* </Link> */}
      </h4>
    </div>
  );
};

const CreateWorld = () => {
  const [formState, setFormState] = useState({
    name: '',
    privacySetting: 0,
    canVisitOffline: true,
  });

  const handleChange = (event) => {
    let { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    console.log(formState);
  };

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <input
          className="form-input"
          placeholder="World name"
          name="name"
          type="text"
          value={formState.name}
          onChange={handleChange}
        />
      </form>
    </div>
  )
}

const WorldList = ({ worlds, title }) => {
  const [createWorld,showCreateWorld] = useState(false);

  const renderWorlds = () => {
    if (!worlds.length) return <h4>No Worlds created yet</h4>;
    return worlds.map(world => <World key={world._id} {...world} />);
  }

  return (
    <>
      <h3>{title}</h3>
      <button onClick={()=>showCreateWorld(true)}>Create World</button>
      {createWorld?<CreateWorld />:[]}
      <hr></hr>
      {renderWorlds()}
    </>
  );
};

export default WorldList;
