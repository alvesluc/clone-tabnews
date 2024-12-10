import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

/**
 * @param {import("next").NextApiRequest} request - The incoming HTTP request.
 * @param {import("next").NextApiResponse} response - The HTTP response object.
 */
export default async function migrations(request, response) {
  if (isInvalidRequest(request)) {
    return response.status(405).json({
      error: `Method ${request.method} not allowed`,
    });
  }

  /** @type {import("pg").Client} */
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(
        createMigrationOptions(dbClient),
      );

      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner(
        createMigrationOptions(dbClient, { dryRun: false }),
      );

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }
 
      return response.status(200).json(migratedMigrations);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}

/**
 * Creates the configuration options for database migrations.
 *
 * @param {import("pg").Client} dbClient - The PostgreSQL client instance.
 * @param {Object} [options] - Additional options for the migration.
 * @param {boolean} [options.dryRun=true] - Whether the migration should be a dry run (default is `true`).
 * @returns {import("node-pg-migrate").RunnerOption} The migration configuration options.
 */
function createMigrationOptions(dbClient, { dryRun = true } = {}) {
  return {
    dbClient: dbClient,
    dryRun: dryRun,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
}

/**
 * Determines if the incoming request has an invalid HTTP method.
 *
 * @param {import("next").NextApiRequest} request - The HTTP request object.
 * @returns {boolean} `true` if the request method is invalid, `false` otherwise.
 */
function isInvalidRequest(request) {
  const validRequestMethods = ["GET", "POST"];

  return !validRequestMethods.includes(request.method);
}
