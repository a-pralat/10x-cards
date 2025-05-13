# Plan implementacji widoku Moje fiszki

## 1. Przegląd
Widok "Moje fiszki" umożliwia zalogowanemu użytkownikowi przeglądanie, filtrowanie, sortowanie, ręczne tworzenie, edycję oraz usuwanie zapisanych fiszek. Zapewnia dostęp do listy kart, zarządzanie nimi i nawigację pomiędzy stronami/infinite scroll.

## 2. Routing widoku
Ścieżka: `/flashcards`

## 3. Struktura komponentów
- FlashcardsPage (kontener strony)
  - FiltersAndSortingControls
  - AddFlashcardButton
  - FlashcardsList
    - FlashcardCard[]
  - PaginationControls / InfiniteScrollWrapper
  - AddFlashcardModal
  - EditFlashcardModal
  - DeleteConfirmationDialog
  - ToastNotifications

## 4. Szczegóły komponentów
### FlashcardsPage
- Opis: Główny komponent strony, zarządza stanem listy i modali.
- Główne elementy: sekcja filtrów, lista, przycisk dodawania.
- Obsługiwane zdarzenia: zmiana filtrów/sortowania, stronicowanie, otwarcie modali.
- Warunki walidacji: brak.
- Typy: FlashcardsPageViewModel, Filters, Sorting, PaginationMeta.
- Propsy: brak (strona Astro/Router).

### FiltersAndSortingControls
- Opis: Formularz filtrów i sortowania.
- Elementy: select `source`, pole `generationId`, select `sort`, select `order`, przycisk `Zastosuj`.
- Zdarzenia: onChange filtrów, onApply.
- Walidacja: `generationId` musi być liczbą; wartości źródła z enum Source.
- Typy: Filters, Sorting.
- Propsy: currentFilters, currentSorting, onFilterChange, onSortChange.

### AddFlashcardButton
- Opis: Przycisk otwierający modal dodawania.
- Elementy: przycisk `Dodaj fiszkę`.
- Zdarzenia: onClick->open AddFlashcardModal.
- Propsy: onOpen.

### FlashcardsList
- Opis: Renderuje listę fiszek lub placeholder.
- Elementy: kontener listy, komunikaty pustej listy.
- Zdarzenia: brak.
- Walidacja: brak.
- Typy: FlashcardItemViewModel[].
- Propsy: items, onEdit, onDelete.

### FlashcardCard
- Opis: Pojedyncza karta fiszki.
- Elementy: front, back, data meta, przyciski `Edytuj`, `Usuń`.
- Zdarzenia: onEditClick, onDeleteClick.
- Propsy: item, onEdit, onDelete.

### PaginationControls / InfiniteScrollWrapper
- Opis: Kontrolki nawigacji po stronach lub ładowania więcej.
- Elementy: przyciski stronicowania lub observer.
- Zdarzenia: onPageChange, onLoadMore.
- Propsy: pagination, onPageChange.

### AddFlashcardModal
- Opis: Modal formularza tworzenia.
- Elementy: Input front/back, przyciski `Zapisz`, `Anuluj`.
- Zdarzenia: onSubmit, onCancel.
- Walidacja: front ≤200 znaków, back ≤500 znaków.
- Typy: CreateFlashcardFormData.
- Propsy: isOpen, onClose, onSubmit.

### EditFlashcardModal
- Opis: Modal formularza edycji.
- Elementy: Input front/back wypełnione, przyciski `Zapisz`, `Anuluj`.
- Zdarzenia: onSubmit, onCancel.
- Walidacja: front ≤200 znaków, back ≤500 znaków.
- Typy: UpdateFlashcardFormData.
- Propsy: isOpen, onClose, initialData, onSubmit.

### DeleteConfirmationDialog
- Opis: Dialog potwierdzenia usunięcia.
- Elementy: komunikat, przyciski `Usuń`, `Anuluj`.
- Zdarzenia: onConfirm, onCancel.
- Propsy: isOpen, onClose, onConfirm.

### ToastNotifications
- Opis: Wyświetla komunikaty sukcesu/błędu.
- Elementy: Toasty.
- Propsy: messages.

## 5. Typy
- FlashcardItemViewModel: { id: number; front: string; back: string; source: Source; generationId?: number; createdAt: string; }
- Filters: { source?: Source; generationId?: number; }
- Sorting: { sortField: string; sortOrder: 'asc' | 'desc'; }
- PaginationMeta: { page: number; limit: number; total: number; }
- CreateFlashcardFormData: { front: string; back: string; }
- UpdateFlashcardFormData: { front?: string; back?: string; }

## 6. Zarządzanie stanem
- useFlashcards hook: zarządza fetchowaniem GET `/flashcards` z params: page, limit, filters, sorting; zwraca { data, pagination, loading, error, fetchPage }.
- useCreateFlashcard hook: POST `/flashcards`.
- useUpdateFlashcard hook: PUT `/flashcards/{id}`.
- useDeleteFlashcard hook: DELETE `/flashcards/{id}`.
- Lokalny stan modali i formularzy w stanie komponentu FlashcardsPage.

## 7. Integracja API
- GET `/flashcards?page&limit&sort&order&source&generation_id` → zmapować na Filters & Sorting.
- POST `/flashcards` z body `{ flashcards: [{ front, back, source: 'user' }] }`.
- PUT `/flashcards/{id}` z body `{ front, back }`.
- DELETE `/flashcards/{id}`.
- Typy żądań i odpowiedzi: wykorzystać CreateFlashcardsRequest, UpdateFlashcardRequest, FlashcardsListResponse, FlashcardResponse.

## 8. Interakcje użytkownika
1. Zmiana filtrów/sortowania → refetch listy.
2. Klik `Dodaj fiszkę` → otwarcie AddModal.
3. Wypełnienie formularza i `Zapisz` → walidacja → POST → zamknięcie modal, toast, refetch.
4. Klik `Edytuj` na karcie → otwarcie EditModal wypełnionego.
5. Zmiana i `Zapisz` → walidacja → PUT → zamknięcie, toast, aktualizacja elementu.
6. Klik `Usuń` → otwarcie DeleteDialog → `Usuń` → DELETE → zamknięcie, toast, usunięcie z listy.
7. Nawigacja stronicowania lub infinite scroll → GET kolejnych danych.

## 9. Warunki i walidacja
- front: wymagane, max długość 200.
- back: wymagane, max długość 500.
- generationId (filtr): liczba.
- sortField: jeden z pól flashcard (created_at).
- sortOrder: asc|desc.

## 10. Obsługa błędów
- 401: przekierowanie do `/login`.
- 400: wyświetlenie komunikatu walidacji inline.
- 404 przy edycji/usuwaniu: toast z info "Nie znaleziono fiszki".
- 500: toast "Błąd serwera, spróbuj ponownie".
- Loading: spinner lub skeleton listy.

## 11. Kroki implementacji
1. Utworzyć stronę `src/pages/flashcards.astro` lub `.tsx` z FlashcardsPage.
2. Zaimplementować typy w `src/types.ts` jeśli brakuje.
3. Stworzyć hooki API w `src/lib/hooks/useFlashcards.ts`, `useCreateFlashcard.ts`, `useUpdateFlashcard.ts`, `useDeleteFlashcard.ts`.
4. Zaimplementować komponenty UI w `src/components/flashcards/` wg struktury.
5. Dodać obsługę modali w FlashcardsPage.
6. Podpiąć sterowanie filtrami i sortowaniem.
7. Podpiąć paginację lub infinite scroll.
8. Dodać obsługę stanów loading/error. 