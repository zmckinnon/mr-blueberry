---
title: Wally Circle | Mr Blueberry Games
permalink: /games/wally-circle/
image: /assets/characters/wally-face.png
stylesheets:
  - /assets/games/wally-circle/game.css
---

<header class="wally-page-heading">
  <div>
    <p class="eyebrow">The Blueberry Arcade</p>
    <h1 id="wally-circle-title">Wally Circle</h1>
  </div>
  <a class="btn btn-secondary" href="{{ '/games/' | relative_url }}"><span aria-hidden="true">&larr;</span> All games</a>
</header>

<section class="wally-game paper" data-wally-game data-state="loading" aria-labelledby="wally-circle-title">
  <div class="wally-toolbar">
    <div class="wally-toolbar-info">
      <span class="wally-version">Early version</span>
      <span class="wally-distance" data-distance>0 m explored</span>
    </div>
    <div class="wally-toolbar-actions">
      <button class="wally-control-button" type="button" data-pause disabled>Pause</button>
      <button class="wally-control-button" type="button" data-reset disabled>Start over</button>
    </div>
  </div>
  <div class="wally-stage">
    <div class="wally-canvas-host"></div>
    <div class="wally-boundary-hud" data-boundary-hud data-zone="safe" hidden>
      <p class="wally-safe-message" data-safe-message>Safe inside the circle</p>
      <div class="wally-boundary-warning" data-boundary-warning hidden>
        <p>Get back in the circle!</p>
        <span class="wally-countdown" role="timer" aria-label="Seconds remaining to return to the circle"><span data-countdown>12</span><span class="wally-countdown-unit">s</span></span>
      </div>
    </div>
    <div class="wally-overlay">
      <div class="wally-title-card">
        <p class="eyebrow">Early version &middot; Circle challenge</p>
        <h2 data-overlay-title>Getting Wally ready&hellip;</h2>
        <p data-overlay-description>Loading the meadow. If this takes a while, try refreshing the page.</p>
        <button class="btn btn-primary wally-play" type="button" data-play disabled>Loading&hellip;</button>
      </div>
    </div>
    <button class="wally-joystick" type="button" aria-label="Drag to move Wally in any direction" aria-describedby="wally-controls-help" hidden>
      <span class="wally-joystick-arrow up" aria-hidden="true">&uarr;</span>
      <span class="wally-joystick-arrow down" aria-hidden="true">&darr;</span>
      <span class="wally-joystick-arrow left" aria-hidden="true">&larr;</span>
      <span class="wally-joystick-arrow right" aria-hidden="true">&rarr;</span>
      <span class="wally-joystick-thumb" aria-hidden="true"></span>
    </button>
  </div>
  <div class="wally-controls-help" id="wally-controls-help">
    <p><strong>Move:</strong> WASD, arrow keys, or drag the joystick. Release to stop. Esc to pause.</p>
    <p class="wally-status" data-status role="status">Loading meadow&hellip;</p>
  </div>
  <noscript><p class="wally-noscript">Turn on JavaScript to play Wally Circle. The game runs right in your browser.</p></noscript>
</section>

<p class="wally-version-note">Stay inside the dark red circle. Step out, and you have 12 seconds to return before you need to restart. An early version, with more on the way.</p>

<script type="module" src="{{ '/assets/games/wally-circle/game.js' | relative_url }}?v={{ site.time | date: '%s' }}"></script>
