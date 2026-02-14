import { parseJwt } from "@/utilities/jwt";
import { app } from "@/config";
import { useOneAdmin } from "./api";

export const useCurrentUser = () => {
  const accessToken = localStorage.getItem(app.accessTokenStoreKey);
  //@ts-ignore
  const tokenData = parseJwt(accessToken);
  const { data: user, isSuccess } = useOneAdmin({ route: { id: tokenData?.id }});
  return { user: user?.data, isSuccess };
};
