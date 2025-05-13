# API Endpoint Implementation Plan: DELETE /flashcards/{id}

## 1. Przegląd punktu końcowego
Usunięcie pojedynczej fiszki przypisanej do zalogowanego użytkownika.

## 2. Szczegóły żądania
- Metoda HTTP: DELETE  
- URL: `/flashcards/{id}`  
- Nagłówki:  
  - `Authorization: Bearer <token>` (wymagany)  
- Body: brak  
- Parametry:  
  - `id` (ścieżkowy, number): identyfikator fiszki  

## 3. Wykorzystywane typy
- Zod schema: `DeleteFlashcardParamsSchema`  
- Parametr: `number`  
- DTO odpowiedzi: `DeleteFlashcardResponse`  

## 4. Szczegóły odpowiedzi
- 200 OK  
  ```json
  { "message": "Flashcard deleted successfully." }
  ```
- 400 Bad Request  
- 401 Unauthorized  
- 404 Not Found  
- 500 Internal Server Error  

## 5. Przepływ danych
1. Middleware Astro weryfikuje token i ustawia `locals.supabase` oraz `locals.user.id`.  
2. Parser ścieżki wyodrębnia `id`, walidacja przez `DeleteFlashcardParamsSchema`.  
3. Wywołanie `flashcardsService.deleteFlashcard(userId, id)`:  
   1. SELECT `id` WHERE `id` i `user_id`  
   2. Jeżeli brak → rzuć `NotFoundError`  
   3. DELETE z tymi samymi warunkami  
4. Zwrócenie 200 OK z komunikatem sukcesu  

## 6. Względy bezpieczeństwa
- Autoryzacja: tylko właściciel zasobu może usuwać.  
- Uwierzytelnianie: JWT Supabase.  
- SQL Injection: użycie Supabase SDK.  
- Ograniczanie szybkości (rate limiting) w middleware.  

## 7. Obsługa błędów
- 400: niepoprawny `id`.  
- 401: brak/nieprawidłowy token.  
- 404: fiszka nie istnieje lub nie należy do użytkownika.  
- 500: wewnętrzny błąd serwera (loguj do `error_logs`).  

## 8. Rozważania dotyczące wydajności
- Zapytania na indeksowanym PK – szybkie.  
- Jeden SELECT i DELETE zamiast wielu wywołań.  

## 9. Kroki implementacji
1. Zdefiniować `DeleteFlashcardParamsSchema` w `src/lib/flashcard-delete/flashcard.schema.ts`.  
2. Utworzyć metodę `deleteFlashcard(userId: string, flashcardId: number)` w `src/flashcard-delete/services/flashcard.service.ts`.  
3. Implementować handler w `src/pages/api/flashcards/[id].ts`:  
   - `export const prerender = false`;  
   - Parsowanie, walidacja, wywołanie serwisu, zwrot odpowiedzi.  
4. Dodać obsługę błędów i logowanie.
5. Zaktualizować dokumentację API i README. 