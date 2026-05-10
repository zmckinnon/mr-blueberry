---
title: Mr Blueberry World | Books
permalink: /books/
image: /assets/books/book-1/cover.png
---

<section class="panel paper books-intro">
  <p class="eyebrow">Bookshelf</p>
  <h1>Stories From Blueberry Meadow</h1>
  <p>
    Browse the growing bookshelf of Mr Blueberry stories.
  </p>
</section>

<section class="book-shelf" aria-label="Mr Blueberry books">
  {% assign books = "" | split: "" %}
  {% assign books_collection = site.collections | where: "label", "books" | first %}
  {% if books_collection and books_collection.docs %}
    {% assign books = books_collection.docs | sort: "book_number" %}
  {% endif %}

  {% if books.size > 0 %}
    {% for book in books %}
      <article class="book-card paper{% if book.cover_preview_class == 'is-spread-preview' %} book-card--spread{% endif %}">
        <a
          class="book-card-cover book-card-cover-link{% if book.cover_preview_class %} {{ book.cover_preview_class }}{% endif %}"
          href="{{ book.url | relative_url }}"
          aria-label="Open {{ book.book_title | default: book.title }}"
        >
          <img
            class="{% if book.cover_preview_class %}{{ book.cover_preview_class }}{% endif %}"
            src="{{ book.cover_image | relative_url }}"
            alt="{{ book.cover_image_alt }}"
            loading="lazy"
            decoding="async"
          />
        </a>

        <div class="book-card-copy">
          <p class="eyebrow">{{ book.status }}</p>
          <h2><a class="book-card-title-link" href="{{ book.url | relative_url }}">{{ book.book_title | default: book.title }}</a></h2>
          <p>{{ book.description }}</p>
          <p class="book-card-meta">{{ book.age_range }}</p>
          <div class="cta-row">
            <a class="btn btn-primary" href="{{ book.url | relative_url }}">Open the Book</a>
          </div>
        </div>
      </article>
    {% endfor %}
  {% else %}
    <article class="panel paper">
      <p class="eyebrow">Coming Soon</p>
      <h2>Books are on the way</h2>
      <p>The bookshelf will appear here as soon as the first book is available in the site build.</p>
    </article>
  {% endif %}
</section>
