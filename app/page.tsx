import { RabbitMQForm } from "@/components/rabbitmq-form"
import { Rabbit, MessageSquare, Zap } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              RabbitMQ Message Sender
            </h1>
            {/* <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Send multiple messages to RabbitMQ with configurable size and content. 
              Perfect for testing, load simulation, and message queue validation.
            </p> */}
          </div>

          {/* Form Section */}
          <div className="glass-effect rounded-2xl p-1 shadow-2xl">
            <div className="bg-white rounded-xl">
              <RabbitMQForm />
            </div>
          </div>

          {/* Features Row */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 mt-8">
            <div className="text-center">
              <div className="p-3 bg-white/20 rounded-full w-fit mx-auto mb-4 backdrop-blur-sm">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Bulk Messaging</h3>
              <p className="text-white/70 text-sm">Send thousands of messages efficiently with batch processing</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white/20 rounded-full w-fit mx-auto mb-4 backdrop-blur-sm">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Real-time Progress</h3>
              <p className="text-white/70 text-sm">Monitor progress with live updates and performance metrics</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-white/20 rounded-full w-fit mx-auto mb-4 backdrop-blur-sm">
                <Rabbit className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">RabbitMQ Ready</h3>
              <p className="text-white/70 text-sm">Native AMQP support with robust connection handling</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
