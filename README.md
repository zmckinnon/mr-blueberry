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
- `games.md` games landing page
- `games/wally-circle.md` playable Wally Circle page
- `game-src/wally-circle/` independent game source, dependencies, build script, and movement tests
- `assets/games/wally-circle/` compiled game JavaScript, CSS, and Three.js license
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

## Developing Wally Circle

The game runs entirely in the browser using Three.js. Its source and npm dependencies live in `game-src/wally-circle/`, separately from the Jekyll pages. Node.js 20+ is needed only to develop/build the game.

```bash
npm --prefix game-src/wally-circle ci
npm --prefix game-src/wally-circle test
npm --prefix game-src/wally-circle run build
bundle exec jekyll serve --host 127.0.0.1 --port 4100
```

Visit `http://127.0.0.1:4100/games/wally-circle/`. For live development, run `npm --prefix game-src/wally-circle run watch` alongside Jekyll, then refresh the page after a rebuild. Restart Jekyll if `_config.yml` changes.

`src/wally.js` builds Wally's 3D model, `src/world.js` recycles the meadow around him, `src/movement.js` contains movement rules, and `src/controls.js` handles keyboard and pointer input. `src/main.js` connects the title screen, play/pause state, and rendering; `src/game.css` styles only the game page.

The early version supports WASD/arrow keys (including diagonals) and an analog pointer/touch joystick for any direction. Releasing controls stops Wally. Pause/Resume, Escape, and Start over are available. Switching away pauses the game. The meadow has no boundary; a fixed pool of scenery is recycled and render coordinates stay near Wally on long journeys. Props are decorative and do not block movement.

**Before publishing game changes, run the build and commit the updated files in `assets/games/wally-circle/` together with the source.** GitHub Pages serves these precompiled files and does not run npm. Jekyll excludes `game-src/`, and the game bundle is loaded only on the Wally Circle page. No backend, CDN runtime dependency, or account is required. Browsers need WebGL 2; an explanatory fallback appears if 3D rendering is unavailable.

## Update authors

Edit `authors` in `_config.yml`:

```yml
authors:
  - Jay M
  - Alice J
```

The homepage byline updates automatically.

## Google Analytics

Set `google_analytics_id` in `_config.yml` to the GA4 measurement ID, such as `G-XXXXXXXXXX`.
Leave it blank to disable the Google tag.

## GitHub Pages

This repo is set up to publish directly from `main` (no Actions workflow required).
`Gemfile.lock` is intentionally not committed so GitHub Pages can resolve its own supported dependency set.
