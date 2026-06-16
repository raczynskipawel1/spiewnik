# Śpiewnik Online

## Opis projektu

Internetowy śpiewnik dla zespołów folklorystycznych oparty o:

* Next.js
* Vercel
* Supabase

Umożliwia wyszukiwanie piosenek, wyświetlanie tekstów, zarządzanie repertuarem oraz edycję treści przez administratorów.

---

## Architektura

### Frontend

* Next.js
* TypeScript
* React

### Backend

* Supabase Database
* Supabase Storage

### Hosting

* Vercel

---

## Baza danych

### Tabela: songs

Kolumny:

* id
* title
* normalized_title
* lyrics
* region
* tags
* notes
* image_filename

---

## Storage

### Bucket

song-images

Przechowuje zdjęcia oryginalnych śpiewników.

---

## Logowanie

### Użytkownik

Zmienne środowiskowe:

* NEXT_PUBLIC_SONGBOOK_PASSWORD

Uprawnienia:

* przeglądanie śpiewnika
* wyszukiwanie
* filtrowanie

### Administrator

Zmienne środowiskowe:

* NEXT_PUBLIC_ADMIN_PASSWORD

Uprawnienia:

* dodawanie piosenek
* edycja piosenek
* edycja tekstów
* edycja regionów
* edycja tagów
* edycja notatek

---

## Funkcje gotowe

### Wyszukiwanie

Wyszukiwanie po:

* tytule
* tekście piosenki
* tagach

### Filtrowanie

Filtrowanie po regionach.

### OCR

Wykonano OCR zdjęć śpiewnika.

Teksty zapisane w kolumnie:

* lyrics

### Dodawanie piosenek

Administrator może dodawać:

* tytuł
* region
* tagi
* tekst

### Edycja piosenek

Administrator może edytować:

* tytuł
* region
* tagi
* tekst
* notatki

### Zdjęcia

Wyświetlanie oryginalnego zdjęcia piosenki pod tekstem.

### Sesja

* logowanie
* wylogowanie
* rozróżnienie użytkownik/admin

---

## Aktualny stan

* około 127 piosenek
* repertuar oczyszczony z utworów nieużywanych
* wszystkie piosenki posiadają tekst
* OCR wymaga drobnych ręcznych poprawek

---

## Pomysły na przyszłość

* dodawanie zdjęć z poziomu strony
* usuwanie piosenek przez administratora
* ulubione piosenki
* filtrowanie po tagach
* eksport PDF
* historia zmian
* kopie zapasowe

---

## Dane techniczne

Repozytorium GitHub:

spiewnik

Projekt Vercel:

spiewnik

Bucket Storage:

song-images
