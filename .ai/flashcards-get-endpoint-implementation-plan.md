# API Endpoint Implementation Plan: GET `/flashcards`

## 1. Przegląd punktu końcowego
Punkt końcowy `GET /flashcards` umożliwia uwierzytelnionemu użytkownikowi pobranie listy swoich fiszek z obsługą paginacji, filtrowania oraz sortowania.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Ścieżka: `/flashcards`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagane)
- Parametry zapytania (Query Parameters):
  - Wymagane (z wartościami domyślnymi):
    - `page` (int, default: 1) – numer strony
    - `limit` (int, default: 10) – liczba elementów na stronę
    - `sort` (string, default: `created_at`) – pole sortowania (`front`, `back`, `source`, `generation_id`, `created_at`, `updated_at`)
    - `order` (string, default: `asc`) – kolejność sortowania (`asc` | `desc`)
  - Opcjonalne:
    - `source` (string) – źródło fiszki (`user` | `ai-gen` | `ai-gen-edited`)
    - `generation_id` (int) – identyfikator generacji powiązanych fiszek

## 3. Wykorzystywane typy
- DTO zapytania: `GetFlashcardsQuery` (zdefiniowany w `src/lib/schemas/flashcards.query.ts`)
- Zod schema: `GetFlashcardsQuerySchema`
- Typ odpowiedzi: `FlashcardsListResponse`, `FlashcardResponse`, `PaginationMeta`

## 4. Szczegóły odpowiedzi
- Status: `200 OK`
- Body (JSON):
  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "string",
        "back": "string",
        "source": "user",
        "generation_id": null,
        "created_at": "2024-01-01T12:00:00Z",
        "updated_at": "2024-01-01T12:00:00Z"
      }
      // ...
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100
    }
  }
  ```
- Możliwe kody odpowiedzi:
  - `200` – pomyślne pobranie danych
  - `400` – nieprawidłowe parametry zapytania
  - `401` – brak uwierzytelnienia lub token wygasł
  - `500` – błąd serwera

## 5. Przepływ danych
1. **Middleware uwierzytelniające** (w `src/middleware/index.ts`) sprawdza i wyciąga `userId` z tokenu JWT.
2. **Handler** (`src/pages/api/flashcards/index.ts`):
   - Parsuje i waliduje query params przy pomocy Zod.
   - Wywołuje serwis `flashcardsService.getFlashcards(userId, filters)`.
3. **flashcardsService** (`src/lib/services/flashcards.service.ts`):
   - Buduje zapytanie do Supabase:
     - `eq('user_id', userId)`
     - warunkowe `.eq('source', source)` / `.eq('generation_id', generation_id)`
     - `.order(sort, { ascending: order === 'asc' })`
     - `.range(offset, offset + limit - 1)`
   - Pobiera dane i łączną liczbę (`count: 'exact'`).
   - Mapuje wynik na `FlashcardResponse[]` i `PaginationMeta`.
4. **Odpowiedź**: Handler zwraca JSON z danymi i metadanymi paginacji.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: middleware wymaga ważnego tokenu JWT.
- Autoryzacja: dane filtrowane po `user_id`, każdy użytkownik widzi tylko własne fiszki.
- Zapobieganie SQL injection: korzystanie z oficjalnego SDK Supabase i predefiniowanych metod.
- Walidacja wejścia:
  - Zod schemas dla query params z ograniczeniami typów i zakresów.

## 7. Obsługa błędów
| Sytuacja                             | Status | Opis                                      |
|--------------------------------------|--------|-------------------------------------------|
| Brak lub niepoprawny token           | 401    | Unauthorized                              |
| Nieprawidłowe parametry (np. page<1) | 400    | Bad Request – walidacja Zod               |
| Błąd połączenia z bazą danych        | 500    | Internal Server Error                     |
| Brak wyników                         | 200    | Pusta lista w `data`, `total = 0`         |

## 8. Rozważania dotyczące wydajności
- Wykorzystanie indeksów w bazie (`user_id`, `created_at`, inne pola sortowania).
- Użycie paginacji opartej na `range` zamiast offsetu może być opcją dla bardzo dużych zestawów.
- Ograniczenie pól w SELECT do niezbędnych.
- Cache'owanie zapytań (np. przy dużej ilości odczytów tych samych parametrów).

## 9. Kroki implementacji
1. Dodanie middleware uwierzytelniającego w `src/middleware/index.ts` (jeśli brak).
2. Utworzenie schematu Zod w `src/lib/schemas/flashcards.query.ts` dla query params.
3. Stworzenie serwisu:
   - `src/lib/services/flashcards.service.ts`
   - Funkcja `getFlashcards(userId: string, filters: QueryParams)`.
4. Implementacja handlera API:
   - `src/pages/api/flashcards/index.ts`:
     - Import middleware, Zod, service.
     - Parsowanie `request.url.searchParams`.
     - Wywołanie serwisu i zwrócenie odpowiedzi.
5. Aktualizacja dokumentacji API (README, OpenAPI spec).