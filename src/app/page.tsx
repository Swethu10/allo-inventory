'use client'


import { useEffect, useState } from 'react'

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const userId = 'USER-001'

  useEffect(() => {
    fetch(`/api/cart?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setCartItems(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading cart...</p>

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <div style={{ padding: 20 }}>
      <h1>🛒 Your Cart</h1>

      {cartItems.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <>
          <h3>Total Items: {totalItems}</h3>

          {cartItems.map(item => (
            <div
              key={item.id}
              style={{
                border: '1px solid #ccc',
                margin: 10,
                padding: 10,
                borderRadius: 8
              }}
            >
              <h2>{item.product.name}</h2>
              <p>{item.product.description}</p>

              <p>
                Quantity: <b>{item.quantity}</b>
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  )
}