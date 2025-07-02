import type { NextRequest } from "next/server"
import * as amqp from "amqplib"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const { url, queueName, messageCount, messageContent, batchSize } = await request.json()

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const sendSSE = (data: { progress: number; status?: string; result?: { success: boolean; message: string; messagesSent?: number; timeTaken?: number } }) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

      try {
        const startTime = Date.now()
        let messagesSent = 0

        // ── connect ───────────────────────────────────────────────────────────
        sendSSE({ progress: 5, status: "Connecting to RabbitMQ…" })
        const connection = await amqp.connect(url)
        const channel = await connection.createChannel()

        // ── queue setup ───────────────────────────────────────────────────────
        sendSSE({ progress: 10, status: "Asserting queue…" })
        await channel.assertQueue(queueName, { durable: true })

        // ── publish in batches ────────────────────────────────────────────────
        for (let i = 0; i < messageCount; i += batchSize) {
          const currentBatch = Math.min(batchSize, messageCount - i)

          for (let j = 0; j < currentBatch; j++) {
            const idx = i + j + 1
            const payload = {
              id: idx,
              timestamp: new Date().toISOString(),
              content: messageContent,
              messageNumber: idx,
              totalMessages: messageCount,
            }

            /*  sendToQueue is sync / returns boolean -> no await  */
            channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), { persistent: true })
            messagesSent++
          }

          const progress = Math.min(90, (messagesSent / messageCount) * 90 + 10)
          sendSSE({
            progress,
            status: `Sent ${messagesSent}/${messageCount} messages…`,
          })

          if (i + batchSize < messageCount) {
            await new Promise((r) => setTimeout(r, 10))
          }
        }

        // ── cleanup ───────────────────────────────────────────────────────────
        sendSSE({ progress: 95, status: "Closing connection…" })
        await channel.close()
        await connection.close()

        sendSSE({
          progress: 100,
          result: {
            success: true,
            message: `Successfully sent ${messagesSent} messages to “${queueName}”.`,
            messagesSent,
            timeTaken: Date.now() - startTime,
          },
        })
      } catch (err) {
        console.error("RabbitMQ Error:", err)
        sendSSE({
          progress: 100,
          result: {
            success: false,
            message: err instanceof Error ? err.message : "Failed to send messages",
          },
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
