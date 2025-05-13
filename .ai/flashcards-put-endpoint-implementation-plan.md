# API Endpoint Implementation Plan: PUT /flashcards/{id}

## 1. Przegląd punktu końcowego
Endpoint służy do edycji istniejącej fiszki użytkownika. Umożliwia aktualizację jednego lub obu pól `front` i `back` z zachowaniem walidacji i autoryzacji.

## 2. Szczegóły żądania
- Metoda HTTP: PUT  
- URL: `/api/flashcards/{id}`  
- Nagłówki:  
  - `Content-Type: application/json`  
  - `Authorization: Bearer <token>` (wymagany)  
- Body (JSON):  
  - `front` (string, opcjonalne; maks. 200 znaków)  
  - `back` (string, opcjonalne; maks. 500 znaków)  
  - Wymaganie: co najmniej jedno z pól musi być obecne  
- Parametry ścieżki:  
  - `id` (BIGINT) – identyfikator fiszki, liczba całkowita > 0  

## 3. Wykorzystywane typy
- DTO wejściowy: `UpdateFlashcardRequest`  
- Zod schema: `updateFlashcardSchema`  
- Typ odpowiedzi: `FlashcardResponse`  

## 4. Szczegóły odpowiedzi
- 200 OK  
- Content-Type: application/json  
- Body (JSON) – `FlashcardResponse`:  
  ```json
  {
    "id": 123,
    "front": "Nowa wartość front",
    "back": "Nowa wartość back",
    "source": "user",
    "generation_id": null,
    "user_id": "uuid-uzytkownika",
    "created_at": "2025-01-01T12:00:00Z",
    "updated_at": "2025-05-15T15:30:00Z"
  }
  ```

## 5. Przepływ danych
1. Middleware Astro/Supabase uwierzytelnia i ustawia `locals.supabase` i `locals.user`.  
2. Parsowanie parametru `id` z URL i walidacja (number > 0).  
3. Parsowanie i walidacja body za pomocą Zod schema (`updateFlashcardSchema`).  
4. Inicjalizacja serwisu:  
   ```ts
   const service = new FlashcardService(locals.supabase);
   ```  
5. Wywołanie serwisu:  
   ```ts
   const updated = await service.updateFlashcard(id, validatedBody, locals.user.id);
   ```  
6. Jeśli `updated` jest `null`, zwrócić 404 Not Found.  
7. Zwrócić 200 OK oraz obiekt `updated`.  

## 6. Względy bezpieczeństwa
- Autoryzacja: tylko właściciel fiszki (`user_id`).  
- Parametryzowane zapytania Supabase (ochrona przed SQL injection).  
- Walidacja wejścia: Zod + guard clauses.  
- Ograniczenie pól (zapobieganie mass-assignment).  

## 7. Obsługa błędów
- 400 Bad Request:  
  - Brak obu pól w body.  
  - Przekroczenie limitu znaków.  
  - `id` nie jest poprawną liczbą.  
- 401 Unauthorized:  
  - Brak lub nieważny token.  
- 404 Not Found:  
  - Nie znaleziono fiszki lub należy do innego użytkownika.  
- 500 Internal Server Error:  
  - Nieoczekiwany błąd serwera lub błąd Supabase.  

Każdy błąd zwraca:  
```json
{ "error": "Opis błędu" }
```

## 8. Rozważania dotyczące wydajności
- Pojedyncze zapytanie do bazy.  
- Indeksy na kolumnach `id` i `user_id`.  
- Minimalizacja zapytań (brak batchy i dodatkowych fetchy).  

## 9. Kroki implementacji
1. Utworzyć Zod schema `updateFlashcardSchema` w `src/lib/schemas/flashcards.ts`.  
2. Rozwinąć lub utworzyć `FlashcardService.updateFlashcard` w `src/lib/services/flashcards.ts`.  
3. Napisać handler PUT w `src/pages/api/flashcards/[id].ts` z `export const prerender = false;`.  
4. Dodać middleware autoryzacyjne w `src/middleware/index.ts` (jeśli nie istnieje).  
5. Napisać testy integracyjne (Vitest + MSW) i jednostkowe dla schematu.  
6. Zaktualizować dokumentację projektu i README.  
7. Code review i merge do CI/CD.