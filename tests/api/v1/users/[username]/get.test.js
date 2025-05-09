import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runMigrations();
});

describe("GET /api/v1/users/alvesluc", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const creationResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "alvesluc",
            email: "alvesluc.dev@gmail.com",
            password: "password123",
          }),
        },
      );

      expect(creationResponse.status).toBe(201);

      const userResponse = await fetch(
        "http://localhost:3000/api/v1/users/alvesluc",
      );

      expect(userResponse.status).toBe(200);

      const userResponseBody = await userResponse.json();

      expect(userResponseBody).toEqual({
        id: userResponseBody.id,
        username: "alvesluc",
        email: "alvesluc.dev@gmail.com",
        password: userResponseBody.password,
        created_at: userResponseBody.created_at,
        updated_at: userResponseBody.updated_at,
      });

      expect(uuidVersion(userResponseBody.id)).toBe(4);
      expect(Date.parse(userResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(userResponseBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const creationResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "alvesluk",
            email: "alvesluk.dev@gmail.com",
            password: "password123",
          }),
        },
      );

      expect(creationResponse.status).toBe(201);

      const userResponse = await fetch(
        "http://localhost:3000/api/v1/users/Alvesluk",
      );

      expect(userResponse.status).toBe(200);

      const userResponseBody = await userResponse.json();

      expect(userResponseBody).toEqual({
        id: userResponseBody.id,
        username: "alvesluk",
        email: "alvesluk.dev@gmail.com",
        password: userResponseBody.password,
        created_at: userResponseBody.created_at,
        updated_at: userResponseBody.updated_at,
      });

      expect(uuidVersion(userResponseBody.id)).toBe(4);
      expect(Date.parse(userResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(userResponseBody.updated_at)).not.toBeNaN();
    });

    test("With nonexistent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistentuser",
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "User not found.",
        action: "Please check the username and try again.",
        status_code: 404,
      });
    });
  });
});
