import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, Form, CardBody } from 'react-bootstrap'


const ProductDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
      fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${id}`);
            setProduct(response.data);
        } catch (error) {
            setError('Product not found or failed to load');
            console.error('Error', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setAddingToCart(true);

        try {
           const response = await api.post('/cart/add', {
               product_id: id,
               quantity: quantity
           });

           alert('Product added to cart');
           navigate('/cart');
        } catch (error) {
          setError('Failed to add to cart');
          console.error('Error:', error)
        } finally {
          setAddingToCart(false)
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh'}}>
                    <p className="mt-2 ms-2">Loading products...</p>
            </div> 
        );
    }

    if (error || !product) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                 {error || 'Product not found'}
                </Alert>
                <Button as={Link} to="/products" variant="primary">Back to Products</Button>
            </Container>
        );
    }


    return (
        <Container className="mt-4">
            <Button as={Link} to="/products" variant="outline-secondary" className="mb-4">Back to Products</Button>

            <Row>
               <Col md={6}>
                  <Card className="mb-4">
                     <Card.Img variant="top" src={product.image || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} style={{ height: '400px', objectFix: 'cover' }} /> 
                  </Card>
               </Col>


                <Col md={6}>
                  <Card className="mb-4">
                    <CardBody>
                        <Card.Title as="h2">{product.name}</Card.Title>

                        <div className="mb-3">
                            <Badge bg={product.stock > 0 ? 'success' : 'danger'}>
                                { product.stock > 0 ? 'In-Stock' : 'Out of Stock'}
                            </Badge>
                            <Badge bg="info" className="ms-2">
                                {product.stock} units available
                            </Badge> 
                        </div>

                        <Card.Text as="h3" className="text-primary mb-4">
                            ${product.price}
                        </Card.Text>

                        <Card.Text className="mb-4">
                            {product.description}
                        </Card.Text>

                        { product.stock > 0 && (
                           <>
                                <Form.Group className="mb-3">
                                    <Form.Label className="d-block text-start">Quantity</Form.Label>
                                    <Form.Control type="number" min="1" max={product.stock} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, e.target.value)))} style={{ width: '100px' }}  />
                                    <Form.Text className="text-muted">Max: { product.stock } units</Form.Text>
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button variant="primary" size="lg" onClick={handleAddToCart} disabled={addingToCart || quantity < 1}>
                                       {addingToCart ? (<> <Spinner animation="border" size="sm" className="me-2" /> Adding to Cart... </>) : ('Add to Cart') }
                                    </Button>

                                    <Button variant="outline-primary" size="lg">Buy Now</Button>
                                </div>
                           </>
                        )}

                    </CardBody>
                  </Card>

                  <Card>
                    <Card.Body>
                        <Card.Title>Product Details</Card.Title>
                        <Row>
                            <Col xs={6}>
                               <p><strong>Price:</strong> ${product.price}</p>
                               <p><strong>Stock:</strong> {product.stock} units</p>
                            </Col>
                            <Col xs={6}>
                               <p><strong>Product ID:</strong> {product.id}</p>
                               <p><strong>Added:</strong> {new Date(product.created_at).toLocaleDateString() }</p>
                            </Col>
                        </Row>
                    </Card.Body>
                  </Card>


                </Col>
            </Row>
    
        </Container>
    );

}

export default ProductDetail;