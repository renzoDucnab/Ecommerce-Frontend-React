import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Form, Button, Container, Card, Alert } from 'react-bootstrap'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
          if (result.data.user.is_admin) {
             navigate('/admin/products');
          } else {
             navigate('/products');
          }
        } else {
          setError(result.error)
        }

        setLoading(false);
    }

    return (
        <Container className="mt-5" style={{ maxwidth: '400px' }}>
            <Card>
               <Card.Body>
                  <Card.Title className="text-center mb-4">Login</Card.Title>
                  {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-block text-start">Email Address</Form.Label>
                            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter email"></Form.Control>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="d-block text-start">Password</Form.Label>
                            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter password"></Form.Control>
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100" disabled={loading}> { loading ? 'Logging in...' : 'Login'} </Button>
                    </Form>
                    
          
                  <div className="text=center mt-3">
                     <Link to="/register">Don't have an account yet? Register</Link>
                  </div>
               </Card.Body>
            </Card>
        </Container>
    );

};

export default Login;