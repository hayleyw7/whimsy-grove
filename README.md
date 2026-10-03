# Spooky Grove

A portable, static illustrated garden toy. The complete website is in `dist/`.
Serve that directory with any ordinary static web server. No build, third-party services, backend, or environment variables are required. All art is bundled and all asset references are relative.

## Features
- An empty garden on every fresh page load; choose an item and tap to place it.
- Mushrooms: toadstool, wavy, ruffles, twins, curly, ghost cap.
- Animals: cat, frog, snail, bunny, raccoon, bat, possum, shrimp, raven, spider, fox, owl, hedgehog, mouse.
- Spooky: ghost, skull, pumpkin, Mothman, jack-o'-lantern, spiderweb.
- Haunted, Candy, Bog, and Dusk light-background palettes.
- Plants: fern, thorny rose, nightshade, twisted tree, flytrap.
- Searchable Nature, Ruins, and Magic collections with rocks, logs, stumps, roots, pond, stones, bridge, fairy ring, antlers, statues, bones, cemetery architecture, gates, fences, crystals, candles, lanterns, cauldrons, potions, pentagrams, ritual circles, and a horned idol. Gnome, alien, and UFO join Spooky.
- Three galaxies and animated shooting stars; reduced-motion support and still-image export.
- Full, crescent, half, and blood moons; rain, snow, fog, and lightning.
- Shuffle, undo, clear, and PNG export including the selected sky and effects.
- Touch, mouse, and keyboard placement; light-mode mobile-first layout.

Art sheets are generated original illustrations. The application crops each atlas cell to its transparency bounds at runtime, then composites the sprites onto a canvas. Gardens last for the page session; save a PNG to keep one. Nothing is sent to a server.

For an HTML-game upload to another host, place the contents of `dist/` at the root of the archive so that `index.html` is at the top level.
