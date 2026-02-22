// js/transform/transform-system.js

const TransformSystem = {
    forms: {},
    currentForm: null,
    timer: 0,
    defaultFormName: 'Normal',

    init() {
        this.registerForm(new FormNormal());
        this.registerForm(new FormMecha());
        this.registerForm(new FormDragon());
        this.registerForm(new FormPhantom());
        this.currentForm = this.forms['Normal'];
        this.timer = 0;
    },

    registerForm(form) {
        this.forms[form.name] = form;
    },

    transform(formName, player) {
        if (!this.forms[formName]) {
            console.warn(`Unknown form: ${formName}`);
            return;
        }

        const previousForm = this.currentForm;

        if (previousForm) {
            previousForm.onExit(player);
        }

        this.currentForm = this.forms[formName];
        this.currentForm.onEnter(player);

        if (this.currentForm.duration !== Infinity) {
            this.timer = this.currentForm.duration;
        } else {
            this.timer = 0;
        }

        EventBus.emit('player:transform', {
            formName: formName,
            previousForm: previousForm ? previousForm.name : null
        });
    },

    update(dt, player) {
        if (this.currentForm) {
            this.currentForm.update(dt, player);
        }

        if (this.timer > 0) {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.transform(this.defaultFormName, player);
            }
        }
    },

    getSpeed() {
        return this.currentForm ? this.currentForm.speed : CONFIG.PLAYER.BASE_SPEED;
    },

    canFly() {
        return this.currentForm ? this.currentForm.canFly : false;
    },

    canPassThrough() {
        return this.currentForm ? this.currentForm.passThrough : false;
    },

    getDamageMultiplier() {
        return this.currentForm ? this.currentForm.damageMultiplier : 1;
    },

    getAttackMultiplier() {
        return this.currentForm ? this.currentForm.attackMultiplier : 1;
    },

    shoot(player, bullets) {
        if (this.currentForm) {
            this.currentForm.shoot(player, bullets);
        }
    },

    draw(ctx, player, cameraX, cameraY) {
        if (this.currentForm) {
            this.currentForm.draw(ctx, player, cameraX, cameraY);
        }
    },

    getRemainingTime() {
        return Math.max(0, this.timer);
    },

    reset(player) {
        if (this.currentForm && this.currentForm.name !== this.defaultFormName) {
            this.currentForm.onExit(player);
        }
        this.currentForm = this.forms[this.defaultFormName];
        this.timer = 0;
    }
};
