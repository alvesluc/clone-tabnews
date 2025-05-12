import { createRouter } from "next-connect";
import controller from "@/infra/controller";
import user from "@/models/user";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

/**
 * @param {import("next").NextApiRequest} request - The incoming HTTP request.
 * @param {import("next").NextApiResponse} response - The HTTP response object.
 */
async function getHandler(request, response) {
  const { username } = request.query;
  const userFound = await user.findOneByUsername(username);

  return response.status(200).json(userFound);
}

/**
 * @param {import("next").NextApiRequest} request - The incoming HTTP request.
 * @param {import("next").NextApiResponse} response - The HTTP response object.
 */
async function patchHandler(request, response) {
  const { username } = request.query;
  const userInputValues = request.body;

  const updateUser = await user.update(username, userInputValues);

  return response.status(200).json(updateUser);
}

export default router.handler(controller.errorHandlers);
