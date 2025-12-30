# Pastebin

A simple pastebin-like application for creating and sharing text snippets with optional expiry and view limits.Built with Next.js, TypeScript, and PostgreSQL.

## Deployed URL

[https://pastebin-lovat.vercel.app/](https://pastebin-lovat.vercel.app)

## Git Repository

[https://github.com/VivekKumarL/Pastebin](https://github.com/VivekKumarL/Pastebin)

## Project Description

Pastebin is a web application that allows users to:

- Create text pastes with optional constraints (time-based expiry and view limits)
- Receive a shareable URL for each paste
- View pastes through both HTML pages and JSON API endpoints
- Have pastes automatically become unavailable when constraints are triggered

## How to Run the App Locally

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database (or use Neon/Supabase)

### Installation Steps

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/pastebin.git
cd pastebin
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:

```env
# Database connection (Neon PostgreSQL recommended)
POSTGRES_URL="postgresql://username:password@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# App URL for local development
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Set up the database:**
   The application will automatically create the required table on first run. If you need to create it manually:

```sql
CREATE TABLE pastes (
  id VARCHAR(21) PRIMARY KEY,
  content TEXT NOT NULL,
  ttl_seconds INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_views INTEGER,
  views INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

5. **Run the development server:**

```bash
npm run dev
```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Persistence Layer Used

**PostgreSQL with Neon** is used as the persistence layer.

### Why PostgreSQL with Neon?

- **Serverless Architecture**: Neon provides serverless PostgreSQL that works seamlessly with Vercel deployment
- **Data Durability**: Data persists across serverless function invocations
- **ACID Compliance**: Ensures data consistency and reliability
- **Connection Pooling**: Efficient for serverless environments where connections are ephemeral
- **Free Tier**: Neon offers a generous free tier perfect for this type of application

### Database Schema

The application uses a single `pastes` table with the following structure:

- `id`: Unique identifier (10-character string)
- `content`: The paste content (text)
- `ttl_seconds`: Time-to-live in seconds (optional)
- `expires_at`: Calculated expiry timestamp (optional)
- `max_views`: Maximum number of views (optional)
- `views`: Current view count
- `created_at`: Timestamp of creation

## Important Design Decisions

### 1. Next.js App Router with TypeScript

- **Why**: Leverages the latest Next.js features for API routes and server components
- **Benefit**: Unified development experience with built-in TypeScript support
- **Result**: Type-safe code with better developer experience

### 2. Serverless-Optimized Database Connection

- **Why**: Vercel deployment uses serverless functions
- **Solution**: Singleton connection pattern with proper SSL configuration
- **Benefit**: Prevents connection pool exhaustion in serverless environment

### 3. Atomic View Counting

- **Why**: Prevent race conditions when multiple users access the same paste simultaneously
- **Solution**: View increments are atomic database operations
- **Benefit**: Accurate view counting even under concurrent load

### 4. Deterministic Time for Testing

- **Why**: Enable reliable automated testing of TTL functionality
- **Solution**: `TEST_MODE=1` environment variable and `x-test-now-ms` header
- **Benefit**: Can simulate time-based expiry in automated tests

### 5. Security Considerations

- **XSS Protection**: React automatically escapes HTML content
- **Input Validation**: Zod schemas validate all API inputs
- **Secure Database Connection**: Enforced SSL/TLS for database connections
- **No Hardcoded Secrets**: All credentials via environment variables

### 6. API Design

- **RESTful Endpoints**: Clear separation between HTML and JSON endpoints
- **Consistent Error Handling**: 404 for all unavailable pastes, 4xx for invalid inputs
- **JSON Responses**: All API endpoints return properly formatted JSON

### 7. Deployment Strategy

- **Vercel Hosting**: Optimized for Next.js applications
- **Environment Variables**: Secure configuration management
- **Automatic HTTPS**: SSL certificates handled by Vercel

## Short Notes

### Persistence Choice:

PostgreSQL with Neon - Provides durable, ACID-compliant storage that works perfectly with Vercel's serverless architecture. The relational model fits the paste data structure well and ensures data consistency.

### Notable Decisions:

1. **Atomic Operations**: Ensures view counting works correctly under concurrent access
2. **Serverless Optimization**: Database connection management optimized for Vercel deployment
3. **Testing Support**: Built-in support for deterministic time testing as required by the assignment
4. **Security First**: XSS protection, input validation, and secure database connections
5. **Clean Architecture**: Separation of concerns with clear API and UI layers

This application meets all functional requirements specified in the assignment and is ready for automated testing.


