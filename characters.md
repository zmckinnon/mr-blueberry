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
      <div class="char-photo {{ character.slug }}" aria-label="{{ character.name }} portrait" role="img"></div>
      <h3>{{ character.name }}</h3>
      <p>{{ character.description }}</p>
    </article>
  {% endfor %}
</section>
