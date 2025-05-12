import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import user from "@/models/user";
import password from "@/models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runMigrations();
});

describe("PATCH /api/v1/users/alvesluc", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistentuser",
        {
          method: "PATCH",
        },
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

    test("With unique 'username'", async () => {
      const firstUser = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "valid_unique_username",
          email: "valid_unique_username@user.com",
          password: "password123",
        }),
      });

      expect(firstUser.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/valid_unique_username",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "different_unique_username",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "different_unique_username",
        email: "valid_unique_username@user.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With duplicated 'username'", async () => {
      const firstUser = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "unique_username",
          email: "unique_username@user.com",
          password: "password123",
        }),
      });

      expect(firstUser.status).toBe(201);

      const secondUser = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "non_unique_username",
          email: "non_unique_username@user.com",
          password: "password123",
        }),
      });

      expect(secondUser.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/non_unique_username",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "unique_username",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        status_code: 400,
        message: "Username already in use.",
        action: "Please choose a different username.",
      });
    });

    test("With same 'username'", async () => {
      const firstUser = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "same_username",
          email: "same_username@user.com",
          password: "password123",
        }),
      });

      expect(firstUser.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/non_unique_username",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "same_username",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        status_code: 400,
        message: "Username already in use.",
        action: "Please choose a different username.",
      });
    });

    test("With unique 'email'", async () => {
      const firstUser = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "valid_unique_email",
          email: "valid_unique_email@user.com",
          password: "password123",
        }),
      });

      expect(firstUser.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/valid_unique_email",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "different_unique_email@user.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "valid_unique_email",
        email: "different_unique_email@user.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With duplicated 'email'", async () => {
      const firstUser = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "unique_email",
          email: "unique_email@user.com",
          password: "password123",
        }),
      });

      expect(firstUser.status).toBe(201);

      const secondUser = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "non_unique_email",
          email: "non_unique_email@user.com",
          password: "password123",
        }),
      });

      expect(secondUser.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/non_unique_email",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "unique_email@user.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        status_code: 400,
        message: "Email already in use.",
        action: "Please choose a different email.",
      });
    });

    test("With same 'email'", async () => {
      const firstUser = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "same_email",
          email: "same_email@user.com",
          password: "password123",
        }),
      });

      expect(firstUser.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/non_unique_username",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "same_email@user.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        status_code: 400,
        message: "Email already in use.",
        action: "Please choose a different email.",
      });
    });

    test("With new 'password'", async () => {
      const registeredUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "update_password",
            email: "update_password@user.com",
            password: "password123",
          }),
        },
      );

      expect(registeredUserResponse.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/update_password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "password321",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "update_password",
        email: "update_password@user.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername("update_password");

      const correctPasswordMatches = await password.compare(
        "password321",
        userInDatabase.password,
      );

      expect(correctPasswordMatches).toBe(true);

      const incorrectPasswordMatches = await password.compare(
        "password123",
        userInDatabase.password,
      );

      expect(incorrectPasswordMatches).toBe(false);
    });
  });
});
