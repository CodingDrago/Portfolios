/**
 * StateManager - Finite State Machine (FSM) for Robotics Workstation
 * Phase 1 Architecture: Decouples UI & Pointer state transitions from render logic
 */

import { STATES } from '../config.js';

export class StateManager {
    constructor(initialState = STATES.IDLE) {
        this.currentState = initialState;
        this.previousState = null;
        this.listeners = new Set();
    }

    /**
     * Get current active system state
     * @returns {string} State name
     */
    getState() {
        return this.currentState;
    }

    /**
     * Get previously active system state
     * @returns {string|null} State name
     */
    getPreviousState() {
        return this.previousState;
    }

    /**
     * Transition system to a new state
     * @param {string} newState Target state enum value
     * @param {Object} payload Optional metadata associated with state change
     * @returns {boolean} Success status
     */
    setState(newState, payload = {}) {
        if (this.currentState === newState) {
            return false;
        }

        if (!Object.values(STATES).includes(newState)) {
            console.warn(`[StateManager] Refused transition to invalid state: "${newState}"`);
            return false;
        }

        this.previousState = this.currentState;
        this.currentState = newState;

        const eventData = {
            state: this.currentState,
            previousState: this.previousState,
            payload,
            timestamp: performance.now()
        };

        // Notify all registered change listeners
        this.listeners.forEach(listener => {
            try {
                listener(eventData);
            } catch (err) {
                console.error('[StateManager] Listener error:', err);
            }
        });

        return true;
    }

    /**
     * Subscribe to state transition events
     * @param {Function} listener Callback function receiving state change event data
     * @returns {Function} Unsubscribe cleanup function
     */
    onChange(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}
