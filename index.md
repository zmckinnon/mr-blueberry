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
      <svg class="mrb-svg" viewBox="0 0 380 460" aria-hidden="true">
        <defs>
          <radialGradient id="berryFill" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#6fb2ff" />
            <stop offset="60%" stop-color="#2d74eb" />
            <stop offset="100%" stop-color="#1b4bb8" />
          </radialGradient>
          <radialGradient id="mustacheFill" cx="40%" cy="25%" r="75%">
            <stop offset="0%" stop-color="#a66332" />
            <stop offset="100%" stop-color="#6c381d" />
          </radialGradient>
          <linearGradient id="groundShade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#b0df9d" />
            <stop offset="100%" stop-color="#4ca654" />
          </linearGradient>
        </defs>

        <ellipse cx="190" cy="392" rx="130" ry="26" fill="url(#groundShade)" opacity="0.55" />

        <path
          d="M122 118 L142 72 L170 120 L190 58 L214 120 L242 74 L262 118 L122 118 Z"
          fill="#ffd228"
          stroke="#2d2a27"
          stroke-width="8"
          stroke-linejoin="round"
        />

        <circle
          cx="190"
          cy="235"
          r="132"
          fill="url(#berryFill)"
          stroke="#292623"
          stroke-width="8"
        />

        <ellipse cx="150" cy="188" rx="31" ry="21" fill="#9fd0ff" opacity="0.34" />
        <ellipse cx="166" cy="226" rx="24" ry="16" fill="#7caef8" opacity="0.2" />

        <line x1="164" y1="201" x2="164" y2="238" stroke="#221f1d" stroke-width="8" stroke-linecap="round" />
        <line x1="217" y1="201" x2="217" y2="238" stroke="#221f1d" stroke-width="8" stroke-linecap="round" />

        <ellipse
          cx="167"
          cy="272"
          rx="43"
          ry="26"
          fill="url(#mustacheFill)"
          stroke="#2c221c"
          stroke-width="5"
        />
        <ellipse
          cx="212"
          cy="272"
          rx="43"
          ry="26"
          fill="url(#mustacheFill)"
          stroke="#2c221c"
          stroke-width="5"
        />

        <path
          d="M154 319 Q191 348 228 319"
          fill="none"
          stroke="#201d1b"
          stroke-width="7"
          stroke-linecap="round"
        />

        <line x1="152" y1="364" x2="148" y2="433" stroke="#201d1b" stroke-width="8" stroke-linecap="round" />
        <line x1="228" y1="364" x2="232" y2="433" stroke="#201d1b" stroke-width="8" stroke-linecap="round" />
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

<section class="panel paper">
  <h2>Places to Know</h2>
  <p>
    The world of Mr Blueberry is full of familiar spots where friends run into
    each other and chaos usually follows:
  </p>
  <ul>
    <li>Blueberry Meadow, the center of town and gathering place.</li>
    <li>Crown Hill, where big ideas begin and silly plans go sideways.</li>
    <li>Giggle Lane, home to surprises, songs, and unexpected visitors.</li>
  </ul>
  <p>
    Want to meet everyone who lives here?
  </p>
  <div class="cta-row">
    <a class="btn btn-primary" href="{{ '/characters/' | relative_url }}">Visit the Character Guide</a>
  </div>
</section>
