

export default class UpdateChecker {

  /**
   * Invokes the registered listener whenever updates are found. updates are passed as the first
   * argument of the listener function.
   * 
   * If there were any updates known when the listener is registered, then listener is invoked 
   * immediately for that updates.
   * @param {function} listener A function which should be invoked when updates are found. 
   */
  onUpdate(listener) {
    //No op
  }

  /**
   * Returns detail about the updates. 
   * In case no updates available, returns `null` or `undefined`.
   * If the updates status is known, then produces the result immediately. Otherwise, 
   * waits till the status becomes known.
   * 
   * This is used by the `install-workbox` script only if new service worker is 
   * installed and ready to be used (in 'waiting' status). But, no updates are yet 
   * known to it. This happens only on the page refresh. Because, during 
   * page refresh the service-worker is installed/updated automatically.
   */
  async getUpdates() {
    return null;
  }
}