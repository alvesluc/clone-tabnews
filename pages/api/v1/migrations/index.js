import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import controller from "@/infra/controller";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

/**
 * @param {import("next").NextApiRequest} request - The incoming HTTP request.
 * @param {import("next").NextApiResponse} response - The HTTP response object.
 */
async function getHandler(request, response) {
  /** @type {import("pg").Client} */
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner(
      createMigrationOptions(dbClient),
    );

    return response.status(200).json(pendingMigrations);
  } finally {
    await dbClient.end();
  }
}

/**
 * @param {import("next").NextApiRequest} request - The incoming HTTP request.
 * @param {import("next").NextApiResponse} response - The HTTP response object.
 */
async function postHandler(request, response) {
  /** @type {import("pg").Client} */
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner(
      createMigrationOptions(dbClient, { dryRun: false }),
    );

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    return response.status(200).json(migratedMigrations);
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
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
}

export default router.handler(controller.errorHandlers);
