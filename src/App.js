import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';

// components
import Navbar from './components/Navbar'

// pages
import Login from './pages/Login';
import Register from './pages/Register';
import Products  from './pages/Products';
import ProductDetail  from './pages/ProductDetail';
import Cart  from './pages/Cart';
import Orders  from './pages/Orders';
import AdminProducts  from './pages/AdminProducts';

// private route component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const AdminPrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (    
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh'}}>
            <p className="mt-2 ms-2">Loading products...</p>
        </div> 
    )
  }
  
  if (!isAuthenticated || !user || !token) {
    return <Navigate to="/login" />;
  }

  if (!user.is_admin) {
    return <Navigate to="/products" />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
       <Router>
         <Navbar />
         <div className="App">
           <Routes>
              <Route path="/" element={<Navigate to="/products" />}  />
              <Route path="/login" element={<Login />}  />
              <Route path="/register" element={<Register />}  />
              <Route path="/products" element={<Products />}  />
              <Route path="/products/:id" element={<ProductDetail />}  />

              {/* protected routes */}
              <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>}  />
              <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>}  />

              <Route path="/admin/products" element={
                <AdminPrivateRoute>
                  <AdminProducts/>
                </AdminPrivateRoute>
              } />

              <Route path="*" element={<Navigate to="/products" />}  />
              {/* <Route path="*" element={<h2 className="text-center mt-5">404 - Page Not Found</h2>}  /> */}
           </Routes>
         </div>
       </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
