import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      inventories: {
        include: {
          warehouse: true
        }
      }
    }
  })

  return NextResponse.json(
    products.map(p => ({
      id: p.code,   // 👈 HUMAN READABLE
      name: p.name,
      description: p.description,
      stock: p.inventories.map(i => ({
        warehouse: i.warehouse.name,
        warehouseCode: i.warehouse.code,
        city: i.warehouse.city,
        totalQuantity: i.totalQuantity,
        reservedQuantity: i.reservedQuantity,
        availableQuantity: i.totalQuantity - i.reservedQuantity
      }))
    }))
  )
}