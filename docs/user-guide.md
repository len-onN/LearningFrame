# MVP User Guide

This guide explains how to use LearningFrame to study within the current scope
of the MVP.

LearningFrame was designed to support learning through:
- active recall;
- spaced repetition;
- interleaved practice.

An account is optional to try out the app. It becomes necessary when the user
wants to persist decks, cards, media, reviews, and progress.

## 1. Accessing the Application

With the application running, open:

```txt
http://localhost:8080
```

The home screen directs to the public Library.

## 2. Studying Without an Account

Visitors can study public decks without registering.

Flow:
1. Open `Library`.
2. Go to `Public Decks`.
3. Select a deck.
4. Click `Study`.
5. Read the front of the card.
6. Click to reveal the answer.
7. Rate your recall:
   - `Again`;
   - `Hard`;
   - `Good`;
   - `Easy`.

In anonymous study, review progress is local to the browser. To persist history
and progress tied to an account, signing in is required.

## 3. Creating an Account and Signing In

Click `Sign In` or trigger a private action such as `My Decks`, `Create`, or
`Save to My Library`.

Key rules:
- Registration requires name, email, and password;
- The password must meet the strong password requirements shown on the form;
- Private routes redirect to login;
- After logging in, the application returns to the original destination if a
  redirect was present.

## 4. Saving a Public Deck

An authenticated user can copy a public deck to their personal library.

Flow:
1. Sign in to your account.
2. Open `Library > Public Decks`.
3. Click `Save to My Library`.
4. The application creates a private copy.
5. The copy appears under `My Decks` with temporary visual highlighting.

The copy belongs to the user and can be modified or managed without affecting
the original public deck.

## 5. Creating a Personal Deck

Flow:
1. Sign in to your account.
2. Open `Create`.
3. Enter title, description, and visibility.
4. Save.
5. The application opens the deck management screen for the newly created deck.

Visibility:
- `Private`: Visible only to the owner.
- `Public`: Eligible to appear in the public library.

## 6. Managing Cards

Under `Library > My Decks`, click `Manage` on any personal deck.

From this screen, you can:
- Edit title, description, and visibility;
- Search cards;
- Load more cards;
- Create a card;
- Edit a card;
- Delete a card;
- Select visible cards;
- Batch delete cards;
- Delete the entire deck.

Card management is paginated to avoid loading large decks all at once.

## 7. Creating and Editing Cards

When creating or editing a card, the editor opens on a dedicated surface with:
- Front field;
- Back field;
- Tags field;
- Secure content preview.

Cards support basic HTML. Content undergoes sanitization before rendering during
study sessions.

## 8. Using Images and Audio

In persisted decks, users can upload media through the card editor.

Flow:
1. Open the card editor.
2. Choose to insert an image or audio.
3. Select the file.
4. Upload creates the media asset in the deck.
5. The editor inserts a marker in the active field.

Markers used:
- Images are inserted as `<img src="filename">`;
- Audio is inserted as `[sound:filename]`.

During study sessions, persisted images and audio render directly inside the card.

## 9. Studying a Personal Deck

Flow:
1. Sign in to your account.
2. Open `My Decks`.
3. Select a deck.
4. Click `Study`.
5. Reveal the answer.
6. Rate the card.

For authenticated users, each review is sent to the backend and updates the
LearningFrame spaced repetition state.

The study interface displays:
- Session progress;
- Number of cards reviewed;
- Immediate feedback following rating;
- Session completion summary;
- Font size controls;
- Toggle to fit large media to the card container.

## 10. Using Interleaved Practice

Interleaved practice mixes eligible cards across topics in a single study session.

Objective:
- Avoid always studying a single topic in isolation;
- Better approximate real retrieval contexts;
- Reinforce active recall effectiveness.

Flow:
1. Sign in to your account.
2. Click `Interleaved Practice`.
3. Reveal and rate the cards.
4. Track progress and view the final summary.

In the MVP, interleaved practice is streamlined. It does not include advanced
deck configurators, limits, or custom card filtering.

## 11. Configuring Study Limits

Authenticated users can configure their daily study load under the `Settings` menu.
Available settings:
- Daily new cards limit.
- Daily review limit.

The on-demand study system respects these limits and displays a notification on
screen when the daily limit has been reached.

## 12. Tracking Progress

Authenticated users can open `Progress`.

The page displays essential metrics, including:
- Total decks;
- Total cards;
- Recent reviews;
- Cards reviewed today.

The MVP does not include advanced analytical dashboards, historical graph
breakdowns, or automated daily goals.

## 13. Understanding Ratings

Ratings reflect the quality of memory recall:

- `Again`: The answer could not be recalled properly.
- `Hard`: The answer was recalled with significant effort.
- `Good`: The answer was recalled satisfactorily.
- `Easy`: The answer was recalled effortlessly.

LearningFrame uses these ratings to calculate the next review interval using its
own simplified scheduling algorithm.

## 14. Recommended Demonstration Flow

To demonstrate the MVP end-to-end:
1. Open the public Library without logging in.
2. Study a public deck anonymously.
3. Open Import and preview an `.apkg` file.
4. Create an account.
5. Save the APKG or copy a public deck.
6. Create a deck manually.
7. Create a card with text and media.
8. Study the deck as an authenticated user.
9. Open Progress.
10. Use Interleaved Practice.

This walkthrough highlights the distinction between experimenting without an
account and persisting progress as an authenticated user.

