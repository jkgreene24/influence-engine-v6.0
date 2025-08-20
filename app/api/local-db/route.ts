import { NextRequest, NextResponse } from 'next/server'
import { localDB } from '@/lib/utils/local-storage-db'

// Note: This is a development-only API route for testing localStorage database functionality
// In production, this would be replaced with real database calls

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const type = searchParams.get('type')

    switch (action) {
      case 'get':
        switch (type) {
          case 'users':
            const users = await localDB.users.getAll()
            return NextResponse.json({ success: true, data: users })
          case 'quiz':
            const quizResults = await localDB.quiz.getAll()
            return NextResponse.json({ success: true, data: quizResults })
          case 'purchases':
            const purchases = await localDB.purchases.getAll()
            return NextResponse.json({ success: true, data: purchases })
          default:
            return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 })
        }
      
      case 'clear':
        localDB.clearAll()
        return NextResponse.json({ success: true, message: 'All data cleared' })
      
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Local DB API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, type, data } = body

    switch (action) {
      case 'create':
        switch (type) {
          case 'user':
            const user = await localDB.users.create(data)
            return NextResponse.json({ success: true, data: user })
          case 'quiz':
            const quizResult = await localDB.quiz.create(data)
            return NextResponse.json({ success: true, data: quizResult })
          case 'purchase':
            const purchase = await localDB.purchases.create(data)
            return NextResponse.json({ success: true, data: purchase })
          default:
            return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 })
        }
      
      case 'update':
        const { id, updates } = data
        switch (type) {
          case 'user':
            const updatedUser = await localDB.users.update(id, updates)
            return NextResponse.json({ success: true, data: updatedUser })
          case 'purchase':
            const updatedPurchase = await localDB.purchases.update(id, updates)
            return NextResponse.json({ success: true, data: updatedPurchase })
          default:
            return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 })
        }
      
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Local DB API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
