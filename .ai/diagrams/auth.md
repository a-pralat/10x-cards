<authentication_analysis>
- Przepływy: Rejestracja, Logowanie, Wylogowanie, Reset hasła, Sesja i odświeżanie tokenów.
- Aktorzy: Przeglądarka, Middleware, API Astro, Supabase Auth.
- Procesy: signUp, signInWithPassword, signOut, resetPasswordForEmail, updateUser({password},{token}), setSession, getSession, deleteSession.
- Kroki: formularz → POST, Zod walidacja, wywołanie Supabase Auth, setSession, redirect, middleware → weryfikacja sesji.
</authentication_analysis>

<mermaid_diagram>
```mermaid
sequenceDiagram
autonumber
participant Przeglądarka
participant Middleware
participant API_Astro
participant Supabase_Auth

activate Przeglądarka
Przeglądarka->>API_Astro: POST /api/auth/register {email, hasło}
deactivate Przeglądarka

activate API_Astro
API_Astro->>Middleware: getSession()
activate Middleware
Middleware-->API_Astro: brak sesji
deactivate Middleware
API_Astro->>Supabase_Auth: signUp({email, hasło})
activate Supabase_Auth
Supabase_Auth-->>API_Astro: {access_token, refresh_token, user}
deactivate Supabase_Auth
API_Astro->>API_Astro: setSession({access_token, user})
API_Astro-->>Przeglądarka: 201 Utworzono konto
deactivate API_Astro

alt Rejestracja / Logowanie udane
  Przeglądarka->>API_Astro: POST /api/auth/login {email, hasło}
  activate API_Astro
  API_Astro->>Supabase_Auth: signInWithPassword({email, hasło})
  activate Supabase_Auth
  Supabase_Auth-->>API_Astro: {access_token, refresh_token, user}
  deactivate Supabase_Auth
  API_Astro->>API_Astro: setSession({access_token, user})
  API_Astro-->>Przeglądarka: 200 OK
deactivate API_Astro
else Nieudane uwierzytelnienie
  Przeglądarka-->>Przeglądarka: Wyświetl komunikat o błędzie
end

Note over Przeglądarka, Supabase_Auth: Cykl życia tokenów i ich odświeżanie

par Reset hasła
  Przeglądarka->>API_Astro: POST /api/auth/forgot-password {email}
  activate API_Astro
  API_Astro->>Supabase_Auth: resetPasswordForEmail(email)
  deactivate API_Astro
and Ustawienie nowego hasła
  Przeglądarka->>API_Astro: POST /api/auth/reset-password {token, hasło}
  activate API_Astro
  API_Astro->>Supabase_Auth: updateUser({password}, {token})
  deactivate API_Astro
end

par Wylogowanie
  Przeglądarka->>API_Astro: POST /api/auth/logout
  activate API_Astro
  API_Astro->>Supabase_Auth: signOut()
  API_Astro->>API_Astro: deleteSession()
  API_Astro-->>Przeglądarka: 204 No Content
  deactivate API_Astro
end

par Żądania chronione
  Przeglądarka->>API_Astro: GET /dashboard lub /my-cards
  activate API_Astro
  API_Astro->>Middleware: getSession()
  Note right of Middleware: Brak sesji → przekieruj /login
  deactivate API_Astro
end
```
</mermaid_diagram> 