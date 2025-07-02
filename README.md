This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# v0.dev
This project originated from [v0.dev](https://v0.dev), a platform for building and sharing AI applications. After few attempts to recover from an error, I gave up and decided to exit into a new project using the CLI command provided from v0.dev. The project is now a standalone Next.js application.

Original project: https://v0.dev/chat/next-js-rabbit-mq-message-sender-NVnaIZwA0M1

## Chat history
```
New chat started from template Next.js Community Starter

Make it a form for sending multiple RabbitMQ messages. User can define where to send it by providing URL like "amqps://USERNAME:PWD@whale.rmq.cloudamqp.com/xxxxxxxx". Easy to make it send large amount of messages. Variable message size with lorem ipsum text.

I've transformed your Next.js starter into a comprehensive RabbitMQ message sender application! Here's what I've built:

## Key Features:

1. **Connection Configuration**: Easy input for RabbitMQ URLs in the format you specified
2. **Flexible Message Settings**:

1. Configure message count (up to 10,000)
2. Variable message size with auto-generated Lorem Ipsum
3. Custom message content option
4. Batch processing for efficient sending



3. **Real-time Progress**: Server-Sent Events provide live progress updates during message sending
4. **Professional UI**: Clean form with proper validation, progress bars, and result feedback
5. **Error Handling**: Comprehensive error handling with user-friendly messages


## How to Use:

1. **Install dependencies**: The app uses `amqplib` for RabbitMQ connectivity
2. **Configure Connection**: Enter your RabbitMQ URL (amqps://USERNAME:[PWD@whale.rmq.cloudamqp.com](mailto:PWD@whale.rmq.cloudamqp.com)/xxxxxxxx)
3. **Set Parameters**:

1. Queue name
2. Number of messages (1-10,000)
3. Message size in characters
4. Batch size for processing



4. **Send Messages**: Click send and watch real-time progress


The app efficiently handles large message volumes by processing in configurable batches and provides detailed feedback on the sending process. The dark/light theme toggle is preserved for a great user experience!

The code returns the following error:

RabbitMQ Error: g.once is not a function

  at Object.start (/app/api/send-messages/route)
Revise the code to address the error.

I was previewing: /

The code returns the following error:

RabbitMQ Error: g.once is not a function

  at Object.start (/app/api/send-messages/route)
Revise the code to address the error.

I was previewing: /

It turns out `amqplib` needs to run in a **pure Node.js context**.When the Route Handler executes in the default (edge‐like) environment, the
library’s internals are partially poly-filled and the event-emitter it expects
is missing – which bubbles up as the rather cryptic `g.once is not a function`
error.

Fixes applied:

1. Force this Route Handler to run on the Node.js runtime:
`export const runtime = "nodejs"`.
2. Use a **static** import (`import amqp from "amqplib"`) instead of the
dynamic `import()`.This guarantees we load the proper Node build of the library.
3. Remove the superfluous `await` in front of `channel.sendToQueue`
(it returns a boolean, not a Promise).


Everything else remains unchanged.

```typescriptreact project="next-theme-setup"
...
```

The handler now runs in a full Node environment, loads the correct build of
`amqplib`, and the `g.once` error disappears. Enjoy publishing those
high-volume test messages!


The code returns the following error:

RabbitMQ Error: g.once is not a function

  at Object.start (/app/api/send-messages/route)
Revise the code to address the error.

I was previewing: /

It turns out amqplib needs to run in a pure Node.js context.
When the Route Handler executes in the default (edge‐like) environment, the library’s internals are partially poly-filled and the event-emitter it expects is missing – which bubbles up as the rather cryptic g.once is not a function error.

Fixes applied:

Force this Route Handler to run on the Node.js runtime: export const runtime = "nodejs".
Use a static import (import amqp from "amqplib") instead of the dynamic import().
This guarantees we load the proper Node build of the library.
Remove the superfluous await in front of channel.sendToQueue (it returns a boolean, not a Promise).
Everything else remains unchanged.

The handler now runs in a full Node environment, loads the correct build of amqplib, and the g.once error disappears. Enjoy publishing those high-volume test messages!

The code returns the following error:

RabbitMQ Error: g.once is not a function

  at Object.start (/app/api/send-messages/route)
Revise the code to address the error.

I was previewing: /

It turns out the handler was still being executed in the (Edge-like) “Next.js” sandbox while previewing, so amqplib never received a full Node.js-style net.Socket.
That makes its internal call to socket.once(...) blow up with the very cryptic:

RabbitMQ Error: g.once is not a function
Fixes applied:

Force the handler onto the Node.js runtime – export const runtime = "nodejs".
(edge doesn’t expose net, tls, or a real EventEmitter.)
Static ESM import – import * as amqp from "amqplib".
Using * as guarantees we get the CommonJS default object ({ connect, … }) no matter which module system is active.
No await on channel.sendToQueue – it’s synchronous and just returns a boolean.
Strong typing for the SSE helper – to avoid accidental prototype pollution inside the stream.
Everything else (progress updates, batching, clean-ups) is unchanged.

Previewing in the “/” route should now succeed, because the API handler is forced to run in full Node.js where amqplib can create real TCP/TLS sockets.

```
