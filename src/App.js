import React, {Component} from "react";
import "./App.css";
import { Link, Routes, Route } from 'react-router-dom';
import { Home } from './components/auth/Home';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { AuthProvider } from './components/auth/context/authContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

class App extends Component{
  render(){    
    return(
          <div className='bg-slate-300 h-screen text-blue flex'>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
              </Routes>
            </AuthProvider>
          </div>
    );
  }
}

export default App;
/*
className="container"
*/