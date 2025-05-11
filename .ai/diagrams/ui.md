<architecture_analysis>
- Komponenty z specyfikacji:
  • Layouty: AuthLayout (src/layouts/AuthLayout.astro), BaseLayout (src/layouts/BaseLayout.astro lub Layout.astro)
  • Strony Astro: /login, /register, /forgot-password, /reset-password/[token]
  • React: LoginForm.tsx, RegisterForm.tsx, ForgotPasswordForm.tsx, ResetPasswordForm.tsx
  • Walidacja i formularze: React Hook Form + Zod
  • Usługi: komunikacja fetch → /api/auth/*, klient Supabase
- Główne grupy i przepływ danych:
  1. Strony Astra renderują się w odpowiednich layoutach
  2. Layout AuthLayout osadza właściwy komponent formularza React
  3. Komponent formularza korzysta z React Hook Form + Zod do walidacji
  4. Po walidacji wysyła fetch do endpointu API
  5. API wykorzystuje Supabase Client, zwraca odpowiedź
  6. Po sukcesie formularz wyzwala redirect do stron chronionych w layout BaseLayout
- Krótki opis:
  • AuthLayout: wspólny kontener dla formularzy uwierzytelniania
  • Layout.astro: główny layout dla aplikacji (BaseLayout)
  • Formularze React: obsługa interakcji i walidacji
  • React Hook Form + Zod: zarządzanie stanem formularza i walidacja
  • API/auth: endpointy auth zapewniające logikę backendową
  • Supabase Client: klient do komunikacji z usługą Supabase Auth
</architecture_analysis>

<mermaid_diagram>
```mermaid
flowchart TD
  subgraph "Layouts"
    BaseLayout["Layout.astro (BaseLayout)"]
    AuthLayout["AuthLayout.astro"]
  end

  subgraph "Strony Astro"
    LoginPage["/login"]
    RegisterPage["/register"]
    ForgotPage["/forgot-password"]
    ResetPage["/reset-password/:token"]
  end

  subgraph "Komponenty React"
    LoginForm["LoginForm.tsx"]
    RegisterForm["RegisterForm.tsx"]
    ForgotPWForm["ForgotPasswordForm.tsx"]
    ResetPWForm["ResetPasswordForm.tsx"]
  end

  subgraph "Formularze i walidacja"
    RHForm[("React Hook Form")]
    Zod[("Zod Validation")]
  end

  subgraph "API i usługi"
    APIAuth["/api/auth/*"]
    SupabaseClient["Supabase Client"]
  end

  LoginPage --> AuthLayout
  RegisterPage --> AuthLayout
  ForgotPage --> AuthLayout
  ResetPage --> AuthLayout

  AuthLayout --> LoginForm
  AuthLayout --> RegisterForm
  AuthLayout --> ForgotPWForm
  AuthLayout --> ResetPWForm

  LoginForm --> RHForm
  RegisterForm --> RHForm
  ForgotPWForm --> RHForm
  ResetPWForm --> RHForm

  RHForm --> Zod
  Zod --> RHForm

  LoginForm -->|"POST /api/auth/login"| APIAuth
  RegisterForm -->|"POST /api/auth/register"| APIAuth
  ForgotPWForm -->|"POST /api/auth/forgot-password"| APIAuth
  ResetPWForm -->|"POST /api/auth/reset-password"| APIAuth

  APIAuth --> SupabaseClient
  SupabaseClient -->|"signUp/signIn/signOut"| APIAuth

  LoginForm -.->|"redirect on success"| BaseLayout
  RegisterForm -.->|"redirect on success"| BaseLayout
  ForgotPWForm -.->|"redirect on success"| BaseLayout
  ResetPWForm -.->|"redirect on success"| BaseLayout
```
</mermaid_diagram> 