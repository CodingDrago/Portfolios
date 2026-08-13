/**
 * BootManager - Subsystem for Robotics Workstation Electrical Boot Experience
 * Source Implementation: Extracted from loading.html
 * Handles circuit power-up, electrical flow propagation, LED overload,
 * radial mask reveal, skip input, prefers-reduced-motion, and BOOT_COMPLETE lifecycle dispatch.
 */

export class BootManager {
    constructor({ loaderElement, flashElement, targetElement, onComplete } = {}) {
        this.loader = loaderElement || document.getElementById('loader');
        this.flash = flashElement || document.getElementById('flash');
        this.target = targetElement || document.getElementById('hero-container');
        this.onComplete = onComplete || null;

        this.done = false;
        this.timers = [];
        this.rafId = null;

        this._onSkip = this._onSkip.bind(this);
    }

    /**
     * Start Boot Sequence Execution
     */
    start() {
        console.log('[BootManager] Starting loader sequence from loading.html source...');

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
            console.log('[BootManager] prefers-reduced-motion active. Bypassing animation.');
            this.finish();
            return;
        }

        const switchLever = document.getElementById('switch-lever');
        const ledBody = document.getElementById('led-body');
        const flowPath = document.getElementById('flow-path');

        if (!flowPath || !switchLever || !ledBody) {
            console.warn('[BootManager] Required SVG elements missing. Completing boot immediately.');
            this.finish();
            return;
        }

        // Set initial hero target brightness filter
        if (this.target) {
            this.target.style.filter = 'brightness(0.12)';
            this.target.style.willChange = 'filter';
        }

        const flowLen = flowPath.getTotalLength();
        flowPath.style.strokeDasharray = `${flowLen}`;
        flowPath.style.strokeDashoffset = `${flowLen}`;

        const at = (ms, fn) => {
            const timer = setTimeout(() => {
                if (!this.done) fn();
            }, ms);
            this.timers.push(timer);
        };

        const setLoop = (live) => {
            document.querySelectorAll('.trace').forEach((el) => {
                el.classList.toggle('live', live);
            });
        };

        // 1. Switch closes at 450ms
        at(450, () => {
            switchLever.classList.add('closed');
            setLoop(true);
        });

        // 2. Current travels the loop toward the LED at 750ms
        at(750, () => {
            flowPath.style.transition = 'stroke-dashoffset 0.42s linear, opacity 0.1s linear';
            flowPath.style.opacity = '1';
            flowPath.style.strokeDashoffset = '0';
        });

        // 3. LED overloads at 1150ms
        at(1150, () => {
            ledBody.classList.add('overload');
        });

        // 4. Flashbang brief capped brightness at 1230ms
        at(1230, () => {
            if (this.flash) {
                this.flash.style.transition = 'opacity 0.09s ease-out';
                this.flash.style.opacity = '0.85';
            }
            if (this.loader) {
                this.loader.style.opacity = '0';
            }
        });

        // 5. Radial reveal begins at 1340ms
        at(1340, () => {
            this.runReveal(950);
        });

        // Register skip listeners
        window.addEventListener('click', this._onSkip, { once: true });
        window.addEventListener('keydown', this._onSkip, { once: true });
    }

    /**
     * Handle user click or keypress skip event
     * @private
     */
    _onSkip() {
        console.log('[BootManager] Skip triggered by user interaction.');
        this.finish();
    }

    /**
     * Radial reveal mask animation step
     * @param {number} duration Mask expansion duration in ms
     */
    runReveal(duration) {
        let start = null;
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        const step = (ts) => {
            if (this.done) return;
            if (start === null) start = ts;
            const raw = Math.min((ts - start) / duration, 1);
            const eased = easeOutCubic(raw);
            const radius = eased * 145; // vmax-ish %, overshoots viewport corners

            const maskStyle = `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${radius}%, #000 ${Math.min(radius + 2, 148)}%)`;
            if (this.flash) {
                this.flash.style.maskImage = maskStyle;
                this.flash.style.webkitMaskImage = maskStyle;
                this.flash.style.opacity = String(0.85 * (1 - eased * 0.9));
            }

            if (this.target) {
                this.target.style.filter = `brightness(${0.12 + eased * 0.88})`;
            }

            if (raw < 1) {
                this.rafId = requestAnimationFrame(step);
            } else {
                this.finish();
            }
        };

        this.rafId = requestAnimationFrame(step);
    }

    /**
     * Master Completion Handler (Guaranteed ONCE)
     */
    finish() {
        if (this.done) return;
        this.done = true;

        this.timers.forEach(clearTimeout);
        this.timers = [];

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        window.removeEventListener('click', this._onSkip);
        window.removeEventListener('keydown', this._onSkip);

        if (this.target) {
            this.target.style.filter = 'brightness(1)';
            this.target.style.willChange = 'auto';
        }

        if (this.flash) {
            this.flash.style.opacity = '0';
            this.flash.style.pointerEvents = 'none';
        }

        if (this.loader) {
            this.loader.style.opacity = '0';
        }

        setTimeout(() => {
            if (this.loader) this.loader.style.display = 'none';
            if (this.flash) this.flash.style.display = 'none';
        }, 400);

        console.log('[BootManager] Boot complete. BOOT_COMPLETE dispatched.');

        if (typeof this.onComplete === 'function') {
            try {
                this.onComplete();
            } catch (err) {
                console.error('[BootManager] Error in onComplete callback:', err);
            }
        }
    }

    /**
     * Subsystem cleanup
     */
    destroy() {
        this.finish();
    }
}
