import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Form, Button, Container, Card, Alert } from 'react-bootstrap'

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if(password !== passwordConfirmation) {
            return setError('Password do not match');
        }
         
        setError('');
        setLoading(true);

        const result = await register(name, email, password, passwordConfirmation);

        if (result.success) {
            navigate('/products');
        } else {
            setError(JSON.stringify(result.error));
        }

        setLoading(false);
    }


    return (
        <Container className="mt-5" style={{ maxwidth: '400px' }}>
            <Card>
                <Card.Body>
                    <Card.Title className="text-center mb-4">Register</Card.Title>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>

                        <Form.Group className="mb-3">
                            <Form.Label className="d-block text-start">Full Name</Form.Label>
                            <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Enter your name"></Form.Control>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="d-block text-start">Email Address</Form.Label>
                            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter email"></Form.Control>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="d-block text-start">Password</Form.Label>
                            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter password"></Form.Control>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="d-block text-start">Password Confirmation</Form.Label>
                            <Form.Control type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required placeholder="Confirm password"></Form.Control>
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100" disabled={loading}> { loading ? 'Creating Account...' : 'Register'} </Button>
                    </Form>
                    
            
                    <div className="text=center mt-3">
                        <Link to="/login">Already have an account? Login</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Register
