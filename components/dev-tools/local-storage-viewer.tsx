"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Trash2, RefreshCw, Download, Upload } from 'lucide-react'

interface LocalStorageData {
  users: any[]
  quizResults: any[]
  purchases: any[]
}

export default function LocalStorageViewer() {
  const [data, setData] = useState<LocalStorageData>({ users: [], quizResults: [], purchases: [] })
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, quizRes, purchasesRes] = await Promise.all([
        fetch('/api/local-db?action=get&type=users'),
        fetch('/api/local-db?action=get&type=quiz'),
        fetch('/api/local-db?action=get&type=purchases')
      ])

      const users = await usersRes.json()
      const quiz = await quizRes.json()
      const purchases = await purchasesRes.json()

      setData({
        users: users.success ? users.data : [],
        quizResults: quiz.success ? quiz.data : [],
        purchases: purchases.success ? purchases.data : []
      })
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearAllData = async () => {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) return
    
    try {
      await fetch('/api/local-db?action=clear')
      await fetchData()
    } catch (error) {
      console.error('Failed to clear data:', error)
    }
  }

  const exportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      data
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `localstorage-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">LocalStorage Database Viewer</h1>
        <div className="flex gap-2">
          <Button onClick={fetchData} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={clearAllData} variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">
            Users <Badge variant="secondary" className="ml-2">{data.users.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="quiz">
            Quiz Results <Badge variant="secondary" className="ml-2">{data.quizResults.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="purchases">
            Purchases <Badge variant="secondary" className="ml-2">{data.purchases.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              {data.users.length === 0 ? (
                <p className="text-gray-500">No users found</p>
              ) : (
                <div className="space-y-4">
                  {data.users.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          {user.company && <p className="text-sm text-gray-500">{user.company}</p>}
                        </div>
                        <div className="text-right">
                          {user.influenceStyle && (
                            <Badge variant="outline" className="mb-1">
                              {user.influenceStyle}
                            </Badge>
                          )}
                          <p className="text-xs text-gray-400">
                            Created: {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Results</CardTitle>
            </CardHeader>
            <CardContent>
              {data.quizResults.length === 0 ? (
                <p className="text-gray-500">No quiz results found</p>
              ) : (
                <div className="space-y-4">
                  {data.quizResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Quiz Result</h3>
                          <p className="text-sm text-gray-600">User ID: {result.userId}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{result.influenceStyle}</Badge>
                            {result.secondaryStyle && (
                              <Badge variant="secondary">{result.secondaryStyle}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            Completed: {new Date(result.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              {data.purchases.length === 0 ? (
                <p className="text-gray-500">No purchases found</p>
              ) : (
                <div className="space-y-4">
                  {data.purchases.map((purchase) => (
                    <div key={purchase.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Purchase</h3>
                          <p className="text-sm text-gray-600">User ID: {purchase.userId}</p>
                          <div className="flex gap-2 mt-2">
                            {purchase.products.map((product: string) => (
                              <Badge key={product} variant="outline">{product}</Badge>
                            ))}
                          </div>
                          <p className="text-sm font-medium mt-2">Total: ${purchase.total}</p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={purchase.status === 'completed' ? 'default' : 
                                   purchase.status === 'pending' ? 'secondary' : 'destructive'}
                          >
                            {purchase.status}
                          </Badge>
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {new Date(purchase.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
