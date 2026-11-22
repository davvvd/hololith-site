---
title: Photon Runner
date: 2026-05-28
type: page
summary: Play the HTML game embedded in the site or open it directly in a new tab.
design:
  css_class: game-page
---

<div class="game-page__intro">
  <p class="game-page__eyebrow">Interactive HTML game</p>
  <p class="game-page__lede">
    Photon Runner is a browser arcade game inspired by azobenzene photoisomerization, molecular stability,
    and UV photodegradation. You can play it here in an embedded frame or open the standalone version in
    a new tab.
  </p>

  <div class="game-page__actions">
    <a class="btn btn-primary" href="/game/play/index.html" target="_blank" rel="noopener">Open full game</a>
    <a class="btn btn-outline-primary" href="#game-frame">Jump to embedded game</a>
  </div>
</div>

<div class="game-page__frame-wrap" id="game-frame">
  <iframe
    class="game-page__frame"
    src="/game/play/index.html"
    title="Photon Runner HTML game"
    loading="lazy"
    allowfullscreen>
  </iframe>
</div>

<div class="game-page__notes">
  <h2>How to play</h2>
  <p>
    Use W/A/S/D or the arrow keys to move. Red photons stabilize, green and blue photons trigger reversible
    isomerization, and violet/UV photons add photodegradation pressure.
  </p>
</div>
