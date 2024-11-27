import { Client } from "pg";

function getClientConfig() {
  return {
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  };
}

function getSSLValues() {
  return process.env.NODE_ENV === "development" ? false : true;
}

/**
 * Executes a SQL query on the PostgreSQL database.
 * @param {string|{text: string, values: Array<any>}} queryObject - The SQL query to execute. Can be either a string representing the query or an object with `text` property representing the query text and `values` property representing the parameterized values.
 * @returns {Promise<QueryResult<any>>} A Promise that resolves with the result of the SQL query.
 */
async function query(queryObject) {
  const client = new Client(getClientConfig());

  try {
    await client.connect();
    const result = await client.query(queryObject);

    return result;
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
}

export default {
  query: query,
};
