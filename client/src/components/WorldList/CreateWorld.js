import React, {useState} from 'react';
import Auth from '../../utils/auth';
import { useMutation } from '@apollo/client';
import { ADD_WORLD, EDIT_WORLD } from '../../utils/mutations';

const pSettings = ['Anyone','Friends','No one'];
const vSettings = ['offline','online','present']

const CreateWorld = ({showCreateWorld,setWorlds,worlds,edit,worldData}) => {
    const [addWorld] = useMutation(ADD_WORLD);
    const [editWorld] = useMutation(EDIT_WORLD);
    const [formState, setFormState] = useState({
      worldname: worldData?.worldname||'',
      privacySetting: worldData?.privacySetting||'Anyone',
      visitSetting: worldData?.visitSetting||'offline',
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
      if(formState.worldname.length&&pSettings.includes(formState.privacySetting)&&vSettings.includes(formState.visitSetting)){
        try {
          if(edit){
                const {data} = await editWorld({
                    variables: {...formState, id: worldData._id}
                });
                console.log(data)
                setWorlds(worlds.map(world=>{
                    if(world._id===worldData._id)
                        return {...world,...formState};
                    return world;
                }));
          } else {
              console.log({ ...formState, id: Auth.getProfile().data._id })
              const { data } = await addWorld({
                variables: { ...formState, id: Auth.getProfile().data._id }
              });
              setWorlds([...worlds,data.addWorld]);
          }
        } catch (e) {
          console.error(e);
        }
        setFormState({
          worldname: '',
          privacySetting: 'Anyone',
          visitSetting: 'offline',
        });
        showCreateWorld(false);
      }
    };

    const handleFormCancel = (event) => {
        event.preventDefault();
        setFormState({
            worldname: '',
            privacySetting: 'Anyone',
            visitSetting: 'offline',
        });
        showCreateWorld(false);
    }
  
    return (
      <div className="world-form">
        <form onSubmit={handleFormSubmit}>
          <input
            className="form-input"
            placeholder="World name"
            name="worldname"
            type="text"
            value={formState.worldname}
            onChange={handleChange}
          />
          <label htmlFor="privacy-setting">Visitors: </label>
          <select name="privacy-setting" className="privacy-setting" onChange={handleChange} defaultValue={worldData?.privacySetting||'Anyone'}>
            <option value="Anyone">Anyone</option>
            <option value="Friends">Friends</option>
            <option value="No one">No one</option>
          </select>
          <hr></hr>
          <label htmlFor="visit-setting">Can visit: </label>
          <select name="visit-setting" className="privacy-setting" onChange={handleChange} defaultValue={worldData?.visitSetting||'offline'}>
            <option value="offline">Offline</option>
            <option value="online">Online</option>
            <option value="present">In the world</option>
          </select>
          <hr></hr>
          <button className="btn confirm-btn" type="submit">{edit?"Save Changes":"Create"}</button>
          <button className="btn cancel-btn" onClick={handleFormCancel}>Cancel</button>
        </form>
      </div>
    )
};

export default CreateWorld;