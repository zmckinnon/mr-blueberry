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

`src/wally.js` builds Wally's 3D model, `src/world.js` recycles the meadow around him, `src/movement.js` contains movement rules, `src/challenge.js` tracks the safe circle and countdown, and `src/controls.js` handles keyboard and pointer input. `src/main.js` connects the title screen, play/pause state, and rendering; `src/game.css` styles only the game page.

`src/food.js` places yellow bananas throughout the circle and handles eating and growth. `src/bananas.js` renders nearby fruit with shared, instanced 3D geometry. Bananas have a 2-unit margin inside the boundary, with a few easy snacks near the start. Touching one removes it until the next refill, increments the banana counter, and adds volume to Wally (scale is the cube root of `1 + 0.6 × bananas eaten`). All bananas return to their original positions together every six minutes of active play (`BANANA_RESET_SECONDS`); pausing or switching tabs freezes this timer. Refills preserve Wally's size and total banana count, and restored bananas can be eaten again. Growth animates smoothly; pickup reach, camera framing, and shadows follow his size. Restart restores the bananas and Wally's original size, and starts a fresh six-minute timer.

The field contains 2,040 bananas, triple the original 680. Extra bananas fill the gaps with at least 2.5 units between centers and leave Wally's spawn clear.

`src/chest-state.js` places 24 white treasure chests inside the circle, away from bananas and each other. Touching a chest opens it once per round and immediately adds exactly 9 bananas to the same total and growth calculation as loose fruit. A reward message confirms the pickup. `src/chests.js` renders shared chest geometry with animated hinged lids; opened chests remain visibly open. Banana refills do not refill chests. Restart restores all chests and resets rewards along with the rest of the round.

Wally has no gameplay size limit, including across banana refills. `src/view.js` fits his full body on desktop and narrow screens as he grows, without reducing his world size. Camera clipping, fog, shadow coverage, and the ground's extent scale with him; grass texture density stays fixed. The circle stays the same size and still checks Wally's center, so growing beyond it does not automatically end the round.

The early version supports WASD/arrow keys (including diagonals) and an analog pointer/touch joystick for any direction. Releasing controls stops Wally. Pause/Resume, Escape, and Start over are available. Switching away pauses the game. A fixed pool of scenery is recycled and render coordinates stay near Wally as he explores. Props are decorative and do not block movement.

A large dark red circle marks the world boundary around the starting point. Wally's center is safe up to the circle's inner edge (`SAFE_RADIUS`, currently 120 units: a 240-unit-wide world, with about 24 seconds of travel from the center to the edge). Leaving starts a 12-second countdown; returning before the deadline resets it. Staying outside for the full 12 seconds ends the round and requires Restart. The countdown uses active play time, freezes while paused or in another tab, and resumes with its remaining time. Restart puts Wally back in the center with a fresh countdown. These rules are tested independently of rendering.

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
