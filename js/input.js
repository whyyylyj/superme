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

    // Derived properties for easy access
    get up() { return this.keys.w || this.keys.ArrowUp; },
    get down() { return this.keys.s || this.keys.ArrowDown; },
    get left() { return this.keys.a || this.keys.ArrowLeft; },
    get right() { return this.keys.d || this.keys.ArrowRight; },
    get jump() { return this.keys[' ']; },
    get shoot() { return this.keys.j || this.keys.z; },
    get transform() { return this.keys.k || this.keys.x; },
    get homing() { return this.keys.m; },
    get pause() { return this.keys.Escape; },
    get sit() { return this.keys.s; },

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
    }
};

// Initialize input listener on script load
Input.init();
