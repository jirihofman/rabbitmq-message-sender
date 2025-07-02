"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send, CheckCircle, XCircle, Settings, MessageCircle, Database } from "lucide-react"

interface SendResult {
  success: boolean
  message: string
  messagesSent?: number
  timeTaken?: number
}

export function RabbitMQForm() {
  const [formData, setFormData] = useState({
    url: "amqps://USERNAME:PWD@whale.rmq.cloudamqp.com/xxxxxxxx",
    queueName: "test-queue",
    messageCount: 100,
    messageSize: 500,
    batchSize: 10,
    customMessage: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<SendResult | null>(null)

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const generateLoremIpsum = (size: number): string => {
    const lorem =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. "

    let text = ""
    while (text.length < size) {
      text += lorem
    }
    return text.substring(0, size)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setProgress(0)
    setResult(null)

    try {
      const messageContent = formData.customMessage || generateLoremIpsum(formData.messageSize)

      const response = await fetch("/api/send-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          messageContent,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Handle streaming response for progress updates
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n").filter((line) => line.trim())

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.progress !== undefined) {
                  setProgress(data.progress)
                }
                if (data.result) {
                  setResult(data.result)
                }
              } catch (e) {
                console.error("Error parsing SSE data:", e)
              }
            }
          }
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Message Configuration</h2>
            <p className="text-gray-600">Configure your RabbitMQ connection and message parameters</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Connection Settings */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Connection Settings</h3>
          </div>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-medium text-gray-700">RabbitMQ URL</Label>
              <Input
                id="url"
                type="text"
                value={formData.url}
                onChange={(e) => handleInputChange("url", e.target.value)}
                placeholder="amqps://USERNAME:PWD@whale.rmq.cloudamqp.com/xxxxxxxx"
                className="h-12 px-4 text-sm border-2 border-gray-200 focus:border-primary focus:ring-0 rounded-lg transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="queueName" className="text-sm font-medium text-gray-700">Queue Name</Label>
              <Input
                id="queueName"
                type="text"
                value={formData.queueName}
                onChange={(e) => handleInputChange("queueName", e.target.value)}
                placeholder="test-queue"
                className="h-12 px-4 text-sm border-2 border-gray-200 focus:border-primary focus:ring-0 rounded-lg transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* Message Settings */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">Message Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="messageCount" className="text-sm font-medium text-gray-700">Message Count</Label>
              <Input
                id="messageCount"
                type="number"
                min="10"
                max="10000"
                step={10}
                value={formData.messageCount}
                onChange={(e) => handleInputChange("messageCount", Number.parseInt(e.target.value) || 1)}
                className="h-12 px-4 text-sm border-2 border-gray-200 focus:border-primary focus:ring-0 rounded-lg transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="messageSize" className="text-sm font-medium text-gray-700">Message Size (chars)</Label>
              <Input
                id="messageSize"
                type="number"
                min="100"
                max="10000"
                step={100}
                value={formData.messageSize}
                onChange={(e) => handleInputChange("messageSize", Number.parseInt(e.target.value) || 100)}
                className="h-12 px-4 text-sm border-2 border-gray-200 focus:border-primary focus:ring-0 rounded-lg transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchSize" className="text-sm font-medium text-gray-700">Batch Size</Label>
              <Input
                id="batchSize"
                type="number"
                min="10"
                max="100"
                step={10}
                value={formData.batchSize}
                onChange={(e) => handleInputChange("batchSize", Number.parseInt(e.target.value) || 10)}
                className="h-12 px-4 text-sm border-2 border-gray-200 focus:border-primary focus:ring-0 rounded-lg transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customMessage" className="text-sm font-medium text-gray-700">Custom Message (optional)</Label>
            <Textarea
              id="customMessage"
              value={formData.customMessage}
              onChange={(e) => handleInputChange("customMessage", e.target.value)}
              placeholder="Leave empty to use Lorem Ipsum text of specified size"
              rows={4}
              className="px-4 py-3 text-sm border-2 border-gray-200 focus:border-primary focus:ring-0 rounded-lg transition-colors resize-none"
            />
          </div>
        </div>

        {/* Progress Section */}
        {isLoading && (
          <div className="space-y-4 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="font-medium text-blue-900">Sending messages...</span>
              </div>
              <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full h-3" />
          </div>
        )}

        {/* Result Section */}
        {result && (
          <Alert className={`p-6 rounded-xl border-2 ${result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <AlertDescription className={`text-sm ${result.success ? "text-green-800" : "text-red-800"}`}>
                  <div className="font-medium mb-1">{result.message}</div>
                  {result.success && result.messagesSent && result.timeTaken && (
                    <div className="text-xs text-green-600">
                      📊 Sent {result.messagesSent.toLocaleString()} messages in {result.timeTaken.toLocaleString()}ms
                      <span className="ml-2">
                        ⚡ {Math.round((result.messagesSent / result.timeTaken) * 1000).toLocaleString()} msg/sec
                      </span>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full h-14 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Sending Messages...
            </>
          ) : (
            <>
              <Send className="mr-3 h-5 w-5" />
              Send Messages
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
