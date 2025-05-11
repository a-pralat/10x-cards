# Architektura UI dla 10xCards

## 1. Przegląd struktury UI
Interfejs użytkownika składa się z zestawu widoków dostępnych po zalogowaniu. Całość korzysta z Tailwind CSS, Shadcn/ui oraz React, zapewniając responsywność i spójność stylu.

## 2. Lista widoków

1. **Ekran uwierzytelniania**
   - **Ścieżka:** `/login` i `/register`
   - **Główny cel:** logowanie i rejestracja użytkownika
   - **Kluczowe informacje:** e-mail, hasło
   - **Kluczowe komponenty:** formularz, walidacja, przyciski, komunikaty błędów
   - **UX, dostępność i bezpieczeństwo:** dostęp klawiaturowy, czytelne etykiety, zabezpieczenia JWT

2. **Panel użytkownika (Profil)**
   - **Ścieżka:** `/profile`
   - **Główny cel:** podgląd i edycja danych konta
   - **Kluczowe informacje:** e-mail, hasło, preferencje użytkownika
   - **Kluczowe komponenty:** formularz edycji, przyciski, powiadomienia typu toast
   - **UX, dostępność i bezpieczeństwo:** logiczny trap focus, ochrona przed CSRF

3. **Generowanie fiszek**
   - **Ścieżka:** `/generate`
   - **Główny cel:** automatyczne tworzenie fiszek za pomocą AI
   - **Kluczowe informacje:** tekst źródłowy (1000–10000 znaków)
   - **Kluczowe komponenty:** pole tekstowe, przycisk generuj, lista propozycji, skeleton, komunikaty o błędach
   - **UX, dostępność i bezpieczeństwo:** walidacja długości, wsparcie czytników ekranu, responsywność

4. **Moje fiszki**
   - **Ścieżka:** `/flashcards`
   - **Główny cel:** przegląd, edycja i usuwanie zapisanych fiszek
   - **Kluczowe informacje:** lista kart (przód/tył), filtrowanie, sortowanie
   - **Kluczowe komponenty:** karta z podglądem, modal edycji, przyciski usuwania z potwierdzeniem
   - **UX, dostępność i bezpieczeństwo:** obsługa klawiatury, opcje paginacji lub infinite scroll

5. **Sesja powtórek**
   - **Ścieżka:** `/session`
   - **Główny cel:** nauka według algorytmu rozłożonych powtórek
   - **Kluczowe informacje:** przód fiszki, odpowiedź, ocena (łatwo/trudno), licznik postępów
   - **Kluczowe komponenty:** wyświetlanie fiszki, przyciski odpowiedzi, pasek postępu, timer
   - **UX, dostępność i bezpieczeństwo:** wysoki kontrast, skróty klawiszowe, minimalizm

## 3. Mapa podróży użytkownika
1. Wejście do aplikacji → ekran logowania/rejestracji.
2. Po uwierzytelnieniu → przekierowanie do generowania fiszek.
3. Użytkownik wprowadza tekst → generacja propozycji.
4. Przegląd propozycji → akceptacja, edycja lub odrzucenie.
5. Zapis wybranych fiszek → potwierdzenie API.
6. Przejście do widoku Moje fiszki → edycja lub usuwanie.
7. Opcjonalnie: rozpoczęcie sesji powtórek.
8. W razie błędów: komunikaty inline.

## 4. Układ i nawigacja
- Główne menu w nagłówku: linki do Generowania, Moich fiszek, Sesji, Profilu i wylogowania.
- Wersja mobilna: menu hamburger.
- Zachowanie kontekstu i danych użytkownika przy przełączaniu widoków.

## 5. Kluczowe komponenty
- Formularze uwierzytelniające (logowanie, rejestracja) z walidacją.
- Komponent generowania fiszek z wskaźnikiem ładowania.
- Lista fiszek z opcją edycji w modalu.
- Modal edycji fiszki z trap focus.
- Toast notifications do komunikatów sukcesu/błędu.
- Menu nawigacji (desktop/mobile).
- Komponent sesji powtórek z oceną i paskiem postępu.
