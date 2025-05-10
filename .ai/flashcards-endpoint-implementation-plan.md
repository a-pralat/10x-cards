# API Endpoint Implementation Plan: POST /flashcards

## 1. Przegląd punktu końcowego
Tworzenie jednej lub wielu fiszek (flashcards), zarówno dodanych przez użytkownika, jak i wygenerowanych przez AI.

## 2. Szczegóły żądania
- Metoda HTTP: POST  
- URL: `/api/flashcards`  
- Nagłówki:  
  - `Content-Type: application/json`  
  - `Authorization: Bearer <token>` (wymagany)  
- Body (JSON):  
  ```json
  {
    "flashcards": [
      { "front": "...", "back": "...", "source": "user", "generation_id": null }
    ]
  }
  ```
- Parametry:
  - `flashcards`: tablica obiektów `CreateFlashcardRequest`
    - `front` (string, max 200)
    - `back` (string, max 500)
    - `source` (`"user"` | `"ai-gen"` | `"ai-gen-edited"`)
  - `generation_id` (number) – wymagane, gdy `source` = `"ai-gen"` lub `"ai-gen-edited"`; niedozwolone, gdy `source` = `"user"`.

## 3. Wykorzystywane typy
- DTO wejściowy: `CreateFlashcardsRequest`  
- Zod schema: `CreateFlashcardsSchema`  
- Typ pojedynczej fiszki: `CreateFlashcardRequest`  
- Typ odpowiedzi: `FlashcardResponse`  
- Typ insercji wewnętrzny: `FlashcardInsert`  

## 4. Szczegóły odpowiedzi
- 201 Created  
  ```json
  {
    "flashcards": [
      {
        "id": 1,
        "front": "...",
        "back": "...",
        "source": "user",
        "generation_id": null,
        "created_at": "...",
        "updated_at": "..."
      }
    ]
  }
  ```
- 400 Bad Request – błędy walidacji wejścia (ZodError, reguły warunkowe)  
- 401 Unauthorized – brak lub nieprawidłowy token  
- 404 Not Found – `generation_id` nie istnieje lub nie należy do użytkownika  
- 500 Internal Server Error – błąd serwera  

## 5. Przepływ danych
1. Middleware uwierzytelniające (Astro) weryfikuje token, ustawia `locals.supabase` i `locals.user.id`.  
2. Handler POST w `src/pages/api/flashcards.ts`:  
   - `export const prerender = false;`  
   - Parsowanie JSON i walidacja przy użyciu `CreateFlashcardsSchema`.  
   - Weryfikacja warunkowa `generation_id` w `.superRefine`.  
   - Brak użytkownika → 401 Unauthorized.  
3. Inicjalizacja serwisu:  
   ```ts
   const service = new FlashcardService(locals.supabase);
   ```  
4. Wywołanie serwisu i zapis do DB:  
   ```ts
   const flashcards = await service.createFlashcards(validated.flashcards, user.id);
   ```  
5. Zwrócenie odpowiedzi 201 wraz z utworzonymi fiszkami.  

## 6. Względy bezpieczeństwa
- Uwierzytelnianie i autoryzacja za pomocą Supabase Auth.  
- Sprawdzenie właściciela `generation_id`, by zapobiec dodawaniu cudzych danych.  
- Sanitization wejścia i ochrona przed SQL injection dzięki parametryzowanym zapytaniom Supabase Client.  

## 7. Obsługa błędów
- ZodError → 400 Bad Request + szczegóły błędów walidacji.  
- Brak użytkownika w `locals` → 401 Unauthorized.  
- `generation_id` nie istnieje lub nie należy do użytkownika → 404 Not Found.  
- Błędy bazy danych lub nieoczekiwane wyjątki → 500 Internal Server Error.  

## 8. Rozważania dotyczące wydajności
- Bulk insert wielu wierszy jednocześnie, by zminimalizować round-trip.  
- Limitowanie maksymalnej liczby fiszek w jednym żądaniu (np. 50+) by unikać przeciążeń.  

## 9. Kroki implementacji
1. Zdefiniować `CreateFlashcardsSchema` w `src/pages/api/flashcards.ts`.  
2. Utworzyć serwis `FlashcardService` w `src/lib/flashcard.service.ts` z metodą `createFlashcards(userId: string, flashcards: CreateFlashcardRequest[]): Promise<FlashcardResponse[]>`.  
3. W handlerze POST: ustawić `export const prerender = false;`, parsować i walidować body, uwierzytelniać, wywołać serwis i zwrócić odpowiedź 201.  
4. Obsłużyć błędy 400, 401, 404 i 500 w bloku `try/catch`.  
5. Napisać testy jednostkowe i integracyjne dla endpointu.  
6. Zaktualizować dokumentację projektu (README, API docs). 