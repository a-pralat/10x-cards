# Plan implementacji widoku Generowania Fiszek

## 1. Przegląd
Widok Generowania Fiszek umożliwia użytkownikowi wprowadzenie lub wklejenie tekstu źródłowego o długości od 1000 do 10000 znaków. Po kliknięciu przycisku "Generuj fiszki" dane są przesyłane do API, które zwraca zestaw propozycji kart generowanych przez silnik AI. Użytkownik może:
1. przeglądać każdą propozycję,
2. akceptować lub odrzucać wybrane fiszki,
3. edytować zawartość kart (front ≤200 znaków, back ≤500 znaków).

Ostatecznie użytkownik może zapisać wszystkie wygenerowane fiszki lub tylko te zaakceptowane do bazy danych.

## 2. Routing widoku
Strona generowania fiszek jest dostępna pod adresem `/generate`. Należy utworzyć plik `src/pages/generate.astro`, który renderuje główny komponent `FlashcardGeneratorView`.

## 3. Struktura komponentów

```plaintext
src/pages/generate
└── (1) FlashcardGeneratorView [4.1]
    ├── (1.1) SourceTextInput [4.2]
    ├── (1.2) GenerateFlashcardsButton [4.3]
    ├── (1.3) LoadingSkeleton [4.6]
    ├── (1.4) ErrorAlert [4.7]
    ├── (1.5) FlashcardProposalList [4.4]
    │    └── (1.5.1) FlashcardProposalItem [4.5]
    └── (1.6) FlashcardBulkActions [4.8]
```

- **FlashcardGeneratorView** – główny kontener widoku generowania fiszek, zarządza stanem i integruje wszystkie podkomponenty.
- **SourceTextInput** – `<textarea>` do wprowadzania tekstu źródłowego z walidacją długości (1000–10000 znaków).
- **GenerateFlashcardsButton** – przycisk uruchamiający żądanie generowania fiszek, aktywny po spełnieniu walidacji.
- **LoadingSkeleton** – wizualny wskaźnik ładowania podczas oczekiwania na odpowiedź z API.
- **ErrorAlert** – komponent wyświetlający komunikaty o błędach związanych z walidacją lub API.
- **FlashcardProposalList** – kontener listy propozycji fiszek, deleguje akcje do poszczególnych elementów.
- **FlashcardProposalItem** – element listy z propozycją fiszki, umożliwia zatwierdzenie, edycję (front ≤200, back ≤500) lub odrzucenie.
- **FlashcardBulkActions** – przyciski "Zapisz wszystkie" i "Zapisz zaakceptowane" fiszki, z warunkami aktywacji.

## 4. Szczegóły komponentów

### 4.1. FlashcardGeneratorView
- **Opis**: Integruje wszystkie podkomponenty widoku generowania.
- **Zdarzenia**: onChange tekstu, onClick generowania, akcje na kartach (accept/edit/reject), onClick zapisu.
- **Walidacja**: `source_text.length` 1000–10000.
- **Typy**: używa `GenerateFlashcardsRequest` i otrzymuje `GenerationCreateResponse`.
- **Propsy**: opcjonalne callbacki np. po zapisie.

### 4.2. SourceTextInput
- **Opis**: Pole `<textarea>` z placeholderem.
- **Zdarzenia**: onChange aktualizuje stan tekstu.
- **Walidacja wewnętrzna**: długość 1000–10000 znaków.
- **Typy**: lokalny `string`, przy wysyłce `GenerateFlashcardsRequest`.
- **Propsy**: `value: string`, `onChange: (val: string) => void`, `placeholder: string`.

### 4.3. GenerateFlashcardsButton
- **Opis**: Przycisk "Generuj fiszki".
- **Zdarzenia**: onClick wywołuje API.
- **Warunki**: aktywny gdy tekst spełnia walidację i nie trwa ładowanie.
- **Propsy**: `onClick`, `disabled: boolean`.

### 4.4. FlashcardProposalList
- **Opis**: Wyświetla listę `FlashcardProposalViewModel`.
- **Zdarzenia**: forward onAccept, onEdit, onReject dla każdego `FlashcardProposalItem`.
- **Propsy**: `flashcards: FlashcardProposalViewModel[]`, `onAccept`, `onEdit`, `onReject`.

### 4.5. FlashcardProposalItem
- **Opis**: Jedna propozycja fiszki z przyciskami: Zatwierdź, Edytuj, Odrzuć.
- **Zdarzenia**: onAccept, onEdit, onReject.
- **Walidacja edycji**: `front.length` ≤200, `back.length` ≤500.
- **Typy**: lokalny stan `FlashcardProposalViewModel` z polami `accepted` i `edited`.
- **Propsy**: `flashcard: FlashcardProposalViewModel`.

### 4.6. LoadingSkeleton
- **Opis**: Stateless skeleton UI.
- **Propsy**: opcjonalne style.

### 4.7. ErrorAlert
- **Opis**: Wyświetla komunikat błędu.
- **Propsy**: `message: string` (niepusty).

### 4.8. FlashcardBulkActions
- **Opis**: Dwa przyciski: "Zapisz wszystkie" i "Zapisz zaakceptowane".
- **Zdarzenia**: onClick wskazujące, które fiszki wysłać.
- **Warunki**: aktywne gdy są fiszki do zapisu.
- **Typy**: używa `CreateFlashcardsRequest`.
- **Propsy**: `onSaveAll`, `onSaveAccepted`, `disabled: boolean`.

## 5. Typy (z `src/types.ts`)
- **GenerateFlashcardsRequest**: `{ source_text: string }` – żądanie do POST `/generations`.
- **GenerationCreateResponse**: `{ generation_id: number; flashcards_proposals: FlashcardProposal[]; generated_count: number }` – odpowiedź z POST `/generations`.
- **FlashcardProposal**: `{ front: string; back: string; source: "ai-gen" }` – pojedyncza propozycja.
- **FlashcardProposalViewModel**: rozbudowany model z polami:
  - `front: string`
  - `back: string`
  - `source: Source` (`"ai-gen" | "ai-gen-edited" | ...`)
  - `accepted: boolean`
  - `edited: boolean`
- **CreateFlashcardsRequest**: `{ flashcards: CreateFlashcardRequest[] }` – żądanie do POST `/flashcards`.
- **CreateFlashcardRequest**: `{ front: string; back: string; source: Source; generation_id?: number }` – pojedyncza fiszka do zapisu.
- **Source**: `"user" | "ai-gen" | "ai-gen-edited"`.

## 6. Zarządzanie stanem
Użycie hooków React:
- `textValue: string` – bieżąca zawartość pola tekstowego z treścią użytkownika do generowania fiszek,
- `isLoading: boolean` – flaga wskazująca, czy trwa wywołanie API; zarządzana w custom hooku `useGenerateFlashcards`,
- `errorMessage: string | null` – przechowuje komunikat o błędzie walidacji lub odpowiedzi API; `null` oznacza brak błędów,
- `flashcards: FlashcardProposalViewModel[]` – lista propozycji fiszek z lokalnymi flagami `accepted` i `edited`,
- `editIndex?: number` – opcjonalny indeks fiszki w trybie edycji; `undefined` oznacza, że aktualnie nie edytujemy żadnej fiszki.

Logika obsługi API wydzielona do custom hooka `useGenerateFlashcards`, który udostępnia powyższe stany oraz funkcję `generateFlashcards` do uruchamiania żądania.

## 7. Integracja API
- **POST /generations**: wysyłamy `GenerateFlashcardsRequest`, otrzymujemy `GenerationCreateResponse`.
- **POST /flashcards**: wysyłamy `CreateFlashcardsRequest`, zawierające tablicę `CreateFlashcardRequest` z `generation_id`.
- Obsługa błędów 400/500 i wyświetlanie przez `ErrorAlert`.

## 8. Interakcje użytkownika
1. Użytkownik wkleja tekst.
2. Klik na "Generuj fiszki":
   - Walidacja długości.
   - Wyświetlenie `LoadingSkeleton`.
3. Po otrzymaniu danych: render `FlashcardProposalList`.
4. Akcje na kartach: zatwierdź/edytuj/odrzuć.
5. Klik na `FlashcardBulkActions`: wysyłka wybranych fiszek.

## 9. Walidacja
- `source_text.length` 1000–10000.
- `front.length` ≤200, `back.length` ≤500 w edycji.
- Aktywacja przycisków zgodnie ze stanem.

## 10. Obsługa błędów
- Błędy walidacji formularza i API.
- Reset `isLoading` po błędzie.
- Komunikaty w `ErrorAlert`.

## 11. Kroki implementacji
1. Dodaj stronę `/generate` w `src/pages`.
2. Stwórz `FlashcardGeneratorView.tsx` w `src/components`.
3. Dodaj `SourceTextInput`, `GenerateFlashcardsButton`, `LoadingSkeleton`, `ErrorAlert`.
4. Implementuj hook `useGenerateFlashcards` w `src/lib/hooks`.
5. Stwórz `FlashcardProposalList` i `FlashcardProposalItem`.
6. Dodaj `FlashcardBulkActions` i integrację POST `/flashcards`.
7. Przetestuj scenariusze i zabezpiecz walidacje.
8. Dodaj responsywność i dostępność.
9. Code review i refaktoryzacja. 
