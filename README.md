# mrblueberry.club

Jekyll-powered website for **Mr Blueberry** with reusable layouts and distinct pages.

## Local development

Requires Ruby 3.1+ and Bundler.

```bash
bundle install
bundle exec jekyll serve --host 0.0.0.0 --port 3000 --livereload
```

Then open:

http://localhost:3000

## Project structure

- `_layouts/default.html` shared site layout (head, nav, footer)
- `_data/characters.yml` character content source
- `index.md` homepage
- `characters.md` characters page
- `styles.css` site styling

## Updating authors

Edit the `authors` list in `_config.yml`:

```yml
authors:
  - Jay M
  - Alice J
```

Add more names as new list items. The homepage byline updates automatically.

## Character pictures

The character intro page is:

`/characters/`

To show real character art on each card, add image files to:

`assets/characters/`

Use the exact filenames listed in:

`assets/characters/README.md`
