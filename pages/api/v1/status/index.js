import database from "infra/database";

async function status(request, response) {
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

async function getDatabaseVersion() {
  const versionResult = await database.query("SHOW server_version;");

  return versionResult.rows[0].server_version;
}

async function getDatabaseMaxConnections() {
  const maxConnectionsResult = await database.query("SHOW max_connections;");

  return parseInt(maxConnectionsResult.rows[0].max_connections);
}

async function getDatabaseOpenConnections() {
  const databaseName = process.env.POSTGRES_DB;

  const openConnections = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  return openConnections.rows[0].count;
}

export default status;
