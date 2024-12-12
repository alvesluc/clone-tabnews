import retry from "async-retry";

/**
 * Waits for all required services to become available.
 *
 * This function sequentially ensures the availability of critical services,
 * such as the web server, before proceeding.
 *
 * @async
 * @returns {Promise<void>} Resolves when all services are ready.
 */
async function waitForAllServices() {
  await waitForWebServer();

  /**
   * Waits for the web server to respond successfully.
   *
   * Uses the `async-retry` library to repeatedly attempt fetching the web server's
   * status page until it becomes available.
   *
   * @async
   * @returns {Promise<void>} Resolves when the web server is available.
   * @throws {Error} Throws an error if all retry attempts fail.
   */
  async function waitForWebServer() {
    return retry(fetchStatusPage, { retries: 100 });

    /**
     * Fetches the status page of the web server.
     *
     * This function attempts to retrieve and parse the status page from
     * the web server at `http://localhost:3000/api/v1/status`.
     *
     * @async
     * @returns {Promise<void>} Resolves if the status page is fetched and parsed successfully.
     * @throws {Error} Throws an error if the fetch operation fails.
     */
    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      await response.json();
    }
  }
}

export default {
  waitForAllServices,
};
