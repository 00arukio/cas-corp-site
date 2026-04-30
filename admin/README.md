# Cas Corp Admin

This folder powers the admin panel at [yoursite.com/admin](/admin/).

## How It Works

- **Login**: Click "Login with Netlify Identity" → enter your invited email/password
- **Edit**: Add/edit team members, codes, jobs, blog posts, and site links
- **Save**: Each save commits to GitHub → Netlify auto-redeploys → live site updates

## Files

- `index.html` — Loads the Decap CMS UI
- `config.yml` — Defines what's editable. Edit this file to add new fields/collections.

## Adding a New Editable Field

1. Open `admin/config.yml`
2. Find the relevant collection (team, codes, jobs, etc.)
3. Add a new entry under `fields:`. Example:
   ```yaml
   - { label: "Discord URL", name: "discord", widget: "string", required: false }
   ```
4. Commit to GitHub. Admin updates immediately.

## Available Field Types (Widgets)

- `string` — single-line text
- `text` — multi-line text
- `number` — numeric input
- `boolean` — on/off toggle
- `select` — dropdown
- `image` — image upload
- `datetime` — date picker
- `list` — repeatable group of fields

Full docs: https://decapcms.org/docs/widgets/

## Data Storage

Data is stored as JSON files in `/_data/`. Each collection lives in its own subfolder:
- `_data/team/` — one JSON file per team member
- `_data/codes/` — one JSON file per code
- `_data/jobs/` — one JSON file per job listing
- `_data/posts/` — one JSON file per blog post
- `_data/settings/` — site-wide settings (links, studio info)

Uploaded images go to `assets/uploads/`.
