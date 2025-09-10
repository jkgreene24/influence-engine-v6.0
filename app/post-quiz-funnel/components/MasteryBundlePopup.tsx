"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface MasteryBundlePopupProps {
  isOpen: boolean
  onSelect: () => void
  onDecline: () => void
}

export default function MasteryBundlePopup({ isOpen, onSelect, onDecline }: MasteryBundlePopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">🎓 Complete Your Bundle</DialogTitle>
        </DialogHeader>
        
        <Card className="border-2 border-[#92278F]/20 bg-gradient-to-r from-[#92278F]/5 to-purple-50">
          <CardContent className="p-6">
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <p className="text-lg text-gray-700">
                  ✅ You've unlocked the Influence Engine™ Bundle (IE + Toolkit + Book).
                </p>
                <p className="text-lg text-gray-700">
                  👉 Add the Mastery Class to your bundle for just $197 (normally $497).
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🌟 What you'll get in the Mastery Class:</h3>
                <div className="space-y-2 text-left">
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500">💬</span>
                    <span className="text-gray-700">Advanced objection handling (when sellers stall or attorneys push back)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">📓</span>
                    <span className="text-gray-700">Quick-start workbook with exercises to apply your style</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-500">🗣️</span>
                    <span className="text-gray-700">Conversation templates you can use immediately</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-orange-500">🧩</span>
                    <span className="text-gray-700">Step-by-step deal conversation breakdowns</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={onSelect}
                  className="bg-[#92278F] hover:bg-[#7a1f78] text-white px-8 py-3 text-lg font-semibold"
                >
                  🔓 Yes — Add Mastery for $197
                </Button>
                <Button
                  onClick={onDecline}
                  variant="outline"
                  className="px-8 py-3 text-lg font-semibold"
                >
                  ❌ No thanks, continue to checkout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
