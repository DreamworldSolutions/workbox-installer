
/**
 * Provides an abstract implementation of the `UpdateChecker`.
 * 
 * Usage:
 * - Provide implementation of `_getUpdates()` function.
 * - From the constructor, check for the updates once; and set the instance 
 *   property `this.updates`. If no updates are found then set to `null`, otherwise
 *   set appropriate value.
 * - Keep watching for the updates, and set the instance property `this.updates` when 
 *   found.
 */
export default class AbstractUpdateChecker {

  constructor() {
    /**
     * Holds all the registered listener functions.
     */
    this.listeners = [];

    /**
     * Whenever updates are found this is set to some value. 
     * And whenever a listener is registered and any updates are known,
     * then the listener is notified immediately.
     */
    this._updates = undefined;
  }

  get updates() {
    return this._updates;
  }

  set updates(value) {
    this._updates = value;
    if (value) {
      this._notifyListeners();
    }
  }

  _notifyListeners() {
    this.listeners.forEach((listener) => listener(this.updates));
  }

  onUpdate(listener) {
    this.listeners.push(listener);

    //If updates are already known, notify the listener, now.
    if (this.updates) {
      listener(this.updates);
    }
  }

  async getUpdates() {
    if (this.updates !== undefined) {
      return this.updates;
    }
    this.updates = await this._getUpdates();
    return this.updates;
  }

  /**
   * Should check for the updates once, and if the updates are found then
   * return the value. Otherwise, return `null`. 
   * Note: don't return `undefined`, you have to return `null`.
   * @returns 
   */
  async _getUpdates() {
    return null;
  }

}