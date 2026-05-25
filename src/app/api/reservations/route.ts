import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { productId, warehouseId, quantity } = await req.json()

  try {
    const result = await prisma.$transaction(async (tx) => {

      // 1. Convert CODE → REAL DB IDs
      const product = await tx.product.findUnique({
        where: { code: productId }
      })

      const warehouse = await tx.warehouse.findUnique({
        where: { code: warehouseId }
      })

      if (!product || !warehouse) {
        throw new Error('Invalid product or warehouse code')
      }

      // 2. Find inventory using REAL IDs
      const inventory = await tx.inventory.findFirst({
        where: {
          productId: product.id,
          warehouseId: warehouse.id
        }
      })

      if (!inventory) {
        throw new Error('Inventory not found')
      }

      const available =
        inventory.totalQuantity - inventory.reservedQuantity

      if (available < quantity) {
        const err: any = new Error('NOT_ENOUGH_STOCK')
        err.code = '409'
        throw err
      }

      // 3. Update stock
      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          reservedQuantity: {
            increment: quantity
          }
        }
      })

      // 4. Create reservation
      const reservation = await tx.reservation.create({
        data: {
          productId: product.id,
          warehouseId: warehouse.id,
          quantity,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        }
      })

      return reservation
    })

    return NextResponse.json(result)

  } catch (error: any) {
    console.error("🔥 RESERVATION REAL ERROR:", error)

    return NextResponse.json(
      {
        error: "Server error",
        details: error?.message,
      },
      { status: 500 }
    )
  }
}