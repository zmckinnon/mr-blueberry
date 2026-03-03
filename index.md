---
title: Mr Blueberry | Welcome to the World
permalink: /
image: /assets/characters/mr-blueberry.png
---

<section class="hero">
  <div class="hero-copy paper">
    <p class="eyebrow">Welcome to Blueberry Meadow</p>
    <h1>Mr Blueberry</h1>
    <p class="lead">
      Mr Blueberry lives in a bright little world where fruit, kids, animals,
      and crayons all share the same neighborhood.
    </p>
    <p>
      Around every corner, something odd and delightful is happening, from
      spontaneous parades to dramatic banana plots and frog-sized surprises.
    </p>
    <div class="cta-row">
      <a class="btn btn-secondary" href="{{ '/characters/' | relative_url }}">Explore the Characters</a>
    </div>
  </div>

  <div class="hero-art paper">
    <div class="star-burst">Hello!</div>
    <div class="mrb-illustration">
      <img class="mrb-image" src="{{ '/assets/mr-blueberry-standing.png' | relative_url }}" alt="Mr Blueberry standing artwork" />
    </div>
    <p class="byline">World by {{ site.authors | array_to_sentence_string }}</p>
  </div>
</section>
