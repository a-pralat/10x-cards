# Plan implementacji usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter umożliwia komunikację z modelem językowym (LLM) za pośrednictwem API OpenRouter. Jej głównym zadaniem jest generowanie odpowiedzi na podstawie zdefiniowanego komunikatu systemowego i wiadomości użytkownika oraz przetwarzanie tych odpowiedzi do ustrukturyzowanego formatu JSON.

## 2. Opis konstruktora

Konstruktor klasy `OpenRouterService` powinien:
- Inicjalizować konfigurację API (klucz `apiKey`, adres bazowy `baseUrl`).
- Ustawiać domyślne parametry generowania: `temperature`, `top_p`, `frequency_penalty`, `presence_penalty`.
- Pozwalać na ustawienie komunikatów:
  - systemowy (`role: 'system'`)
  - użytkownika (`role: 'user'`)
- Akceptować opcjonalne parametry inicjalizacyjne, takie jak `timeout` i `retries`.

## 3. Publiczne metody i pola

Publiczne metody:
- `sendMessage(userMessage: string): Promise<ChatResponse<T>>`  
  Wysyła wiadomość użytkownika do API, uwzględniając ustawienia komunikatów i parametrów modelu.
- `setMessage(role: 'system' | 'user', content: string): void`  
  Umożliwia zdefiniowanie treści komunikatu dla danej roli.
- `setResponseFormat(format: JsonSchemaFormat): void`  
  Określa schemat JSON do walidacji i parsowania odpowiedzi.
- `setModel(name: string, parameters: ModelParameters): void`  
  Pozwala wybrać model i dostosować jego parametry generowania.

Publiczne pola:
- `apiUrl: string` — adres bazowy API.
- `apiKey: string` — klucz dostępu.
- `defaultModel: string` — domyślnie wybrany model.
- `defaultParams: ModelParameters` — domyślne parametry generowania.

## 4. Prywatne metody i pola

Prywatne metody:
- `prepareRequestPayload(): RequestPayload`  
  Buduje obiekt żądania:
  ```ts
  {
    messages: [
      { role: 'system', content: currentSystemMessage },
      { role: 'user', content: currentUserMessage }
    ],
    response_format: currentResponseFormat,
    model: currentModelName,
    parameters: currentModelParameters
  }
  ```
- `performRequest(requestPayload: RequestPayload): Promise<ApiResponse>`  
  Wysyła żądanie POST do API z mechanizmem retry i backoff, zwraca surową odpowiedź.

Prywatne pola:
- `currentSystemMessage: string`
- `currentUserMessage: string`
- `currentResponseFormat: JsonSchemaFormat`
- `currentModelName: string`
- `currentModelParameters: ModelParameters`

## 5. Obsługa błędów

- Walidacja odpowiedzi API pod kątem zgodności ze schematem JSON.
- Obsługa błędów sieciowych (np. timeout, utrata połączenia) z retry i backoffem.
- Rzucanie dedykowanych wyjątków:
  - `AuthError`
  - `RateLimitError`
  - `ValidationError`
  - `NetworkError`
- Bezpieczne logowanie błędów bez ujawniania danych wrażliwych.

## 6. Kwestie bezpieczeństwa

- Przechowywanie kluczy API w zmiennych środowiskowych.
- Unikanie logowania wrażliwych danych (np. pełnych ładunków z kluczem API).
- Wymuszanie połączeń HTTPS.
- Sanityzacja i weryfikacja danych wejściowych.

## 7. Plan wdrożenia krok po kroku

1. Analiza wymagań i konfiguracja projektu  
   - Przegląd dokumentacji API OpenRouter.  
   - Weryfikacja zależności (Astro, TypeScript, React, Tailwind, Shadcn/ui).
2. Implementacja klienta API  
   - Utworzenie pliku `src/lib/services/openrouter.service.ts`.  
   - Zaimplementowanie funkcji do:
     - inicjalizacji konfiguracji (`constructor`)
     - ustawiania wiadomości (`setMessage`)
     - ustawiania formatu odpowiedzi (`setResponseFormat`)
     - ustawiania modelu i parametrów (`setModel`)
     - wysyłania wiadomości (`sendMessage`)
   - Metoda `prepareRequestPayload()` do budowy żądania.
   - Metoda `performRequest()` z retry/backoff i mapowaniem błędów.  
   - Walidacja i mapowanie odpowiedzi na `ChatResponse<T>`.
3. Logika czatu  
   - Metoda `sendMessage()` łączy komunikaty, model i parametry.  
   - Możliwość dynamicznej modyfikacji konfiguracji w trakcie działania.
4. Obsługa odpowiedzi strukturalnych  
   - Parsowanie surowych danych.
5. Zarządzanie błędami  
   - Rzucanie zdefiniowanych wyjątków i bezpieczne logowanie.
