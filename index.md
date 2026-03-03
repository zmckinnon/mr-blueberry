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
    <div class="mrb-illustration" role="img" aria-label="Mr Blueberry with a yellow crown and brown mustache">
      <svg class="mrb-svg" viewBox="0 0 420 520" aria-hidden="true">
        <defs>
          <linearGradient id="berryFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#7da7ff" />
            <stop offset="65%" stop-color="#4e75f1" />
            <stop offset="100%" stop-color="#3158d8" />
          </radialGradient>
          <linearGradient id="mustacheFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e18a2f" />
            <stop offset="100%" stop-color="#b76419" />
          </linearGradient>
        </defs>

        <path
          d="M152 118 L175 74 L208 112 L235 62 L268 112 L295 76 L307 126 L152 118 Z"
          fill="#ffd228"
          stroke="#171717"
          stroke-width="6"
          stroke-linejoin="round"
        />

        <circle
          cx="210"
          cy="258"
          r="170"
          fill="url(#berryFill)"
          stroke="#171717"
          stroke-width="6"
        />

        <g opacity="0.14" stroke="#9fc0ff" stroke-width="3">
          <line x1="70" y1="170" x2="350" y2="170" />
          <line x1="52" y1="205" x2="368" y2="205" />
          <line x1="44" y1="240" x2="376" y2="240" />
          <line x1="44" y1="275" x2="376" y2="275" />
          <line x1="52" y1="310" x2="368" y2="310" />
          <line x1="68" y1="345" x2="352" y2="345" />
        </g>

        <path d="M246 206 Q261 194 277 198" fill="none" stroke="#171717" stroke-width="4.5" stroke-linecap="round" />
        <path d="M300 201 Q317 192 332 200" fill="none" stroke="#171717" stroke-width="4.5" stroke-linecap="round" />

        <circle cx="267" cy="225" r="12.5" fill="#101010" />
        <circle cx="334" cy="225" r="12.5" fill="#101010" />

        <ellipse
          cx="268"
          cy="278"
          rx="48"
          ry="27"
          fill="url(#mustacheFill)"
          stroke="#171717"
          stroke-width="3.5"
        />
        <ellipse
          cx="324"
          cy="278"
          rx="48"
          ry="27"
          fill="url(#mustacheFill)"
          stroke="#171717"
          stroke-width="3.5"
        />
        <path d="M296 274 Q296 285 286 289" fill="none" stroke="#9a4d12" stroke-width="2.4" stroke-linecap="round" />
        <path d="M296 274 Q297 286 308 290" fill="none" stroke="#9a4d12" stroke-width="2.4" stroke-linecap="round" />

        <line x1="87" y1="300" x2="87" y2="355" stroke="#171717" stroke-width="10" stroke-linecap="round" />

        <path d="M162 420 L160 505 Q177 510 189 506" fill="none" stroke="#171717" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M257 420 L259 505 Q278 510 289 505" fill="none" stroke="#171717" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
    <p class="byline">World by {{ site.authors | array_to_sentence_string }}</p>
  </div>
</section>

<section id="about" class="panel paper">
  <h2>What Is the World of Mr Blueberry?</h2>
  <p>
    It is a cheerful, hand-drawn place where everyone is a little different
    and every personality has room to shine. Mr Blueberry keeps things moving
    with curiosity, kindness, and a very serious mustache.
  </p>
</section>
