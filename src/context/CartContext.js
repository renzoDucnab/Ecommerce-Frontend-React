import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'

const CartContext = createContext({})

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [cartLoading, setCartLoading] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)
  
   const fetchCart = async () => {

    const token = localStorage.getItem('token');
    if (!token) {
       setCartItems([]);
       setCartCount(0);
       setCartTotal(0);
       setCartLoading(false)
       return;
    }
    
    setCartLoading(true)
    try {
      const response = await api.get('/cart')
      setCartItems(response.data)
      calculateCartSummary(response.data)
    } catch (error) {
      console.error('Error fetching cart:', error)

      if (error.response?.status === 401) {
        setCartItems([]);
        setCartCount(0);
        setCartTotal(0);
      }
    } finally {
      setCartLoading(false)
    }
  }

  useEffect(() => {

    const checkAuthAndFetchCart = async () => {
        const token = localStorage.getItem('token');
        if (token) {
           await fetchCart()
        } else {
           setCartItems([]);
           setCartCount(0);
           setCartTotal(0);
        }
    }

    checkAuthAndFetchCart();

    const handleStorageChange = (e) => {
        if(e.key === 'token') {
          checkAuthAndFetchCart();
        }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
        window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const calculateCartSummary = items => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0)
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setCartCount(count)
    setCartTotal(total)
  }

  const addToCart = async (productId, quantity = 1) => {
    
    const token = localStorage.getItem('token');
    if(!token){
        return { success: false, error: 'Please login to add items to cart'};
    }

    try {
      await api.post('/cart/add', {
        product_id: productId,
        quantity: quantity
      })
      await fetchCart()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add cart'
      }
    }
  }

  const updateCartItem = async (cartItemId, quantity) => {

    const token = localStorage.getItem('token');
    if(!token){
        return { success: false, error: 'Please login to update cart'};
    }

    try {
      await api.put(`/cart/update/${cartItemId}`, { quantity })
      await fetchCart()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update cart'
      }
    }
  }

  const removeFromCart = async cartItemId => {

    const token = localStorage.getItem('token');
    if(!token){
        return { success: false, error: 'Please login to remove items'};
    }

    try {
      await api.delete(`/cart/remove/${cartItemId}`)
      await fetchCart()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove item'
      }
    }
  }

  const clearCart = async () => {

    const token = localStorage.getItem('token');
    if(!token){
        return { success: false, error: 'Please login to clear cart'};
    }

    try {
      await api.delete('/cart/clear')
      await fetchCart()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to clear cart'
      }
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartLoading,
        cartCount,
        cartTotal,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
