import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Container, Nav, Navbar as BootstrapNavbar, Button, NavDropdown } from 'react-bootstrap'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <BootstrapNavbar bg='dark' variant='dark' expand='lg' className='mb-4'>
      <Container>
        <BootstrapNavbar.Brand as={Link} to='/'>
          E-Commerce
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls='basic-navbar-nav' />
        <BootstrapNavbar.Collapse id='basic-navbar-nav'>
            <Nav className="me-auto">    
                {!user?.is_admin && (
                  <Nav.Link as={Link} to="/products">Products</Nav.Link>
                )}

                { isAuthenticated && (
                <>  
                    {!user.is_admin && (
                        <> 
                        <Nav.Link as={Link} to="/cart">Cart</Nav.Link>
                        <Nav.Link as={Link} to="/orders">My Orders</Nav.Link>
                        </> 
                    )}

                    {user && user.is_admin && (
                        <NavDropdown title="Admin" id="admin-dropdown">
                           <NavDropdown.Item as={Link} to="/admin/products">
                             Manage Products
                           </NavDropdown.Item>
                        </NavDropdown>
                    )}
                </>
                )}
            </Nav>

            <Nav>
                { isAuthenticated ? (
                    <>
                       <span className="navbar-text text-light me-3">Welcome, {user?.name}</span>
                       <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
                    </>
                ) : (
                    <>
                        <Nav.Link as={Link} to="/login">Login</Nav.Link>
                        <Nav.Link as={Link} to="/register">Register</Nav.Link>
                    </>
                )}
            </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;