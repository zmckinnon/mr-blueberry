# mrblueberry.club

Jekyll site for the world of **Mr Blueberry**.

## Requirements

- Ruby 3.1+
- Bundler

## Run locally

```bash
cd /Users/zmckinnon/GitHub/mr-blueberry
bundle install
bundle exec jekyll serve --host 127.0.0.1 --port 3000 --livereload
```

Open: http://127.0.0.1:3000

If Ruby 3.1 is installed with Homebrew, add it to your shell path:

```bash
export PATH="/opt/homebrew/opt/ruby@3.1/bin:$PATH"
```

## Content map

- `index.md` homepage
- `characters.md` character guide
- `_layouts/default.html` shared layout
- `_data/characters.yml` character data
- `styles.css` site styling
- `assets/characters/*.png` character images

## Update authors

Edit `authors` in `_config.yml`:

```yml
authors:
  - Jay M
  - Alice J
```

The homepage byline updates automatically.

## GitHub Pages

This repo is set up to publish directly from `main` (no Actions workflow required).
`Gemfile.lock` is intentionally not committed so GitHub Pages can resolve its own supported dependency set.
