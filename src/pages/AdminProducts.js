import React, { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import { Container, Row, Col,Button, Spinner, Alert, Table, Form, Modal, Image, Pagination
} from 'react-bootstrap'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    image: null,
    imageUrl: ''
  })

  const fileInputRef = useRef(null)

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [links, setLinks] = useState([]);

  useEffect(() => {
      fetchProducts(currentPage)
  }, [currentPage])

  const fetchProducts = async (page = 1) => {
    setIsLoading(true);
    try {
        const response = await api.get(`/products?page=${page}`);

        setProducts(response.data.data);
        // setCurrentPage(response.data.current_page);
        setLastPage(response.data.last_page);
        setPerPage(response.data.per_page);
        setTotal(response.data.total);
        setLinks(response.data.links);
    } catch (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load products')
    } finally {
        setIsLoading(false)
    }
  }

  const handleFileChange = e => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2mb')
        return
      }

      const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('Only PNG, JPG, JPEG, and WEBP files are allowed')
        return
      }

      setFormData(prev => ({
        ...prev,
        image: file,
        imageUrl: ''
      }))

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imageUrl: ''
    }))

    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      stock: '',
      description: '',
      image: null,
      imageUrl: ''
    })

    setPreviewImage(null)
    setEditingProduct(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    resetForm()
  }

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

  const getImageUrl = imagePath => {
    if (!imagePath) return ''

    return imagePath;
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setUploading(true)
    setError('')

    try {
      const formDatatoSend = new FormData()
      formDatatoSend.append('name', formData.name)
      formDatatoSend.append('price', formData.price)
      formDatatoSend.append('stock', formData.stock)
      formDatatoSend.append('description', formData.description)

      if (formData.image) {
        formDatatoSend.append('image', formData.image)
      }

      if (editingProduct && !formData.image && formData.imageUrl) {
        // keep existing image = no need to append
      }

      if (editingProduct) {
        formDatatoSend.append('_method', 'PUT')
      }

      let response
      if (editingProduct) {
        response = await api.post(
          `/product/${editingProduct.id}`,
          formDatatoSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )
      } else {
        response = await api.post('/product', formDatatoSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }

      setShowModal(false)
      resetForm()
      fetchProducts(currentPage)
    } catch (error) {
      console.error('Error saving product:', error)
      setError(error.response?.data?.message || 'Failed to save product')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = product => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || '',
      image: null,
      imageUrl: product.image || ''
    })
    setPreviewImage(product.image || null)
    setShowModal(true)
    setError('')
  }

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/product/${id}`)
        fetchProducts(currentPage)
      } catch (error) {
        console.error('Error deleting product:', error)
        setError('Failed to delete product')
      }
    }
  }

  return (
    <Container>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h2>Manage Products</h2>
        <Button variant='primary' onClick={() => setShowModal(true)}>
          Add
        </Button>
      </div>

    <div className="mb-3 text-muted">
        Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} products
    </div>

      <Table responsive striped hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>
                {product.image ? (
                  <Image
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      objectFit: 'cover'
                    }}
                    rounded
                  />
                ) : (
                 <Image
                    src="https://dummyimage.com/300x300/cccccc/969696&text=No+Product+Image"
                    alt={product.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      objectFit: 'cover'
                    }}
                    rounded
                  />
                )}
              </td>
              <td>{product.name}</td>
              <td>&#8369;{product.price}</td>
              <td>{product.stock}</td>
              <td>
                <Button
                  variant='outline-primary'
                  size='sm'
                  onClick={() => handleEdit(product)}
                  className='me-2'
                >
                  Edit
                </Button>
                <Button
                  variant='outline-danger'
                  size='sm'
                  onClick={() => handleDelete(product.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

       {renderPagination()}

      <Modal show={showModal} onHide={handleModalClose} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant='danger'>{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className='mb-3'>
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type='text'
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Label>Price *</Form.Label>
                  <Form.Control
                    type='number'
                    step='0.01'
                    value={formData.price}
                    onChange={e =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Label>Stock *</Form.Label>
                  <Form.Control
                    type='number'
                    value={formData.stock}
                    onChange={e =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className='mb-3'>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={3}
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                 <Form.Group className="mb-3">
                    <Form.Label>Product Image</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
                    <Form.Text className="text-muted">Max file size: 2MB. Allowed: PNG, JPG, WEBP</Form.Text>
                 </ Form.Group>

                 <div className="mb-3">
                    {(previewImage || formData.imageUrl) && (
                      <>
                        <p className="mb-2">Preview:</p>
                        <div className="position-relative" style={{ width: '200px'}}>
                            <Image 
                               src={previewImage || getImageUrl(formData.imageUrl)}
                               alt="Preview"
                               fluid
                               rounded
                               style={{ maxHeight: '200px', objectFit: 'cover'}}
                            />
                            <Button variant="danger" size="sm" onClick={handleRemoveImage} style={{ position: 'relative', top: '5px', rigth: '5px'}}>*</Button>
                        </div>
                      </>
                    )}
                 </div>

                {editingProduct && editingProduct.image && !previewImage && !formData.image && (
                    <Alert variant="info" className="mt-3">
                        <p className="mb-1">Current image:</p>
                        <Image 
                          src={getImageUrl(editingProduct.image)}
                          alt="Current"
                          fluid
                          rounded
                          style={{ maxHeight: '100px', objectFit: 'cover'}}
                        />
                        <p className="mt-2 mb-0 small text-muted">
                          Upload a new image to replace, or leave empty to keep current.
                        </p>
                    </Alert>
                )}

              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="secondary" onClick={handleModalClose}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={uploading}>
                   { uploading ? (
                     <>
                       <Spinner animation="border" size="sm" className="me-2" />
                       {editingProduct ? 'Updating...' : 'Creating...'}
                     </>
                   ) : (
                      editingProduct ? 'Update Product' : 'Create Product'
                   )}
                </Button>
            </div>

          </Form>
        </Modal.Body>
      </Modal>

    </Container>
  )
}

export default AdminProducts
