# Plan Testów

## 1. Wprowadzenie i cele testowania  
Celem testów jest zapewnienie stabilności i jakości kluczowych funkcjonalności aplikacji: logowania/wylogowania, generowania fiszek oraz procesu ich akceptacji. Testy mają wykryć błędy na poziomie jednostkowym, integracyjnym i end-to-end, a także zweryfikować obsługę błędów i wymagania bezpieczeństwa.

## 2. Zakres testów  
- Interfejs użytkownika (formularze logowania, rejestracji, generowania fiszek, lista propozycji)  
- Logika biznesowa (walidacja danych wejściowych, stan ładowania, bulk actions)  
- API REST (`/api/auth/login`, `/api/auth/logout`, `/api/generations`, `/api/flashcards`)  
- Integracja z Supabase (autoryzacja, przechowywanie i pobieranie danych)  
- Uprawnienia i bezpieczeństwo (tylko zalogowani użytkownicy, role)

## 3. Typy testów do przeprowadzenia  
- Testy jednostkowe (Vitest) dla funkcji walidacji i helperów  
- Testy integracyjne (Testing Library) dla komponentów React/Astro (formularze, listy)  
- Testy UI komponentów (Storybook) dla izolowanego testowania i dokumentacji interfejsu
- Testy API (MSW - Mock Service Worker) dla punktów końcowych  
- Testy end-to-end (Playwright) symulujące pełne ścieżki użytkownika  
- Testy wydajnościowe (Web Vitals + Lighthouse CI)  
- Testy bezpieczeństwa (Snyk + OWASP ZAP)

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Logowanie / wylogowanie  
- Logowanie z poprawnymi danymi → przekierowanie na stronę główną, token w sesji  
- Logowanie z niepoprawnym e-mailem/hasłem → komunikat o błędzie  
- Próba dostępu do chronionych zasobów bez zalogowania → przekierowanie na `/login`  
- Wylogowanie → usunięcie sesji, powrót do ekranu logowania

### 4.2 Generowanie fiszek  
- Wprowadzenie prawidłowego tekstu źródłowego → przycisk "Generuj" aktywny, wyświetlenie fiszek  
- Walidacja pustego lub niepoprawnego inputu → zablokowanie przycisku, komunikat walidacji  
- Symulacja opóźnienia/API error → wyświetlenie stanu ładowania i komunikatu o błędzie  
- Generacja wielu fiszek naraz (bulk) → poprawne renderowanie listy, obsługa paginacji/wersji

### 4.3 Proces akceptacji fiszek  
- Pobranie listy propozycji → wyświetlenie pozycji w `FlashcardProposalList`  
- Zatwierdzenie pojedyncze → wywołanie endpointu, usunięcie pozycji z listy  
- Zatwierdzenie zbiorcze (`FlashcardBulkActions`) → masowe zatwierdzenie, odświeżenie listy  
- Próba akcji bez odpowiednich uprawnień → błąd 403, adekwatny komunikat  
- Błąd serwera podczas akceptacji → rollback UI, komunikat błędu

## 5. Środowisko testowe  
- Node.js v18+, TypeScript 5, Astro 5  
- Bazodanowy staging Supabase z odseparowanymi danymi testowymi  
- Przeglądarki Chrome/Firefox/WebKit (Playwright)  
- MSW do mockowania wywołań API (OpenAI, zewnętrzne serwisy)
- GitHub Actions jako platforma CI/CD do automatyzacji testów

## 6. Narzędzia do testowania  
- Vitest + Testing Library (testy jednostkowe i integracyjne)  
- Storybook (izolowane testowanie komponentów UI)
- Zod (walidacja typów i schematów w testach i kodzie produkcyjnym)
- Playwright (E2E)  
- MSW - Mock Service Worker (API)  
- ESLint + SonarLint (statyczna analiza)  
- Web Vitals + Lighthouse CI (wydajność)  
- Snyk + OWASP ZAP (testy bezpieczeństwa)

## 7. Harmonogram testów  
| Faza                        | Zakres                                   | Czas trwania |  
|-----------------------------|------------------------------------------|--------------|  
| Przygotowanie środowiska    | Konfiguracja testów, MSW, Storybook, Zod | 3 dni        |  
| Testy jednostkowe           | Funkcje walidacji, helpery, API clients  | 5 dni        |  
| Testy integracyjne          | Komponenty React/Astro                   | 5 dni        |  
| Storybook i dokumentacja UI | Izolowane komponenty i warianty          | 3 dni        |
| Testy API                   | Pełne ścieżki z MSW: /auth, /generations, /flashcards | 3 dni |  
| Testy E2E                   | Logowanie → generowanie → akceptacja     | 5 dni        |  
| Testy wydajności i bezpieczeństwa | Lighthouse CI, Web Vitals, Snyk, OWASP | 4 dni    |  
| Regression & Release        | Ostateczna weryfikacja, raport           | 3 dni        |

## 8. Kryteria akceptacji testów  
- ≥ 95% pokrycia kodu testami jednostkowymi i integracyjnymi  
- Wszystkie komponenty UI udokumentowane w Storybook
- Zero krytycznych i wysokich błędów w raportach E2E  
- Zielone buildy GitHub Actions (kod + testy) przez 5 kolejnych pusherów  
- Lighthouse score ≥ 90 dla wszystkich Core Web Vitals
- Brak regresji w kluczowych ścieżkach użytkownika
- Brak podatności bezpieczeństwa wysokiego ryzyka wykrytych przez Snyk

## 9. Role i odpowiedzialności w procesie testowania  
- QA Lead: koordynacja planu, raportowanie postępów  
- Inżynier QA: pisanie i utrzymanie testów, analiza wyników  
- Developer: szybkie naprawy defectów, wsparcie w mockach MSW i Storybook
- Product Owner: akceptacja kryteriów testowych

## 10. Procedury raportowania błędów  
1. Tworzenie ticketu w JIRA z etykietą "BUG"  
2. Obowiązkowe pola: kroki reprodukcji, oczekiwany rezultat, rezultat faktyczny, środowisko, zrzuty ekranu/logi  
3. Priorytetyzacja wg stopnia wpływu (Critical, High, Medium, Low)  
4. Automatyczne powiadomienie zespołu via Slack/Teams  
5. Weryfikacja naprawy przez QA po wdrożeniu poprawki 