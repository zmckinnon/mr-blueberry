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
- `books.md` bookshelf landing page
- `_books/*.md` one file per book
- `_layouts/book.html` shared book reader layout
- `characters.md` character guide
- `_layouts/default.html` shared layout
- `_data/characters.yml` character data
- `styles.css` site styling
- `assets/characters/*.png` character images
- `assets/books/<book-folder>/` scanned cover and page art for each book

## Adding a book

1. Add the cover and page images under `assets/books/<book-folder>/`.
2. Create a new file in `_books/` using `_books/mr-blueberry.md` as the example.
3. Set the book metadata in front matter, especially `book_title`, `status`, `cover_image`, `book_number`, and `book_pages`.
4. Use `cover_image` for the bookshelf card, and put only readable interior pages in `book_pages`.

Each `_books/*.md` file automatically gets its own `/books/<slug>/` reader page, and the bookshelf page automatically lists it.

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
