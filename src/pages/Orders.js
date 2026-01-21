import React, { useState, useEffect } from 'react'
import { Link  } from 'react-router-dom'
import api from '../services/api'
import { Container, Card, Button, Alert, Table, Badge } from 'react-bootstrap'

const Orders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
      fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders')
            setOrders(response.data)
        } catch (error) {
            setError('Failed to load orders')
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { variant: 'warning', text: 'Pending' },
            'processing': { variant: 'info', text: 'Processing' },
            'shipped': { variant: 'primary', text: 'Shipped' },
            'delivered': { variant: 'success', text: 'Delivered' },
            'cancelled': { variant: 'danger', text: 'Cancelled' },
        }

        const config = statusConfig[status] || { variant: 'secondary', text: status };
        
        return <Badge bg={config.variant}>{config.text}</Badge>
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
           year: 'numeric',
           month: 'short',
           day: 'numeric',
           hour: '2-digit',
           minute: '2-digit',
        });
    }

    if (loading) {
        return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh'}}>
            <p className="mt-2 ms-2">Loading orders...</p>
        </div> 
        )
    }

     return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Orders</h2>
        <Button as={Link} to="/products" variant="outline-primary">
           Continue Shopping
        </Button>
      </div>
      

      {error && <Alert variant='danger'>{error}</Alert>}
 
      {orders.length === 0 ? (
        <Card className='text-center py-5'>
          <Card.Body>
            <h5>No orders yet</h5>
            <p className='text-muted'>Start shopping to see your orders here!</p>
            <Button as={Link} to='/products' variant='primary'>
              Browse Product
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="orders-list">
           {orders.map((order) => (
                <Card key={order.id} className='mb-4 shadow-sm'>
                <Card.Body>
                   <div className='d-flex justify-content-between align-items-start mb-3'>
                       <div>
                          <h5 className="mb-1">Order #{order.id}</h5>
                          <small className="text-muted">Place on { formatDate(order.created_at) }</small>
                       </div>
                       <div className="text-end">
                          <div className="mb-2">{ getStatusBadge(order.status)}</div>
                          <h5 className="text-primary mb-0">&#8369;{order.total_amount}</h5>
                       </div>
                    </div>

                    <Table responsive striped hover className="mb-0">
                      <thead>
                        <tr>
                          <th className="text-start">Product</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.order_items && order.order_items.map(item => (
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
                                    width: '50px',
                                    height: '50px',
                                    objectFit: 'cover',
                                    marginRight: '10px',
                                    borderRadius: '5px'
                                  }}
                                />
                                <div>
                                  <Link to={`products/${item.product_id}`} className='text-decoration-none'>
                                    {item.product?.name || 'Product'}
                                  </Link>
                                </div>
                              </div>
                            </td>
                            <td>&#8369;{item.price}</td>
                            <td>{item.quantity}</td>
                            <td><strong>&#8369;{(item.price * item.quantity).toFixed(2)}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                
                </Card.Body>
              </Card>

           ))}
        </div>
      )}
    </Container>)
 }

export default Orders;