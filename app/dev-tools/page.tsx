"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, RefreshCw, Eye, EyeOff } from "lucide-react"

export default function DevToolsPage() {
  const [localStorageData, setLocalStorageData] = useState<any>({})
  const [showRawData, setShowRawData] = useState(false)

  const loadLocalStorageData = () => {
    const data: any = {}
    
    // Load all localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || 'null')
        } catch {
          data[key] = localStorage.getItem(key)
        }
      }
    }
    
    setLocalStorageData(data)
  }

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all localStorage data?")) {
      localStorage.clear()
      loadLocalStorageData()
    }
  }

  const clearSpecificData = (key: string) => {
    if (confirm(`Are you sure you want to clear ${key}?`)) {
      localStorage.removeItem(key)
      loadLocalStorageData()
    }
  }

  useEffect(() => {
    loadLocalStorageData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Development Tools</h1>
          <div className="flex gap-2">
            <Button onClick={loadLocalStorageData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={clearAllData} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>LocalStorage Data</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRawData(!showRawData)}
                >
                  {showRawData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(localStorageData).length === 0 ? (
                <p className="text-gray-500">No localStorage data found</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(localStorageData).map(([key, value]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{key}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearSpecificData(key)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {showRawData ? (
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-96">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <div className="space-y-2">
                          {typeof value === 'object' && value !== null ? (
                            Object.entries(value).map(([subKey, subValue]) => (
                              <div key={subKey} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700">{subKey}:</span>
                                <span className="text-gray-600">
                                  {typeof subValue === 'string' && subValue.length > 50
                                    ? `${subValue.substring(0, 50)}...`
                                    : String(subValue)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-600">{String(value)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem("current_influence_user")
                    loadLocalStorageData()
                  }}
                >
                  Clear Current User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem("influence_users")
                    loadLocalStorageData()
                  }}
                >
                  Clear All Users
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem("influence_quiz_results")
                    loadLocalStorageData()
                  }}
                >
                  Clear Quiz Results
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem("influence_purchases")
                    loadLocalStorageData()
                  }}
                >
                  Clear Purchases
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
