import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import api from '../services/api'
import { Container, Row, Col, Card, Button, Spinner, Alert, Table, Form, Badge } from 'react-bootstrap'

const Cart = () => {
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const {
    cartItems,
    cartLoading,
    cartTotal,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart
  } = useCart()
  const navigate = useNavigate()

   useEffect(() => {
        fetchCart()
    }, [])

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return

    setProcessing(true)
    setError('')

    const result = await updateCartItem(cartItemId, newQuantity)
    if (!result.success) {
      setError(result.error)
    }

    setProcessing(false)
  }

  const handleRemoveItem = async cartItemId => {
    setProcessing(true)
    setError('')

    const result = await removeFromCart(cartItemId)
    if (!result.success) {
      setError(result.error)
    }

    setProcessing(false)
  }

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setProcessing(true)
      setError('')
      const result = await clearCart()

      if (!result.success) {
        setError(result.error)
      }

      setProcessing(false)
    }
  }

  const handleCheckout = async () => {

    const token = localStorage.getItem('token');
    if(!token){
        setError('Please login to checkout.')
        navigate('/login')
        return
    }

    setProcessing(true)
    setError('')
    setSuccess('')

    try {
      const response = await api.post('/orders')

      setSuccess('Order placed successfully!')
      
      await fetchCart();

      setTimeout(() => {
        navigate('/orders')
      }, 1500)
    } catch (error) {
      console.error('Checkout error:', error)

      if (error.response?.status === 401) {
        setError('Session expired. Please login again.')
      } else if(error.response?.status === 500 && error.response?.data?.error?.includes('quantity')) {
        setError('Order creation failed: ' + (error.response.data.error || 'Please try again' ))
      } else {
        setError(error.response?.data?.message || 'Failed to place order')
      }
    } finally {
      setProcessing(false)
    }
  }

  if (cartLoading) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh'}}>
            <p className="mt-2 ms-2">Loading cart...</p>
        </div> 
    )
  }

  return (
    <Container>
      <h2 className='mb-4'>Shopping Cart</h2>

      {error && <Alert variant='danger'>{error}</Alert>}
      {success && <Alert variant='success'>{success}</Alert>}

      {cartItems.length === 0 ? (
        <Card className='text-center py-5'>
          <Card.Body>
            <h5>Your cart is empty</h5>
            <p className='text-muted'>Add some produts to get started!</p>
            <Button as={Link} to='/products' variant='primary'>
              Browse Product
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row>
            <Col lg={8}>
              <Card className='mb-4'>
                <Card.Body>
                   <div className='d-flex justify-content-between mb-3'>
                        <h5>Cart Items ({cartItems.length})</h5>
                        <Button
                        variant='outline-danger'
                        size='sm'
                        onClick={handleClearCart}
                        disabled={processing}
                        >
                        Clear Cart
                        </Button>
                    </div>

                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map(item => (
                          <tr key={item.id}>
                            <td>
                              <div className='d-flex align-items-center'>
                                <img
                                  src={
                                    item.product?.image ||
                                    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                                  }
                                  alt={item.product?.name}
                                  style={{
                                    width: '60px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    marginRight: '15px',
                                    borderRadius: '5px'
                                  }}
                                />
                                <div>
                                  <Link to={`/products/${item.product_id}`} className='text-decoration-none'>
                                    {item.product?.name || 'Product'}
                                  </Link>
                                  {item.product?.stock < item.quantity && (
                                    <Badge bg='warning' className='ms-2'>
                                      Low Stock
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>&#8369;{item.price}</td>
                            <td>
                              <div className='d-flex justify-content-center align-items-center'>
                                <Button
                                  size='sm'
                                  variant='outline-secondary'
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={processing || item.quantity <= 1}
                                >
                                  -
                                </Button>
                                <Form.Control
                                  type='number'
                                  min='1'
                                  max={item.product?.stock || 10}
                                  value={item.quantity}
                                  onChange={e => {
                                    const val = parseInt(e.target.value)
                                    if (!isNaN(val) && val >= 1) {
                                      handleUpdateQuantity(item.id, val)
                                    }
                                  }}
                                  style={{ width: '70px', margin: '1px', textAlign: 'center', paddingRight: '2px' }}
                                  disabled={processing}
                                />
                                <Button
                                  size='sm'
                                  variant='outline-secondary'
                                  onClick={() =>
                                    handleUpdateQuantity(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={processing}
                                >
                                  +
                                </Button>
                              </div>
                            </td>
                            <td>
                              <strong>
                                &#8369;{(item.price * item.quantity).toFixed(2)}
                              </strong>
                            </td>
                            <td>
                              <Button
                                variant='outline-danger'
                                size='sm'
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={processing}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className='sticky-top' style={{ top: '20px' }}>
                <Card.Body>
                  <Card.Title>Order Summary</Card.Title>

                  <div className='mb-3'>
                    <div className='d-flex justify-content-between mb-2'>
                      <span>Subtotal</span>
                      <span>&#8369;{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className='d-flex justify-content-between mb-2'>
                      <span>Shipping</span>
                      <span>&#8369;0.00</span>
                    </div>
                    <div className='d-flex justify-content-between mb-2'>
                      <span>Tax</span>
                      <span>&#8369;0.00</span>
                    </div>
                    <hr />
                    <div className='d-flex justify-content-between'>
                      <span>Total</span>
                      <span className='text-primary'>
                        &#8369;{cartTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                     <Button variant="primary" size="lg" onClick={handleCheckout} disabled={processing || cartItems.length === 0}>
                        { processing ? (<> <Spinner animation="border" size="sm" className="me-2" /> </>) : ( 'Proceed Checkout' )}
                     </Button>
                     <Button as={Link} to="/products" variant="outline-primary" disabled={processing}>
                        Continue Shopping
                     </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  )
}

export default Cart
