import { Client } from "pg";

/**
 * Executes a query on the PostgreSQL database.
 *
 * This function connects to the PostgreSQL database using the configuration
 * provided by `getClientConfig()`, executes the query represented by `queryObject`,
 * and returns the result. If an error occurs, it is logged to the console. The
 * database connection is closed regardless of success or failure.
 *
 * @param {Object} queryObject - The query object that contains the SQL query and any parameters.
 * @param {string} queryObject.text - The SQL query string to be executed.
 * @param {Array} [queryObject.values] - An optional array of values to be used in the query (for parameterized queries).
 *
 * @returns {Promise<Object>} A promise that resolves to the result of the query. The result is typically an object containing the query result rows.
 * @throws {Error} Throws an error if the query fails (error is logged but not re-thrown).
 */
async function query(queryObject) {
  /** @type {import("pg").Client} */
  let client;

  try {
    client = await getNewClient();
    const result = await client.query(queryObject);

    return result;
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}

/**
 * Creates and returns a new PostgreSQL client instance.
 *
 * This function initializes a new `pg.Client` using the configuration provided
 * by `getClientConfig`. It connects the client to the database before returning it.
 *
 * @async
 * @returns {Promise<import("pg").Client>} A connected PostgreSQL client instance.
 */
async function getNewClient() {
  const client = new Client(getClientConfig());
  await client.connect();

  return client;
}

/**
 * Retrieves the PostgreSQL client configuration from environment variables.
 *
 * Constructs and returns a `ClientConfig` object for connecting to a
 * PostgreSQL database. The values are sourced from environment variables,
 * and the SSL configuration is determined by the `getSSLConfiguration` function.
 *
 * @returns {import("pg").ClientConfig} The PostgreSQL client configuration.
 */
function getClientConfig() {
  return {
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLConfiguration(),
  };
}

/**
 * Returns the SSL configuration based on the current environment.
 *
 * If `POSTGRES_CA` is set, it returns an object with a certificate authority (`ca`) value.
 * Otherwise, it returns `true` if the environment is production or `false` for other cases.
 *
 * @returns {boolean | import("pg").ConnectionOptions} The SSL configuration.
 */
function getSSLConfiguration() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }

  return isProduction();
}

/**
 * Determines if the application is running in the production environment.
 *
 * @returns {boolean} `true` if `NODE_ENV` is set to "production", `false` otherwise.
 */
function isProduction() {
  return process.env.NODE_ENV === "production";
}

const database = { getNewClient, query };

export default database;
