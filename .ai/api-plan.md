# REST API Plan

## 1. Resources

- **Users**
  - *Database Table*: `users`
  - Managed through Supabase Auth; operations such as registration and login may be handled via Supabase or custom endpoints if needed.

- **Flashcards**
  - *Database Table*: `flashcards`
  - Fields: `id`, `front`, `back`, `source`, `generation_id`, `user_id`, `created_at`, `updated_at`.

- **Generations**
  - *Database Table*: `generations`
  - Fields: `id`, `user_id`, `model`, `generated_count`, `accepted_count_unedited`, `accepted_count_edited`, `source_text_hash`, `source_text_length`, `generation_duration`, `created_at`, `updated_at`.

- **Error Logs**
  - *Database Table*: `error_logs`
  - Fields: `id`, `user_id`, `model`, `source_text_hash`, `source_text_length`, `error_code`, `error_message`, `created_at`.

## 2. Endpoints

### 2.1 Flashcards

#### GET `/flashcards`
- Description: Retrieve a paginated, filtered, and sortable list of flashcards for the authenticated user.
- Query Parameters:
  - `page` (int, default: 1)
  - `limit` (int, default: 10)
  - `sort` (string, default: `created_at`)
  - `order` (`asc` | `desc`, default: `asc`)
  - Optional filters: `source` (`user` | `ai-gen` | `ai-gen-edited`), `generation_id` (int)
- Response (200):
  ```json
  {
    "data": [ /* Flashcard[] */ ],
    "pagination": { "page": 1, "limit": 10, "total": 100 }
  }
  ```
- Errors:
  - 401 Unauthorized

#### GET `/flashcards/{id}`
- Description: Retrieve details for a specific flashcard.
- Response (200): Flashcard object
- Errors:
  - 401 Unauthorized
  - 404 Not Found

#### POST `/flashcards`
- Description: Create one or more flashcards (user or AI-generated).
- Request Body:
  ```json
  {
    "flashcards": [
      {
        "front": "string (≤200)",
        "back": "string (≤500)",
        "source": "user" | "ai-gen" | "ai-gen-edited",
        "generation_id": int | null
      }
    ]
  }
  ```
- Validations:
  - `front`: max 200 chars
  - `back`: max 500 chars
  - `source`: one of `user`, `ai-gen`, `ai-gen-edited`
  - `generation_id`: must be null for `user`; required for `ai-gen` or `ai-gen-edited`
- Response (201):
  ```json
  {
    "flashcards": [ /* Flashcard[] */ ]
  }
  ```
- Errors:
  - 400 Bad Request (validation errors)
  - 401 Unauthorized

#### PUT `/flashcards/{id}`
- Description: Edit an existing flashcard.
- Request Body (one or both):
  ```json
  {
    "front": "string (≤200)",
    "back": "string (≤500)"
  }
  ```
- Response (200): Updated Flashcard object
- Errors:
  - 400 Bad Request
  - 401 Unauthorized
  - 404 Not Found

#### DELETE `/flashcards/{id}`
- Description: Delete a flashcard.
- Response (200):
  ```json
  { "message": "Flashcard deleted successfully." }
  ```
- Errors:
  - 401 Unauthorized
  - 404 Not Found

### 2.2 Generations

#### POST `/generations`
- Description: Initiate AI generation of flashcard proposals based on user-provided text.
- Request Body:
  ```json
  { "source_text": "string (1000–10000 chars)" }
  ```
- Validations:
  - `source_text` length must be between 1000 and 10000 characters
- Business Logic:
  - Compute `source_text_hash` for deduplication
  - Call AI service to generate proposals
  - Persist generation metadata (`model`, `generated_count`, `source_text_hash`, `source_text_length`, `generation_duration`)
- Response (201):
  ```json
  {
    "generation_id": 123,
    "flashcards_proposals": [
      { "front": "string", "back": "string", "source": "ai-gen" }
    ],
    "generated_count": 5
  }
  ```
- Errors:
  - 400 Bad Request
  - 500 Internal Server Error (AI failures logged in `error_logs`)

#### GET `/generations`
- Description: Retrieve a paginated list of generation requests for the authenticated user.
- Query Parameters:
  - `page` (int, default: 1)
  - `limit` (int, default: 10)
- Response (200):
  ```json
  {
    "data": [ /* Generation[] */ ],
    "pagination": { "page": 1, "limit": 10, "total": 50 }
  }
  ```
- Errors:
  - 401 Unauthorized

#### GET `/generations/{id}`
- Description: Retrieve detailed information for a specific generation, including its flashcards.
- Response (200):
  ```json
  {
    "generation": { /* Generation object */ },
    "flashcards": [ /* Flashcard[] */ ]
  }
  ```
- Errors:
  - 401 Unauthorized
  - 404 Not Found

### 2.3 Error Logs

#### GET `/error-logs`
- Description: Retrieve error logs for AI flashcard generation (user-specific or admin).
- Response (200):
  ```json
  [ /* ErrorLog[] */ ]
  ```
- Errors:
  - 401 Unauthorized
  - 403 Forbidden

## 3. Authentication and Authorization

- Mechanism: Bearer token via Supabase Auth
- Protected endpoints enforce RLS based on `user_id`
- Use HTTPS, secure error messages, and rate limiting

## 4. Validation and Business Logic

- **Flashcards**:
  - `front`: max 200 chars
  - `back`: max 500 chars
  - `source`: `user` | `ai-gen` | `ai-gen-edited`
  - `generation_id` consistency by source
- **Generations**:
  - `source_text`: length 1000–10000 chars
  - `source_text_hash`: computed server-side
- **General**:
  - Input validation at API layer and database
  - Meaningful error messages and logging
  - Pagination with `page`/`limit` and metadata
