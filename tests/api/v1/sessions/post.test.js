import orchestrator from "tests/orchestrator";
import setCookieParser from "set-cookie-parser";
import { version as uuidVersion } from "uuid";
import sessions from "@/models/session";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runMigrations();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("With incorrect 'e-mail' but correct 'password'", async () => {
      await orchestrator.createUser({ password: "correct-password" });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrect@email.com",
          password: "correct-password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid email or password.",
        action:
          "Please check your credentials and try again. If the problem persists, consider resetting your password.",
        status_code: 401,
      });
    });

    test("With correct 'e-mail' but incorrect 'password'", async () => {
      await orchestrator.createUser({ email: "correct@email.com" });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correct@email.com",
          password: "incorrect-password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid email or password.",
        action:
          "Please check your credentials and try again. If the problem persists, consider resetting your password.",
        status_code: 401,
      });
    });

    test("With incorrect 'e-mail' and incorrect 'password'", async () => {
      await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrect@email.com",
          password: "incorrect-password",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Invalid email or password.",
        action:
          "Please check your credentials and try again. If the problem persists, consider resetting your password.",
        status_code: 401,
      });
    });

    test("With correct 'e-mail' and correct 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        email: "all.correct@mail.com",
        password: "all-correct",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "all.correct@mail.com",
          password: "all-correct",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdUser.id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.user_id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();

      const expiresAt = new Date(responseBody.expires_at);
      const createdAt = new Date(responseBody.created_at);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(expiresAt - createdAt).toBe(sessions.EXPIRATION_IN_MILLISECONDS);

      const parsedSetCookie = setCookieParser(response, { map: true });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: responseBody.token,
        maxAge: sessions.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
