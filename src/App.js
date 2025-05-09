import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Uploadfile from './page/Uploadfile'; 
import Login from './login'; 


function App() {
  const isLoggedIn = localStorage.getItem('loggedIns') === 'true';

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} /> 
          <Route 
            path="/upload" 
            element={isLoggedIn ? <Uploadfile /> : <Login />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
