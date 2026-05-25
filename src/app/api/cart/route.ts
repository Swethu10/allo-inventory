import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId, productId, quantity } = await req.json()

  const existing = await prisma.cart.findFirst({
    where: { userId, productId }
  })

  if (existing) {
    const updated = await prisma.cart.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + (quantity || 1)
      }
    })

    return NextResponse.json(updated)
  }

  const cartItem = await prisma.cart.create({
    data: {
      userId,
      productId,
      quantity: quantity || 1
    }
  })

  return NextResponse.json(cartItem)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  const cartItems = await prisma.cart.findMany({
    where: { userId },
    include: { product: true }
  })

  return NextResponse.json(cartItems)
}

// 🗑️ REMOVE ITEM
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  await prisma.cart.delete({
    where: { id }
  })

  return NextResponse.json({ message: 'Removed from cart' })
}

// ➖ DECREASE QUANTITY
export async function PATCH(req: Request) {
  const { id, type } = await req.json()

  const item = await prisma.cart.findUnique({
    where: { id }
  })

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  let newQty = item.quantity

  if (type === 'increase') newQty++
  if (type === 'decrease') newQty--

  if (newQty <= 0) {
    await prisma.cart.delete({ where: { id } })
    return NextResponse.json({ message: 'Removed item' })
  }

  const updated = await prisma.cart.update({
    where: { id },
    data: { quantity: newQty }
  })

  return NextResponse.json(updated)
}