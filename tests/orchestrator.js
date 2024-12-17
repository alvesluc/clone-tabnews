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
    return retry(fetchStatusPage, { retries: 100, maxTimeout: 1_000 });

    /**
     * Fetches the status page of the web server.
     *
     * It checks if the server responds with an HTTP 200 status code, indicating
     * that the server is available.
     *
     * @async
     * @returns {Promise<void>} Resolves if the status page is fetched successfully
     * and the response status is 200.
     * @throws {Error} Throws an error if the server does not respond with a 200 status.
     */
    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (response.status !== 200) {
        throw new Error("Server is not ready.");
      }
    }
  }
}

const orchestrator = {
  waitForAllServices,
};

export default orchestrator;
