# 10xCards Database Schema Plan

## 1. Lista tabel z ich kolumnami, typami danych i ograniczeniami

### 1.1. users

This table is managed by Supabase Auth.

- id: UUID PRIMARY KEY
- email: VARCHAR(255) NOT NULL UNIQUE
- encrypted_password: VARCHAR NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- confirmed_at: TIMESTAMPTZ

### 1.2. flashcards

- id: BIGSERIAL PRIMARY KEY
- front: VARCHAR(200) NOT NULL
- back: VARCHAR(500) NOT NULL
- source: VARCHAR NOT NULL CHECK (source IN ('ai-gen', 'ai-gen-edited', 'user'))
- generation_id: BIGINT REFERENCES generations(id) ON DELETE SET NULL
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()

*Trigger: Automatically update the `updated_at` column on record updates.*

### 1.3. generations

- id: BIGSERIAL PRIMARY KEY
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- model: VARCHAR NOT NULL
- generated_count: INT NOT NULL
- accepted_count_unedited: INT NULLABLE
- accepted_count_edited: INT NULLABLE
- source_text_hash: VARCHAR NOT NULL
- source_text_length: INT NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- generation_duration: INTERVAL NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()

### 1.4. error_logs

- id: BIGSERIAL PRIMARY KEY
- user_id: UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- model: VARCHAR NOT NULL
- source_text_hash: VARCHAR NOT NULL
- source_text_length: INT NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- error_code: VARCHAR NOT NULL
- error_message: TEXT NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

## 2. Relacje między tabelami
- users → flashcards: 1:N (flashcards.user_id → users.id)
- users → generations: 1:N (generations.user_id → users.id)
- users → error_logs: 1:N (error_logs.user_id → users.id)
- generations → flashcards: 1:N (flashcards.generation_id → generations.id) [optional]

## 3. Indeksy
- Indeks w tabeli flashcards na kolumnie `user_id`.
- Indeks w tabeli flashcards na kolumnie `generation_id`.
- Indeks w tabeli generations na kolumnie `user_id`.
- Indeks w tabeli error_logs na kolumnie `user_id`.

## 4. Zasady PostgreSQL (Row-Level Security)
- Polityki RLS dla tabeli flashcards, generations oraz error_logs, mają ograniczać dostęp do rekordów z `user_id` odpowiadającemu identyfikatorowi użytkownika z Supabase Auth (np. auth.uid() = user_id).

## 5. Dodatkowe uwagi
- Trigger w tabeli flashcards ma automatycznie aktualizować kolumnę `updated_at` przy każdej modyfikacji rekordu.
