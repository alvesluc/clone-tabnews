import database from "infra/database";

export default async function status(request, response) {
  const updatedAt = new Date().toISOString();

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: await getDatabaseVersion(),
        max_connections: await getDatabaseMaxConnections(),
        open_connections: await getDatabaseOpenConnections(),
      },
    },
  });
}

/**
 * Retrieves the version of the PostgreSQL server.
 *
 * This function queries the database to fetch the server version.
 *
 * @async
 * @returns {Promise<string>} A promise that resolves to the PostgreSQL server version.
 * @throws {Error} Throws an error if the query fails.
 */
async function getDatabaseVersion() {
  const versionResult = await database.query("SHOW server_version;");
  return versionResult.rows[0].server_version;
}

/**
 * Retrieves the maximum number of connections allowed by the PostgreSQL server.
 *
 * This function queries the database to fetch the `max_connections` setting.
 *
 * @async
 * @returns {Promise<number>} A promise that resolves to the maximum number of connections.
 * @throws {Error} Throws an error if the query fails.
 */
async function getDatabaseMaxConnections() {
  const maxConnectionsResult = await database.query("SHOW max_connections;");
  return parseInt(maxConnectionsResult.rows[0].max_connections, 10);
}

/**
 * Retrieves the number of currently open connections to the PostgreSQL database.
 *
 * This function queries the `pg_stat_activity` table to count the open connections
 * for the database specified in the `POSTGRES_DB` environment variable.
 *
 * @async
 * @returns {Promise<number>} A promise that resolves to the number of open connections.
 * @throws {Error} Throws an error if the query fails.
 */
async function getDatabaseOpenConnections() {
  const databaseName = process.env.POSTGRES_DB;

  const openConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  return openConnections.rows[0].count;
}
