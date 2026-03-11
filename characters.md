---
title: Mr Blueberry World | Character Guide
permalink: /characters/
image: /assets/characters/mr-blueberry.png
---

<section class="panel paper characters-intro">
  <p class="eyebrow">Neighborhood Guide</p>
  <h1>Characters of Mr Blueberry's World</h1>
  <p>
    These are the friends, neighbors, and wildcards who make this world feel
    lively, funny, and full of surprises.
  </p>
</section>

<section class="character-grid" aria-label="Mr Blueberry characters">
  {% for character in site.data.characters %}
    <article class="char-card paper">
      <button
        class="char-photo-button"
        type="button"
        data-char-name="{{ character.name | escape }}"
        data-char-description="{{ character.description | escape }}"
        data-char-image="{{ character.image | relative_url }}"
        aria-label="View a larger image of {{ character.name }}"
      >
        <span class="char-photo {{ character.slug }}" aria-hidden="true">
          <img
            class="char-photo-img"
            src="{{ character.image | relative_url }}"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </span>
      </button>
      <h3>{{ character.name }}</h3>
      <p>{{ character.description }}</p>
    </article>
  {% endfor %}
</section>

<div class="char-lightbox" id="character-lightbox" hidden>
  <button class="char-lightbox-backdrop" type="button" aria-label="Close larger character view"></button>
  <div class="char-lightbox-panel paper" role="dialog" aria-modal="true" aria-labelledby="character-lightbox-title">
    <button class="char-lightbox-close" type="button" aria-label="Close larger character view">Close</button>
    <div class="char-lightbox-photo"></div>
    <h2 id="character-lightbox-title"></h2>
    <p id="character-lightbox-description"></p>
  </div>
</div>

<script src="{{ '/assets/js/characters-lightbox.js' | relative_url }}" defer></script>
