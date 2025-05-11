# Dokument wymagań produktu (PRD) – 10x-cards

## 1. Przegląd produktu
Projekt 10x-cards umożliwia użytkownikom szybkie tworzenie i zarządzanie zestawami fiszek edukacyjnych. Dzięki integracji z modelami LLM aplikacja automatycznie generuje propozycje pytań i odpowiedzi na podstawie dostarczonego tekstu, co znacząco przyspiesza przygotowanie materiałów do nauki.

## 2. Problem użytkownika
Ręczne tworzenie fiszek jest czasochłonne i wymaga dużego nakładu pracy, co zniechęca do korzystania z metody spaced repetition. Użytkownicy potrzebują prostego narzędzia, które automatyzuje proces generowania pytań i odpowiedzi oraz ułatwia organizację zestawów fiszek.

## 3. Wymagania funkcjonalne
1. Automatyczne generowanie fiszek:
   - Użytkownik wkleja dowonly fragment tekstu.
   - Aplikacja wysyła tekst do modelu LLM i odbiera propozycje pytań wraz z odpowiedziami.
   - Lista propozycji jest prezentowana z opcjami akceptacji, edycji lub odrzucenia.

2. Ręczne tworzenie i zarządzanie fiszkami:
   - Formularz dodawania fiszki z polami „Przód” i „Tył”.
   - Możliwość edycji i usuwania fiszek w widoku „Moje fiszki”.

3. System uwierzytelniania:
   - Rejestracja (e-mail, hasło) i logowanie.
   - Opcja usunięcia konta wraz z powiązanymi fiszkami.

4. Integracja z algorytmem powtórek:
   - Wykorzystanie gotowego algorytmu spaced repetition do planowania sesji nauki.
   - Brak zaawansowanych powiadomień w MVP.

5. Przechowywanie danych:
   - Bezpieczne i skalowalne składowanie danych użytkowników i fiszek.

6. Statystyki generowania:
   - Zbieranie danych o liczbie wygenerowanych i zaakceptowanych fiszek.

7. Wymagania prawne:
   - Przetwarzanie danych zgodnie z RODO.
   - Prawo dostępu i usunięcia danych na żądanie użytkownika.

## 4. Granice produktu
1. Poza zakresem MVP:
   - Własny algorytm powtórek (korzystamy z gotowego rozwiązania).
   - Mechanizmy gamifikacji i aplikacje mobilne.
   - Publiczne API i współdzielenie fiszek.
   - Rozbudowane powiadomienia oraz import plików (PDF, DOCX).

## 5. Historyjki użytkowników

Uwaga: Wszystkie funkcje poza rejestracją i logowaniem są dostępne tylko dla zalogowanych użytkowników.

ID: US-001  
Tytuł: Rejestracja konta  
Opis: Jako nowy użytkownik chcę się zarejestrować, aby korzystać z funkcji tworzenia i zarządzania fiszkami.  
Kryteria akceptacji:
- Formularz rejestracyjny zawiera pola na e-mail i hasło.
- Po rejestracji użytkownik otrzymuje potwierdzenie, konto jest aktywowane i następuje automatyczne logowanie.

ID: US-002  
Tytuł: Logowanie do aplikacji  
Opis: Jako zarejestrowany użytkownik chcę się logować, aby mieć dostęp do swoich fiszek i historii generowania.  
Kryteria akceptacji:
- Poprawne dane przekierowują do widoku generowania fiszek.
- Nieprawidłowe dane wyświetlają czytelny komunikat o błędzie.

ID: US-003  
Tytuł: Generowanie fiszek za pomocą AI  
Opis: Jako zalogowany użytkownik chcę wkleić fragment tekstu i wygenerować propozycje fiszek, aby zaoszczędzić czas na ręcznym tworzeniu.  
Kryteria akceptacji:
- Pole tekstowe przyjmuje od 1000 do 10 000 znaków.
- Po kliknięciu przycisku „Generuj” aplikacja komunikuje się z API LLM i wyświetla listę propozycji.
- W razie problemu z API wyświetlany jest czytelny komunikat o błędzie.

ID: US-004  
Tytuł: Przegląd i zatwierdzanie fiszek  
Opis: Jako zalogowany użytkownik chcę przeglądać wygenerowane fiszki i wybierać te, które chcę dodać do mojego zestawu.  
Kryteria akceptacji:
- Lista propozycji wyświetlana jest z opcjami „Zatwierdź”, „Edytuj” i „Odrzuć”.
- Zatwierdzone fiszki można zapisać do bazy danych.

ID: US-005  
Tytuł: Edycja i usuwanie fiszek  
Opis: Jako zalogowany użytkownik chcę modyfikować oraz usuwać istniejące fiszki, aby mieć pełną kontrolę nad materiałami.  
Kryteria akceptacji:
- W widoku „Moje fiszki” każda fiszka ma opcje „Edytuj” i „Usuń”.
- Usunięcie wymaga potwierdzenia przed trwałym skasowaniem.

ID: US-006  
Tytuł: Ręczne tworzenie fiszek  
Opis: Jako zalogowany użytkownik chcę samodzielnie dodać nowe fiszki, aby wprowadzać własne materiały.  
Kryteria akceptacji:
- Widok „Moje fiszki” zawiera przycisk „Dodaj fiszkę”, otwierający formularz z polami „Przód” i „Tył”.
- Nowa fiszka pojawia się na liście po zapisaniu.

ID: US-007  
Tytuł: Sesja nauki  
Opis: Jako zalogowany użytkownik chcę uczyć się fiszek w oparciu o algorytm spaced repetition, aby skuteczniej utrwalać wiedzę.  
Kryteria akceptacji:
- W widoku „Sesja nauki” wyświetlany jest przód fiszki, a użytkownik może odsłonić tył i ocenić poziom opanowania.
- Algorytm dobiera kolejne fiszki zgodnie z zasadami spaced repetition.

## 6. Metryki sukcesu
- 75% wygenerowanych fiszek jest akceptowanych przez użytkowników.
- Użytkownicy tworzą co najmniej 75% nowych fiszek z wykorzystaniem AI.
- Monitorowanie liczby wygenerowanych i zatwierdzonych fiszek dla oceny jakości.
