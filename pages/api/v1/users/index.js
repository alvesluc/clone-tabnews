import { createRouter } from "next-connect";
import controller from "@/infra/controller";
import user from "@/models/user";

const router = createRouter();

router.post(postHandler);

/**
 * @param {import("next").NextApiRequest} request - The incoming HTTP request.
 * @param {import("next").NextApiResponse} response - The HTTP response object.
 */
async function postHandler(request, response) {
  const userInputValues = request.body;

  const newUser = await user.create(userInputValues);

  return response.status(201).json(newUser);
}

export default router.handler(controller.errorHandlers);
