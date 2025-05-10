# API Endpoint Implementation Plan: POST /generations

## 1. Przegląd punktu końcowego
Inicjalizacja generowania fiszek przez AI na podstawie tekstu użytkownika. Endpoint przyjmuje długi tekst, deleguje go do usługi AI, zapisuje metadane generacji i zwraca propozycje fiszek.

## 2. Szczegóły żądania
- Metoda HTTP: POST  
- URL: `/generations`  
- Nagłówki:  
  - `Content-Type: application/json`  
  - `Authorization: Bearer <token>` (Supabase Auth)  
- Body (JSON):  
  - `source_text` (string) – długość między 1000 a 10000 znaków

## 3. Wykorzystywane typy
- DTO wejściowy: `GenerateFlashcardsRequest`
- Zod schema: `GenerateFlashcardsSchema`
- Typy odpowiedzi: `GenerationCreateResponse`, `FlashcardProposal`  
- Modele bazy danych: tabele `generations` i `error_logs`

## 4. Szczegóły odpowiedzi
<!-- - 201 Created   -->
  ```json
  {
    "generation_id": 123,
    "flashcards_proposals": [
      { "front": "Pytanie", "back": "Odpowiedź", "source": "ai-gen" }
    ],
    "generated_count": 5
  }
  ```
- 400 Bad Request – błędy walidacji wejścia (ZodError)  
- 401 Unauthorized – brak lub nieprawidłowy token  
- 500 Internal Server Error – błąd AI lub bazy danych

## 5. Przepływ danych
1. **Middleware uwierzytelniające** (Astro) weryfikuje token, ustawia `locals.supabase` i `locals.user.id`.  
2. **Handler POST**:  
   - Parsuje ciało żądania i waliduje `source_text` przez `GenerateFlashcardsSchema`.  
   - Oblicza `source_text_hash` (np. SHA-256) i `source_text_length`.  
   - Wywołuje serwis AI (`generationService.callAI(model, source_text)`), mierząc czas wywołania.  
   - Tworzy rekord w tabeli `generations` z polami:  
     - `user_id`, `model`, `generated_count`, `source_text_hash`, `source_text_length`, `generation_duration`.  
3. Zwraca klientowi odpowiedź z `generation_id`, `flashcards_proposals` i `generated_count`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie i autoryzacja**: Supabase Auth; operacja dozwolona tylko dla właściciela (`locals.user.id`).  
- **Walidacja wejścia**: ścisła, po stronie serwera przez Zod.  
- **Bezpieczeństwo DB**: zapytania parametryzowane przez SupabaseClient.  
- **Ochrona przed nadużyciami**: rozważ rate limiting lub throttling dla dużych payloadów.

## 7. Obsługa błędów
- **ZodError** → HTTP 400 + szczegóły błędu walidacji w odpowiedzi.  
- **Brak `locals.user`** → HTTP 401.  
- **Błąd AI lub DB** →  
  1. Wstawienie rekordu do `error_logs` z polami: `user_id`, `model`, `source_text_hash`, `source_text_length`, `error_code`, `error_message`.  
  2. Zwrócenie HTTP 500 + ogólny komunikat o błędzie.

## 8. Rozważania dotyczące wydajności
- Ograniczenie długości wejścia do 10000 znaków chroni przed nadmiernym obciążeniem.  
- Wywołanie AI asynchroniczne z ustawionym timeoutem.  
- Opcjonalne: cache na bazie `source_text_hash` w celu deduplikacji i przyspieszenia powtórnych żądań.  
- Monitorowanie czasu odpowiedzi AI i czasu zapisu do bazy.

## 9. Kroki implementacji
1. W `src/pages/api/generations.ts` zdefiniować `GenerateFlashcardsSchema` (Zod).  
2. Utworzyć serwis w `src/lib/generation.service.ts` z funkcją `generateFlashcards(userId: string, sourceText: string): Promise<GenerationCreateResponse>`.  
3. Dodać endpoint w `src/pages/api/generations.ts`:  
   - `export const prerender = false;`  
   - `export async function POST({ request, locals }) { ... }`  
4. W handlerze zaimplementować: parsowanie JSON, walidację, obliczenia hash i długości, wywołanie serwisu AI, zapis do DB i zwrot odpowiedzi.  
5. Obsłużyć błędy w `catch`: logowanie do `error_logs` i zwrot odpowiedniego statusu (400/401/500).  
6. Napisać testy jednostkowe i integracyjne:  
   - poprawna walidacja schemy,  
   - sukces generacji,  
   - obsługa błędów AI i autoryzacji.  
7. Zaktualizować dokumentację projektu (README, API docs). 