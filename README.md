# 1000 Monkeys

A comfortable reader for your own drafts. Read your work like a finished book, mark it up as you go, and send the notes back to where you write.

- **Live (build phase):** https://phpstack-1393521-6776691.cloudwaysapps.com
- **Plan:** [docs/project-doc.md](docs/project-doc.md)
- **Backlog:** [GitHub Issues](https://github.com/1kmdoug/1000monkeys/issues)

## Layout

| Path | What it is |
| --- | --- |
| `public/` | Everything the website serves. Nothing outside this folder is public. |
| `public/index.html` | Landing page (placeholder) |
| `public/app/` | The reader |
| `public/app/api/` | Small server endpoints the reader talks to (sign-in for now) |
| `server/` | Server code that is never served to the web |
| `config.example.php` | Shape of the private settings file. The real one, `config.local.php`, lives only on the server |
| `docs/` | Project doc and notes |
| `tests/` | Automated checks that load the reader on emulated phones and desktop |

## Running it locally

```bash
npm run serve
```

Then open http://localhost:4173 (homepage) or http://localhost:4173/app/ (reader).

## Owner password

Phase 1 has one login: the owner's. Set or change it on the server, from the folder that holds this repo:

```bash
php server/set-password.php
```

It asks for the password twice and saves a scrambled version in `config.local.php`. Until that's done, the reader works as before and shows no sign-in.

## Tests

```bash
npm install
npx playwright install chromium
npm test
```

The same tests run automatically on GitHub for every push and pull request (the **Tests** check).
