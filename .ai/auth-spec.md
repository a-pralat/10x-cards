# Specyfikacja modułu autentykacji

## 1. Architektura interfejsu użytkownika

### 1.1 Strony i układy (layouts)
- Strony Astro:
  - `/register` → `src/pages/register.astro`
  - `/login` → `src/pages/login.astro`
  - `/forgot-password` → `src/pages/forgot-password.astro`
  - `/reset-password/[token]` → `src/pages/reset-password/[token].astro`
- Layout:
  - `AuthLayout` (`src/layouts/AuthLayout.astro`): wspólny układ dla stron autoryzacyjnych (nagłówek, stopka, kontener formularza).
  - Aktualizacja `BaseLayout` (`src/layouts/BaseLayout.astro`) o logikę wyświetlania linków „Logowanie”, „Rejestracja” lub „Wyloguj się” na podstawie stanu sesji.

### 1.2 Komponenty React klienta
W folderze `src/components/auth/`:
- `RegisterForm.tsx`
- `LoginForm.tsx`
- `ForgotPasswordForm.tsx`
- `ResetPasswordForm.tsx`

Każdy komponent:
- Korzysta z React Hook Form + Zod do walidacji.
- Wysyła żądania `fetch` do endpointów API.
- Obsługuje stany: ładowanie, sukces, błąd.
- Wyświetla komunikaty błędów inline i globalne alerty.

### 1.3 Podział odpowiedzialności
- Strony `.astro`: przygotowują meta i layout, osadzają komponent React.
- React: cała logika interaktywna, walidacja, obsługa żądań do API.
- Nawigacja: linki Astro (`<a href="...">`) i ewentualne przekierowania w React po pomyślnych akcjach.

### 1.4 Walidacja i komunikaty błędów
- Walidacja pól:
  - Email: wymagany, format RFC.
  - Hasło: wymagane, min. 8 znaków, przynajmniej jedna wielka litera i cyfra.
- Komunikaty:
  - Inline przy polach dla błędów walidacji.
  - Globalne alerty dla błędów serwera i komunikatów ogólnych.
- Najważniejsze scenariusze:
  - Nieprawidłowy email lub hasło.
  - Rejestracja istniejącego konta.
  - Reset hasła: nieważny lub przeterminowany token.
  - Błąd połączenia/API.

## 2. Logika backendowa

### 2.1 Struktura endpointów API
Pliki w `src/pages/api/auth/`:
- `register.ts` – POST `/api/auth/register`
- `login.ts` – POST `/api/auth/login`
- `logout.ts` – POST `/api/auth/logout`
- `forgot-password.ts` – POST `/api/auth/forgot-password`
- `reset-password.ts` – POST `/api/auth/reset-password`

### 2.2 Modele danych (DTO)
- `RegisterDTO`: `{ email: string; password: string }`
- `LoginDTO`: `{ email: string; password: string }`
- `ForgotPasswordDTO`: `{ email: string }`
- `ResetPasswordDTO`: `{ token: string; password: string }`

### 2.3 Walidacja i obsługa wyjątków
- Walidacja wejścia: Zod w każdym endpointzie.
- Błędy:
  - `400 Bad Request` z `{ code: 'validation_error', fieldErrors }`.
  - `401 Unauthorized` z `{ code: 'unauthorized', message }`.
  - `500 Internal Server Error` z `{ code: 'server_error', message }`.
- Logowanie błędów do konsoli lub usługi monitorującej (np. Sentry).

### 2.4 SSR i sesje
- Włączenie eksperymentalnej funkcji sesji w `astro.config.mjs` (`experimental.session: true`).
- Po pomyślnym logowaniu lub rejestracji:
  ```ts
  import { setSession } from 'astro:session';
  setSession({ access_token, user });
  ```
- Middleware (`src/middleware/index.ts`):
  - Odczyt `getSession()`.
  - Chronione ścieżki (np. `/dashboard`, `/my-cards`): brak sesji → redirect do `/login`.

## 3. System autentykacji (Supabase Auth)

### 3.1 Inicjalizacja klienta Supabase
`src/db/supabaseClient.ts`:
```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_ANON_KEY
);
```

### 3.2 Rejestracja użytkownika
Endpoint `POST /api/auth/register`:
1. Parsowanie `RegisterDTO` i walidacja.
2. `await supabase.auth.signUp({ email, password })`.
3. (Opcjonalnie) Utworzenie wpisu w tabeli `profiles`.
4. Ustawienie sesji (`setSession`).
5. Zwrócenie `201 Created`.

### 3.3 Logowanie i wylogowywanie
- `POST /api/auth/login`:
  1. Parsowanie `LoginDTO`, walidacja.
  2. `await supabase.auth.signInWithPassword({ email, password })`.
  3. `setSession({ access_token, user })`.
  4. `200 OK` z danymi użytkownika.
- `POST /api/auth/logout`:
  1. `await supabase.auth.signOut()`.
  2. `deleteSession()`.
  3. `204 No Content`.

### 3.4 Odzyskiwanie hasła
- `POST /api/auth/forgot-password`:
  1. Parsowanie `ForgotPasswordDTO`.
  2. `await supabase.auth.resetPasswordForEmail(email)`.
  3. `200 OK`.
- `POST /api/auth/reset-password`:
  1. Parsowanie `ResetPasswordDTO`.
  2. `await supabase.auth.updateUser({ password }, { token })`.
  3. `200 OK` lub `400` przy invalid token.

### 3.5 Zarządzanie sesją w Astro
- Import z `astro:session`:
  ```ts
  import { setSession, getSession, deleteSession } from 'astro:session';
  ```
- `setSession` po auth, `deleteSession` przy logout, `getSession` w middleware.

---

*Supabase zapewnia wysyłkę maili potwierdzających rejestrację oraz linków do resetu hasła.*
