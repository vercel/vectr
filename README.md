# Vectr

**Vectr** is an AI-powered image search application template that automatically generates descriptions for uploaded images and indexes them for semantic search.

## ✨ Features

- 📤 **Drag-and-drop image uploads** with Vercel Blob Storage
- 🤖 **AI-powered image descriptions** using Grok 2 Vision
- 🔍 **Semantic search** with Upstash Vector Search
- 🔄 **Resilient processing** with Vercel Workflow automatic retries
- 🗄️ **PostgreSQL database** with Neon for image metadata
- 🎨 **Beautiful UI** built with shadcn/ui and Tailwind CSS

## 🚀 How It Works

When you upload an image, Vectr automatically:

1. 💾 Stores the image in Vercel Blob Storage
2. 🧠 Generates a detailed description using Grok 2 Vision AI
3. 📊 Saves the image metadata to a PostgreSQL database
4. 🔎 Indexes the description in Upstash for semantic search

```mermaid
sequenceDiagram
    participant User
    participant App as Next.js App
    participant Blob as Vercel Blob
    participant Workflow as Vercel Workflow
    participant AI as Grok Vision AI
    participant DB as Neon PostgreSQL
    participant Search as Upstash Search

    User->>App: Upload Image
    App->>Blob: Store Image
    Blob-->>App: Image URL
    App->>Blob: Trigger Webhook

    Blob->>Workflow: POST /api/process

    Note over Workflow: Start Workflow

    Workflow->>AI: Generate Description (Step 1)
    Note over AI: Max 5 retries<br/>Rate limit handling
    AI-->>Workflow: Image Description

    Workflow->>DB: Insert Image Record (Step 2)
    Note over DB: Max 3 retries<br/>Connection handling
    DB-->>Workflow: Image ID

    Workflow->>Search: Index Description (Step 3)
    Note over Search: Max 5 retries<br/>Rate limit handling
    Search-->>Workflow: Success

    Workflow-->>Blob: 200 OK

    User->>App: Search Images
    App->>Search: Semantic Query
    Search-->>App: Matching Images
    App-->>User: Display Results
```

## 🏗️ Architecture

### Workflow Steps

Each step in the image processing workflow is isolated and runs on a separate serverless function with automatic retries:

**Step 1: Generate Description** (`generate-description.ts`)
- 🤖 Uses Grok 2 Vision AI to analyze the image
- ⏱️ Handles rate limiting with 5-minute retry delays
- 🔄 Maximum 5 retry attempts
- ❌ Fatal error on invalid/unsupported images

**Step 2: Insert Image** (`insert-image.ts`)
- 💾 Stores image metadata in PostgreSQL
- 🔌 Handles connection issues with 30-second retry delays
- 🔄 Maximum 3 retry attempts
- ❌ Fatal error on constraint violations

**Step 3: Index Image** (`index-image.ts`)
- 🔎 Indexes description in Upstash Vector Search
- ⏱️ Handles rate limiting with 1-minute retry delays
- 🔄 Maximum 5 retry attempts
- ❌ Fatal error on invalid data

### Error Handling

Vectr uses sophisticated error handling to ensure reliable processing:

- 🔄 **RetryableError**: Temporary failures (rate limits, network issues, timeouts)
- ❌ **FatalError**: Permanent failures (invalid data, constraint violations)
- 📊 **Context-aware retries**: Each step tracks attempt count and timestamps
- 🎯 **Smart HTTP responses**: 400 for fatal errors, 500 for retryable errors

## 🛠️ Tech Stack

- ⚡ **Framework**: Next.js 15 with App Router and React 19
- 🔄 **Workflow**: Vercel Workflow (alpha)
- 🤖 **AI**: Grok 2 Vision via Vercel AI SDK
- 🗄️ **Database**: Neon PostgreSQL with Drizzle ORM
- 🔍 **Search**: Upstash Vector Search
- 💾 **Storage**: Vercel Blob Storage
- 🎨 **UI**: shadcn/ui + Tailwind CSS 4
- 🔒 **Type Safety**: TypeScript + Zod

## 🚀 Deploy to Vercel

The easiest way to deploy Vectr is using the Vercel Marketplace:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-description=A+free%2C+open-source+template+for+building+natural+language+image+search+on+the+AI+Cloud.&demo-image=https%3A%2F%2Fvectr.store%2Fopengraph-image.png&demo-title=vectr.store&demo-url=https%3A%2F%2Fvectr.store%2F&from=templates&project-name=Vectr&repository-name=vectr&repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fvectr&products=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22neon%22%2C%22integrationSlug%22%3A%22neon%22%7D%2C%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22upstash-search%22%2C%22integrationSlug%22%3A%22upstash%22%7D%2C%7B%22type%22%3A%22blob%22%7D%5D&skippable-integrations=0)

During deployment, you'll be prompted to set up:

1. 🗄️ **Neon PostgreSQL** - Serverless PostgreSQL database
2. 🔍 **Upstash Vector Search** - Semantic search indexing
3. 💾 **Vercel Blob Storage** - Image storage with webhooks

All services have generous free tiers and will be automatically configured.

## 💻 Local Development

### Prerequisites

- 🟢 Node.js 18+
- 📦 pnpm (recommended)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/vectr.git
cd vectr
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file with:

```bash
# Neon PostgreSQL
DATABASE_URL="postgresql://..."

# Upstash Search
UPSTASH_SEARCH_URL="https://..."
UPSTASH_SEARCH_TOKEN="..."

# Vercel Blob
BLOB_READ_WRITE_TOKEN="..."

# AI Provider (Grok via Vercel AI SDK)
XAI_API_KEY="..."
```

4. Push the database schema:

```bash
pnpm db:push
```

5. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## 📜 Scripts

- 🚀 `pnpm dev` - Start development server with Turbopack
- 🏗️ `pnpm build` - Build for production
- ✅ `pnpm check` - Run linting checks
- ✨ `pnpm format` - Format code with Biome
- 🗄️ `pnpm db:push` - Push database schema changes

## 📁 Project Structure

```
vectr/
├── app/
│   ├── api/
│   │   └── process/
│   │       ├── route.ts              # Main API route
│   │       ├── process-blob.ts       # Workflow orchestration
│   │       ├── generate-description.ts  # AI description step
│   │       ├── insert-image.ts       # Database insertion step
│   │       └── index-image.ts        # Search indexing step
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── header.tsx
│   ├── results.tsx
│   └── uploaded-images-provider.tsx
├── lib/
│   ├── database.ts                   # Drizzle DB client
│   ├── schema.ts                     # Database schema
│   └── utils.ts
└── package.json
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `UPSTASH_SEARCH_URL` | Upstash Vector Search endpoint | Yes |
| `UPSTASH_SEARCH_TOKEN` | Upstash authentication token | Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Storage token | Yes |
| `XAI_API_KEY` | xAI API key for Grok Vision | Yes |

## 📊 Observability

Vectr includes comprehensive logging for monitoring and debugging:

- 🔄 `[WORKFLOW]` - Workflow-level events and timing
- 🔧 `[stepId]` - Step-level events with unique identifiers
- 🌐 `[API]` - HTTP request/response logging

All logs include timestamps, attempt counts, and duration metrics.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Our [Contributing Guide](.github/CONTRIBUTING.md) has more information on how to get started.

## 📄 License

MIT
