import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();

  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  if (request.method === "GET") {
    const pendingMigrations = await migrationRunner(defaultMigrationOptions);
    await dbClient.end();
    return response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST") {
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
    });

    await dbClient.end();

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }

    return response.status(200).json(migratedMigrations);
  }

  return response.status(405).end();
}

// export default async function migrations(request, response) {
//   switch (request.method) {
//     case "GET":
//       return handleGet(response);
//     case "POST":
//       return handlePost(response);
//     default:
//       return response.status(405).end();
//   }
// }

// async function handleGet(response) {
//   const pendingMigrations = await migrationRunner(
//     await getDefaultMigrationOptions(),
//   );

//   await dbClient.end();

//   return response.status(200).json(pendingMigrations);
// }

// async function handlePost(response) {
//   const migratedMigrations = await migrationRunner({
//     ...(await getDefaultMigrationOptions()),
//     dryRun: false,
//   });

//   await dbClient.end();

//   if (migratedMigrations.length > 0) {
//     return response.status(201).json(migratedMigrations);
//   }

//   return response.status(200).json(migratedMigrations);
// }

// /**
//  * Asynchronously provides the default configuration options for database migrations.
//  *
//  * This function connects to the database using a new client and constructs
//  * the default configuration options required for running migrations.
//  *
//  * @async
//  * @returns {Promise<import("node-pg-migrate").RunnerOption>}
//  * A promise that resolves to the default migration options.
//  */
// async function getDefaultMigrationOptions() {
//   const dbClient = await database.getNewClient();

//   return {
//     dbClient: dbClient,
//     dir: join("infra", "migrations"),
//     direction: "up",
//     dryRun: true,
//     migrationsTable: "pgmigrations",
//     verbose: true,
//   };
// }
// export default async function migrations(request, response) {
//   switch (request.method) {
//     case "GET":
//       return handleGet(response);
//     case "POST":
//       return handlePost(response);
//     default:
//       return response.status(405).end();
//   }
// }

// async function handleGet(response) {
//   const pendingMigrations = await migrationRunner(
//     await getDefaultMigrationOptions(),
//   );

//   await dbClient.end();

//   return response.status(200).json(pendingMigrations);
// }

// async function handlePost(response) {
//   const migratedMigrations = await migrationRunner({
//     ...(await getDefaultMigrationOptions()),
//     dryRun: false,
//   });

//   await dbClient.end();

//   if (migratedMigrations.length > 0) {
//     return response.status(201).json(migratedMigrations);
//   }

//   return response.status(200).json(migratedMigrations);
// }

// /**
//  * Asynchronously provides the default configuration options for database migrations.
//  *
//  * This function connects to the database using a new client and constructs
//  * the default configuration options required for running migrations.
//  *
//  * @async
//  * @returns {Promise<import("node-pg-migrate").RunnerOption>}
//  * A promise that resolves to the default migration options.
//  */
// async function getDefaultMigrationOptions() {
//   const dbClient = await database.getNewClient();

//   return {
//     dbClient: dbClient,
//     dir: join("infra", "migrations"),
//     direction: "up",
//     dryRun: true,
//     migrationsTable: "pgmigrations",
//     verbose: true,
//   };
// }
