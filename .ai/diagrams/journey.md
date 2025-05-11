<user_journey_analysis>
1. Ścieżki użytkownika z PRD i specyfikacji:
   - Rejestracja konta (US-001)
   - Logowanie (US-002)
   - Odzyskiwanie hasła (zapomniane hasło i reset token)
   - Podstawowy dostęp do aplikacji po zalogowaniu (US-003, US-004, US-005)
   - Wylogowanie i sesja wygasła

2. Główne podróże i stany:
   - Niezalogowany: użytkownik bez sesji
   - FormularzLogowania: ekran logowania
   - FormularzRejestracji: ekran rejestracji
   - FormularzOdzyskiwaniaHasla: ekran podania e-mail do resetu
   - OczekiwanieMaila: stan po wysłaniu maila (reset lub weryfikacja)
   - FormularzResetHasla: ekran ustawienia nowego hasła
   - OczekiwanieWeryfikacjiEmail: stan oczekiwania weryfikacji
   - SesjaAktywna: zalogowany użytkownik
   - DostępDoAplikacji: widoki głównej funkcjonalności

3. Punkty decyzyjne:
   - if_ValidacjaLogowania: dane logowania poprawne vs błędne
   - if_ValidacjaRejestracji: dane rejestracji poprawne vs błędne
   - if_WeryfikacjaEmail: token e-mail poprawny vs błędny
   - if_ValidacjaReset: nowe hasło poprawne vs błędne

4. Opis celu każdego stanu:
   - Niezalogowany: wybór akcji (logowanie, rejestracja, reset)
   - Formularz*: interakcja użytkownika przy podawaniu danych
   - Oczekiwanie*: proces wysyłki maila i potwierdzenia akcji
   - SesjaAktywna: dostęp do chronionych widoków
   - DostępDoAplikacji: generowanie i zarządzanie fiszkami
</user_journey_analysis>

<mermaid_diagram>
```mermaid
stateDiagram-v2

[*] --> Niezalogowany

state "Autentykacja" as Auth {
  [*] --> Niezalogowany

  Niezalogowany --> FormularzLogowania : Wybór logowania
  Niezalogowany --> FormularzRejestracji : Wybór rejestracji
  Niezalogowany --> FormularzOdzyskiwaniaHasla : Wybór resetu hasła

  FormularzLogowania --> if_ValidacjaLogowania
  if_ValidacjaLogowania --> SesjaAktywna : Poprawne dane
  if_ValidacjaLogowania --> FormularzLogowania : Dane błędne

  FormularzRejestracji --> if_ValidacjaRejestracji
  if_ValidacjaRejestracji --> OczekiwanieWeryfikacjiEmail : Dane poprawne
  if_ValidacjaRejestracji --> FormularzRejestracji : Dane błędne

  OczekiwanieWeryfikacjiEmail --> if_WeryfikacjaEmail
  if_WeryfikacjaEmail --> SesjaAktywna : Token e-mail OK
  if_WeryfikacjaEmail --> OczekiwanieWeryfikacjiEmail : Token niepoprawny
}

state "Odzyskiwanie hasła" as Reset {
  FormularzOdzyskiwaniaHasla --> OczekiwanieMaila : Wysłanie maila
  OczekiwanieMaila --> FormularzResetHasla : Kliknięcie linku

  FormularzResetHasla --> if_ValidacjaReset
  if_ValidacjaReset --> FormularzLogowania : Reset udany
  if_ValidacjaReset --> FormularzResetHasla : Błędne dane
}

state "Aplikacja" as App {
  SesjaAktywna --> DostępDoAplikacji
  DostępDoAplikacji --> SesjaAktywna
  SesjaAktywna --> Niezalogowany : Wyloguj
  SesjaAktywna --> Niezalogowany : Sesja wygasła
}

Auth --> App : Uwierzytelniony
App --> [*] : Zakończenie podróży
```
</mermaid_diagram> 