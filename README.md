# Today With God

A mobile-first static prayer companion built with HTML, CSS and JavaScript. It is designed for GitHub Pages and does not require PHP or a database.

## Included

- Gratitude-led home screen
- Prayer themes
- Search and filtering
- Random prayer selection
- Saved prayers
- Memory verses
- Recently visited prayers
- Continue where you stopped
- Amen and visit counts
- Light and dark appearance
- Installable PWA files
- Browser-based storage with `localStorage`

## Run locally

Because the prayer library is loaded from JSON, use a small local server rather than opening `index.html` directly.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a GitHub repository.
2. Upload the contents of this folder to the repository root.
3. Open the repository's **Settings**.
4. Open **Pages**.
5. Choose **Deploy from a branch**.
6. Select the `main` branch and the root folder.
7. Save.

The project uses hash-based navigation, so it works from a GitHub Pages repository subfolder without server rewrite rules.

## Add more prayers

Edit `data/prayers.json` and add another object using this structure:

```json
{
  "id": "unique-prayer-id",
  "title": "Prayer title",
  "theme": "gratitude",
  "verse": "Memory verse text",
  "reference": "Psalm 1:1",
  "translation": "KJV",
  "prayer": "Prayer paragraph one.\n\nPrayer paragraph two."
}
```

Available theme IDs:

- `gratitude`
- `peace`
- `healing`
- `wisdom`
- `understanding`
- `protection`
- `provision`
- `purpose`
- `living-right`
- `spirit` — displayed as “Holy Spirit”

## Important storage note

Saved prayers, memorised verses, visits and amens are stored only in the user's current browser and device. They do not sync between devices.
