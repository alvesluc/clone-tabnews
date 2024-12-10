import database from "infra/database";

async function clearDatabase() {
  await database.query("drop schema public cascade;");
  await database.query("create schema public;");
}

beforeAll(async () => {
  await clearDatabase();
});

test("POST to /api/v1/migrations processes migrations and returns 200", async () => {
  const firstResponse = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(firstResponse.status).toBe(201);

  const firstResponseBody = await firstResponse.json();
  expect(Array.isArray(firstResponseBody)).toBe(true);

  await Promise.all(
    firstResponseBody.map(async (migration) => {
      expect(migration).toHaveProperty("name");
      expect(typeof migration.name).toBe("string");

      const result = await database.query({
        text: "SELECT count(*)::int FROM public.pgmigrations WHERE name = $1",
        values: [migration.name],
      });

      const migrationCount = result.rows[0].count;
      expect(migrationCount).toBeGreaterThan(0);
    }),
  );

  const confirmationResponse = await fetch(
    "http://localhost:3000/api/v1/migrations",
    { method: "POST" },
  );
  expect(confirmationResponse.status).toBe(200);

  const confirmationResponseBody = await confirmationResponse.json();
  expect(Array.isArray(confirmationResponseBody)).toBe(true);
  expect(confirmationResponseBody.length).toBe(0);
});