# 1000 Monkeys

A comfortable reader for your own drafts. Read your work like a finished book, mark it up as you go, and send the notes back to where you write.

- **Live (build phase):** https://phpstack-1393521-6776691.cloudwaysapps.com
- **Plan:** [docs/project-doc.md](docs/project-doc.md)
- **Backlog:** [GitHub Issues](https://github.com/1kmdoug/1000monkeys/issues)

## Layout

| Path | What it is |
| --- | --- |
| `public/` | Everything the website serves. Nothing outside this folder is public. |
| `docs/` | Project doc and notes |
| `tests/` | Automated checks that load the reader on emulated phones and desktop |

## Running it locally

```bash
npm run serve
```

Then open http://localhost:4173.

## Tests

```bash
npm install
npx playwright install chromium
npm test
```

The same tests run automatically on GitHub for every push and pull request (the **Tests** check).
