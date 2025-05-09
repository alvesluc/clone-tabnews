import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import user from "@/models/user";
import password from "@/models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const validUsername = "alvesluc";
      const validPassword = "password123";
      const validEmail = "alvesluc.dev@gmail.com";

      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: validUsername,
          email: validEmail,
          password: validPassword,
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: validUsername,
        email: validEmail,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const registeredUser = await user.findOneByUsername(validUsername);
      
      const correctPasswordMatches = await password.compare(
        validPassword,
        registeredUser.password,
      );

      expect(correctPasswordMatches).toBe(true);

      const incorrectPasswordMatches = await password.compare(
        "incorrectPassword",
        registeredUser.password,
      );

      expect(incorrectPasswordMatches).toBe(false);
    });

    test("With duplicated 'email'", async () => {
      const firstResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicatedEmail",
          email: "duplicated@user.com",
          password: "password123",
        }),
      });

      expect(firstResponse.status).toBe(201);

      const secondResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicatedEmailTest",
          email: "Duplicated@user.com",
          password: "password123",
        }),
      });

      expect(secondResponse.status).toBe(400);

      const secondResponseBody = await secondResponse.json();

      expect(secondResponseBody).toEqual({
        name: "ValidationError",
        status_code: 400,
        message: "Email already exists.",
        action: "Please use a different email.",
      });
    });

    test("With duplicated 'username'", async () => {
      const firstResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicatedUser",
          email: "duplicatedUsername@user.com",
          password: "password123",
        }),
      });

      expect(firstResponse.status).toBe(201);

      const secondResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicatedUser",
          email: "duplicatedUsernameTest@user.com",
          password: "password123",
        }),
      });

      expect(secondResponse.status).toBe(400);

      const secondResponseBody = await secondResponse.json();

      expect(secondResponseBody).toEqual({
        name: "ValidationError",
        status_code: 400,
        message: "Username already in use.",
        action: "Please use a different username.",
      });
    });
  });
});
