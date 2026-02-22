# SUPERME — Project Context

A HTML5 Canvas 横版飞行射击游戏 (side-scrolling shooter) blending classic game elements from **Touhou Project** (danmaku/bullet patterns), **Contra** (multi-weapon), **Super Mario** (transform system), and **Minecraft** (pixel block aesthetics).

---

## Quick Start

```bash
# Open directly in browser
open index.html

# Or use a static file server
python -m http.server 8000
# Visit http://localhost:8000
```

**No build step** — pure HTML/CSS/JavaScript. Edit files and refresh browser.

---

## Tech Stack

| Technology | Usage |
|------------|-------|
| HTML5 Canvas | 800×600 game rendering |
| Vanilla JavaScript (ES6 Classes) | All game logic |
| CSS3 | Neon-glow UI theme, Press Start 2P pixel font |
| No frameworks | Direct `<script>` tag loading |

---

## Project Structure

```
superme/
├── index.html                  # Entry point
├── css/
│   └── style.css               # Neon glow UI theme
├── js/
│   ├── core/                   # Core modules (planned/in-progress)
│   │   ├── event-bus.js        # Pub-sub event system
│   │   ├── game-state.js       # Finite state machine
│   │   ├── level-manager.js    # Level loading/transitions
│   │   ├── asset-manager.js    # Global config/constants
│   │   ├── audio-manager.js    # 8-bit sound effects (Web Audio API)
│   │   └── screen-effects.js   # Shake, flash, slow-motion
│   │
│   ├── entity.js               # Base entity class (x, y, width, height, update, draw)
│   ├── physics.js              # AABB collision detection
│   ├── input.js                # Keyboard input tracking
│   ├── particle.js             # Particle effects system
│   │
│   ├── player.js               # Player character (movement, shooting, powerups)
│   ├── bullet.js               # Bullet behavior (+ homing support)
│   ├── powerup.js              # Power-up pickups
│   ├── enemy.js                # Enemy AI
│   ├── boss.js                 # Boss battle logic
│   ├── level.js                # Level generation, Platform class
│   └── main.js                 # Game loop, state management
│
├── transform/                  # Transform system (Task 02)
│   ├── form-normal.js          # Default form
│   ├── form-mecha.js           # Mecha form (shotgun)
│   ├── form-dragon.js          # Dragon form (flight + fire)
│   └── form-phantom.js         # Phantom form (ghost + homing)
│
├── danmaku/                    # Danmaku engine (Task 03)
│   ├── danmaku-engine.js       # Core bullet pattern engine
│   ├── patterns.js             # Bullet pattern library (8 patterns)
│   └── bullet-pool.js          # Object pool for performance
│
├── enemies/                    # Enemy refactoring (Task 04-06)
│   ├── enemy-base.js           # Enemy base class
│   ├── enemy-types.js          # Enemy type definitions
│   ├── boss-base.js            # Boss base class
│   ├── boss-level1.js          # Treant King (Forest boss)
│   ├── boss-level2.js          # Inferno Dragon (Nether boss)
│   └── boss-level3.js          # Sky Tyrant (Sky Temple boss)
│
├── levels/                     # Level refactoring (Task 04-06)
│   ├── level-base.js           # Level base interface
│   ├── level1-forest.js        # Pixel Forest (5000px, tutorial)
│   ├── level2-nether.js        # Inferno Nether (6000px, lava)
│   └── level3-sky.js           # Sky Temple (7000px, aerial)
│
└── docs/
    ├── 00-ARCHITECTURE.md      # Master architecture doc (READ FIRST)
    ├── 01-CORE-REFACTOR.md     # Task 01: Core infrastructure
    ├── 02-TRANSFORM-SYSTEM.md  # Task 02: Transform system (4 forms)
    ├── 03-BULLET-DANMAKU.md    # Task 03: Danmaku engine (8 patterns)
    ├── 04-LEVEL1-FOREST.md     # Level 1: Pixel Forest
    ├── 05-LEVEL2-NETHER.md     # Level 2: Inferno Nether
    ├── 06-LEVEL3-SKY.md        # Level 3: Sky Temple
    └── 07-UI-AUDIO-POLISH.md   # UI/Audio/Screen effects
```

---

## Current Script Load Order (Critical!)

Due to global variable dependencies, `<script>` tags in `index.html` must load in this exact order:

```html
<!-- 1. Foundation -->
<script src="js/physics.js"></script>
<script src="js/input.js"></script>
<script src="js/entity.js"></script>
<script src="js/particle.js"></script>

<!-- 2. Game Objects -->
<script src="js/bullet.js"></script>
<script src="js/powerup.js"></script>
<script src="js/player.js"></script>
<script src="js/enemy.js"></script>
<script src="js/boss.js"></script>

<!-- 3. Level -->
<script src="js/level.js"></script>

<!-- 4. Main Loop -->
<script src="js/main.js"></script>
```

**Do not change this order** without understanding dependencies.

---

## Key Classes & Interfaces

### Entity (Base Class)

All game objects extend `Entity`:

```javascript
class Entity {
    constructor(x, y, width, height, color)
    update(dt)              // dt in seconds
    draw(ctx, cameraX, cameraY)
    markedForDeletion       // boolean, flag for removal
}
```

### Physics

```javascript
Physics.checkCollision(rect1, rect2)  // AABB collision
Physics.getIntersection(rect1, rect2) // Get overlap depth/direction
```

### Input (Global Object)

```javascript
Input.left    // boolean
Input.right   // boolean
Input.up      // boolean
Input.down    // boolean
Input.jump    // boolean
Input.shoot   // boolean
```

### Player

Key properties:
- `hp` (default 3), `weapon` ('normal'/'spread'/'rapid')
- `bambooMode` (flight), `invincible`, `shieldMode`, `speedMode`
- `maxJumps` (3 for triple jump)
- `facing` (1=right, -1=left)

### LevelMap (Global Object)

```javascript
LevelMap.platforms   // Platform[]
LevelMap.enemies     // Enemy[]
LevelMap.powerups    // PowerUp[]
LevelMap.boss        // Boss instance
LevelMap.width       // Level width in pixels
LevelMap.height      // Level height
LevelMap.generate()  // Initialize level
LevelMap.drawBackground(ctx, camX, camY, canvas)
```

---

## Game State Machine (Current)

Simple string-based state in `main.js`:

| State | Description |
|-------|-------------|
| `'start'` | Title screen |
| `'play'` | Gameplay active |
| `'gameover'` | Player died |
| `'win'` | Boss defeated |

**Planned refactor (Task 01):** Replace with `GameStateMachine` in `js/core/game-state.js` supporting multi-level transitions.

---

## Power-up Types

### Current Power-ups

| Type | Effect |
|------|--------|
| `spread` | 3-bullet spread shot |
| `rapid` | Fast fire rate |
| `bamboo` | Bamboo copter flight (5s) |
| `star` | Invincibility (8s) |
| `shield` | Block one hit |
| `speed` | Speed boost (5s) |

### Planned Transform Power-ups (Task 02)

| Type | Form | Duration | Effect |
|------|------|----------|--------|
| `transform_mecha` | Mecha | 12s | Shotgun (5 bullets), tankier |
| `transform_dragon` | Dragon | 10s | Flight, fire breath, lava immune |
| `transform_phantom` | Phantom | 8s | Ghost (pass-through), homing bullets, fastest |

---

## Danmaku Patterns (Task 03)

8 bullet patterns available via `DanmakuPatterns`:

| Pattern | Description | Usage |
|---------|-------------|-------|
| `circle` | Circular spread from center | Boss basic attack |
| `fan` | Fan-shaped toward target | Boss aimed attack |
| `spiral` | Rotating spiral (multi-arm) | Mid-boss sustained |
| `rain` | Rain from above | Area denial |
| `cross` | 4-direction cross | Hell boss special |
| `flower` | 6-petal beautiful pattern | Final boss special |
| `laser` | Dense straight line |魂斗罗 style |
| `scatter` | Random spread | Player/boss |

---

## Controls

| Key | Action |
|-----|--------|
| W/A/S/D or Arrows | Move |
| Space | Jump (tap for multi-jump) |
| J or Z | Shoot |
| K or X | Transform (planned) |
| Escape | Pause (planned) |

---

## Coordinate System

- Origin `(0, 0)` at **top-left**
- X increases right, Y increases down
- Camera offset: subtract `cameraX`, `cameraY` when drawing

---

## Time Management

- **`dt` (delta time)** is in **seconds** (not milliseconds)
- Frame cap: `dt` limited to 0.1s in `main.js` to prevent physics explosions after pauses

---

## Color Conventions

- Hex strings: `'#rrggbb'`
- Transparency: `rgba(r, g, b, a)`
- Neon glow: `ctx.shadowBlur` + `ctx.shadowColor`

---

## Development Workflow

### Making Changes

1. **Read architecture first:** `docs/00-ARCHITECTURE.md` defines the target structure
2. **Check task docs:** Each feature has a dedicated task file (01-07)
3. **Maintain backward compatibility:** Don't break existing gameplay while refactoring
4. **Test in browser:** Refresh to see changes immediately

### Debugging Tips

In browser console:
```javascript
gameState           // Current game state
player.hp           // Player health
player.weapon       // Current weapon
player.x, player.y  // Player position
LevelMap.enemies.length
LevelMap.boss.hp
```

---

## Refactor Roadmap (7 Tasks)

### Task 01: Core Infrastructure
- Create `js/core/` with EventBus, GameStateMachine, LevelManager, AssetManager
- Refactor `main.js` to use new systems
- Enable level transitions with fade effects
- **Status:** Foundation for all other tasks

### Task 02: Transform System
- Four forms: Normal, Mecha (shotgun), Dragon (flight+fire), Phantom (ghost+homing)
- Transform via new power-ups
- Each form has unique visuals, stats, and shooting patterns
- **Files:** `js/transform/*.js`,改造 `player.js`

### Task 03: Danmaku Engine
- Object pool for bullet performance
- Pattern library (8 patterns: circle, fan, spiral, rain, cross, flower, laser, scatter)
- Emitter system for sustained弹幕
- **Files:** `js/danmaku/*.js`,改造 `bullet.js`

### Task 04: Level 1 — Pixel Forest
- 5000px wide, green theme
- Tutorial level: teaches movement, shooting, transform
- Boss: Treant King (2 phases)
- Unlocks: Mecha form
- **Difficulty:** ★★☆☆☆

### Task 05: Level 2 — Inferno Nether
- 6000px wide, red/orange theme
- Lava mechanics (damage unless Dragon form)
- Geyser traps with warning
- Boss: Inferno Dragon (3 phases, flying)
- Unlocks: Dragon form
- **Difficulty:** ★★★★☆

### Task 06: Level 3 — Sky Temple
- 7000px wide, blue/purple theme
- Aerial combat (no ground, falling = death)
- Moving platforms, light pillar traps
- Boss: Sky Tyrant (4 phases, final boss)
- Unlocks: Phantom form
- **Difficulty:** ★★★★★

### Task 07: UI / Audio / Polish
- Enhanced HUD (hearts HP, transform bar, level indicator)
- 8-bit sound effects via Web Audio API
- Screen effects: shake, flash, slow-motion
- Pause menu, improved transitions
- Victory sequence with fireworks

---

## Three-Level Design Summary

| Attribute | Level 1 | Level 2 | Level 3 |
|-----------|---------|---------|---------|
| **Theme** | Pixel Forest | Inferno Nether | Sky Temple |
| **Width** | 5000px | 6000px | 7000px |
| **Color** | Green | Red/Orange | Blue/Purple |
| **Mechanic** | Tutorial | Lava damage | Aerial (no ground) |
| **Boss** | Treant King | Inferno Dragon | Sky Tyrant |
| **Boss Phases** | 2 | 3 | 4 |
| **Unlock** | Mecha | Dragon | Phantom |
| **Difficulty** | ★★☆☆☆ | ★★★★☆ | ★★★★★ |

---

## Code Style

- **Naming:** PascalCase (classes), camelCase (functions/variables), UPPER_SNAKE_CASE (constants)
- **Comments:** File header describes purpose; JSDoc for public methods
- **Deletion pattern:** Set `markedForDeletion = true`, filter in main loop
- **No external dependencies:** Pure HTML/CSS/JS only

---

## Related Files

- `CLAUDE.md` — Alternative assistant context (similar content)
- `docs/00-ARCHITECTURE.md` — **Master design document** (required reading before any refactor)
- `.spec-workflow/` — Spec workflow templates for documentation

---

## Common Issues

| Problem | Solution |
|---------|----------|
| `undefined` errors | Check script load order in `index.html` |
| Collision not working | Ensure objects have `x, y, width, height` |
| Performance drop | Check for objects not marked `markedForDeletion` |
| Player falls out of level | Verify `levelWidth` boundary constraints |

---

*Last updated: 2026-02-22*
