# Slate 📝

> A modern, block-based, Notion-like note-taking and database app. Built with Vite, React, TypeScript, BlockNote editor, Tailwind CSS, and Firebase.

Slate is a purely client-side single-page application (SPA) that communicates directly with Cloud Firestore. It utilizes a unified data model ("Everything is an Item") to seamlessly integrate rich-text pages, customizable databases, and table/board views.

---

## Key Features

* **Notion-like Editor**: Powered by BlockNote. Supports slash commands (`/`), lists, headings, code blocks, task lists, checklists, drag-and-drop blocks, and rich formatting.
* **Unified Item Model**: Pages, databases, and rows are stored in a single collection. Any row in a database can be opened in a modal as a full rich-text page with its own BlockNote document body.
* **Dynamic Databases**: Define custom columns (properties) including Text, Number, Select, Multi-Select, Date, and Checkbox.
* **Kanban Board View**: Organize rows into columns grouped by any `Select` or `Multi-Select` property. Drag-and-drop cards to change status updates in real-time.
* **Saved Views, Filtering & Sorting**: Add multiple Table/Board views. Apply complex filters (equals, contains, gt, lt, is_empty, etc.) and sorts (ascending/descending) on any column.
* **Collapsible Sidebar**: Smooth expand/collapse transition. Collapsible using `Cmd + \` or `Ctrl + \`.
* **Real-time Search**: Instant search box in the sidebar to filter pages.
* **Emoji Picker**: Interactive emoji picker to update page and database icons.
* **Toast Notification System**: Global context notifications for success, warning, and error events.
* **GitHub Pages Auto-deploy**: Official GitHub Actions integration to build and publish the app.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Build Tool** | Vite |
| **Framework** | React 18 + TypeScript |
| **Editor Engine** | BlockNote |
| **Styling** | Vanilla CSS (Light theme) |
| **Database** | Cloud Firestore |
| **Authentication** | Firebase Auth (Google Sign-In) |
| **Deployment** | GitHub Actions |

---

## Quick Start

### 1. Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd slate
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Run Locally

```bash
npm run dev
```

The app will start at `http://localhost:5173/`.

---

## Firebase Configuration

### Google Sign-In
1. In the [Firebase Console](https://console.firebase.google.com), go to **Authentication** -> **Sign-in method**.
2. Enable **Google** provider and configure support email.

### Firestore Rules
Publish the following rules under **Firestore Database** -> **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/items/{itemId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Firestore Indexes
The query for database rows requires a composite index:
* **Collection ID**: `items`
* **Fields**:
  1. `parentId` (Ascending)
  2. `isArchived` (Ascending)
  3. `order` (Ascending)
* **Query scope**: `Collection`

---

## Deployment

This repository is configured for automated deployment to **GitHub Pages** via GitHub Actions:

1. Push your repository to GitHub.
2. In your GitHub repository settings, navigate to **Settings** -> **Pages**.
3. Under **Build and deployment** -> **Source**, select **GitHub Actions**.
4. Pushing code to `main` will build and publish your site at `https://<username>.github.io/slate/`.
