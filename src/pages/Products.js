import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Container, Row, Col, Card,  Alert, Pagination } from 'react-bootstrap'

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [links, setLinks] = useState([]);

  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const fetchProducts = async (page = 1) => {
    try {
        setLoading(true)
        const response = await api.get(`/products?page=${page}`);

        setProducts(response.data.data);
        setCurrentPage(response.data.current_page);
        setLastPage(response.data.last_page);
        setPerPage(response.data.per_page);
        setTotal(response.data.total);
        setLinks(response.data.links);
    } catch (error) {
         setError('Failed to load products');
         console.error('Error', error);
    } finally {
        setLoading(false);
    }
  };

  const handlePageChange = (page) => {
     if (page >=1 && page <= lastPage) {
       setCurrentPage(page)
     }
  };

  const renderPagination = () => {
        if(lastPage <= 1) return null;

        let items = [];
        let startPage = Math.max(1, currentPage -2);
        let endPage = Math.min(lastPage, currentPage + 2);

        // previous button
        items.push(<Pagination.Prev key="prev" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />);

        // first page
        if (startPage > 1) {
            items.push(<Pagination.Item key={1} active={1 === currentPage} onClick={() => handlePageChange(1)}>1</Pagination.Item>);

            if (startPage > 2) {
                items.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
            }
        }
        
        // page numbers
        for (let page = startPage; page <= endPage; page++) {
            items.push(<Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>{page}</Pagination.Item>);
        }

        // last page
        if (endPage < lastPage) {
            if(endPage < lastPage - 1) {
                items.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
            }
            items.push(<Pagination.Item key={lastPage} active={lastPage === currentPage} onClick={() => handlePageChange(lastPage)}>{lastPage}</Pagination.Item>);
        }

        // next button
        items.push(<Pagination.Next key="next" disabled={currentPage === lastPage} onClick={() => handlePageChange(currentPage + 1)} />);
        
        return (
            <div className="d-flex justify-content-center mt-4"><Pagination>{ items }</Pagination></div>
        );
    };

  if (loading && currentPage === 1) {
    return (
       <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh'}}>
            <p className="mt-2 ms-2">Loading products...</p>
       </div> 
    );
  }

  return (
    <Container className="mt-4">
        <h2 className="mb-4">Our Products</h2>

        {error && <Alert variant="danger">{error}</Alert>}


        <div className="mb-3 text-muted">
           Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} products
        </div>

        <Row>
            {products.length === 0 ? ( <Col><Alert variant="info">No products available</Alert></Col> ) : (
                products.map((product) => (
                    <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                        <Card className="h-100 shadow-sm" >
                            <div className="card-clickable-area"  onClick={() => navigate(`/products/${product.id}`)} style={{ cursor: 'pointer' }}>
                            <Card.Img variant="top" src={product.image || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} style={{ height: '200px', objectFit: 'cover'}} />
                            <Card.Body className="d-flex flex-column">
                                <Card.Title>{ product.name }</Card.Title>
                                <Card.Text className="text-muted">{ product.description?.substring( 0, 100)}...</Card.Text>
                                <div className="mt-auto">
                                   <h5 className="text-primary">&#8369;{product.price}</h5>
                                   <p className="text-secondary"> Stock: {product.stock} units</p>
                                </div>

                            </Card.Body>
                            </div>
                        </Card>
                    </Col>
                ))
            )}
        </Row>

        {renderPagination()}

    </Container>
  );


}

export default Products;