import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGIN_USER, STATUS_UPDATE } from '../utils/mutations';
import "./Login.css";

import Auth from '../utils/auth';

const Login = ({setShowNavFooter}) => {
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [login, { error, data }] = useMutation(LOGIN_USER);
  const [statusUpdate] = useMutation(STATUS_UPDATE);
  
  useEffect(()=>{
    setShowNavFooter(true);
  },[]);
  // update state based on form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // submit form
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    console.log("Attempting to login");
    try {
      const { data } = await login({
        variables: { ...formState },
      });

      
      // const {data: statusData} = await statusUpdate({
      //   variables: {
      //     status: "online"
      //   }
      // });

      // console.log(statusData)

      Auth.login(data.login.token);
    } catch (e) {
      console.error(error);
    }

    // clear form values
    setFormState({
      email: '',
      password: '',
    });
  };

  return (
    <main className="flex-row justify-center mb-4 bg-dark login-form">
      <div className="col-12 col-lg-10">
        <div className="card">
          <h4 className="card-header bg-dark text-light p-2">Login</h4>
          <div className="card-body">
            {data ? (
              <p>
                Success! You may now head{' '}
                <Link to="/">back to the homepage.</Link>
              </p>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <input
                  className="form-input"
                  placeholder="Your email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                />
                <input
                  className="form-input"
                  placeholder="******"
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleChange}
                />
                <button
                  className="btn btn-block confirm-btn"
                  style={{ cursor: 'pointer' }}
                  type="submit"
                >
                  Submit
                </button>

                <p className="text-light mb-0 mt-3"> Don't have an account? <Link to="/Signup">Signup</Link></p>
              </form>
            )}

            {error && (
              <div className="my-3 p-3 bg-danger text-white">
                {error.message}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
