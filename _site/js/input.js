// input.js

const Input = {
    keys: {
        w: false,
        a: false,
        s: false,
        d: false,
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        ' ': false, // Space
        j: false,
        z: false,
        k: false,
        x: false,
        m: false,
        Escape: false
    },

    virtualKeys: {
        up: false,
        down: false,
        left: false,
        right: false,
        jump: false,
        shoot: false,
        transform: false,
        homing: false,
        sit: false,
        pause: false
    },

    // Derived properties for easy access
    get up() { return this.keys.w || this.keys.ArrowUp || this.virtualKeys.up; },
    get down() { return this.keys.s || this.keys.ArrowDown || this.virtualKeys.down; },
    get left() { return this.keys.a || this.keys.ArrowLeft || this.virtualKeys.left; },
    get right() { return this.keys.d || this.keys.ArrowRight || this.virtualKeys.right; },
    get jump() { return this.keys[' '] || this.virtualKeys.jump; },
    get shoot() { return this.keys.j || this.keys.z || this.virtualKeys.shoot; },
    get transform() { return this.keys.k || this.keys.x || this.virtualKeys.transform; },
    get homing() { return this.keys.m || this.virtualKeys.homing; },
    get pause() { return this.keys.Escape || this.virtualKeys.pause; },
    get sit() { return this.keys.s || this.virtualKeys.sit; },

    init: function () {
        window.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key) && !e.repeat) {
                this.keys[e.key] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = false;
            }
        });

        // Detect touch capability
        // Use stricter detection to avoid false positives on desktop browsers
        this.isTouchDevice = ('ontouchstart' in window) || 
            (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
    }
};

// Initialize input listener on script load
Input.init();
