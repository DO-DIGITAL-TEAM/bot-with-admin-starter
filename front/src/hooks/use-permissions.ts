import { Permission } from "@/types";
import { useCurrentUser } from "./use-current-user";

export const usePermissions = () => {
  const { user, isSuccess } = useCurrentUser();
  // @ts-ignore
  const permissions = user?.role.permissions.map(p => p.name as Permission) || [];

  const hasPermission = (requiredPermissions: Permission[] | undefined) => {
    if (!requiredPermissions) return;
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  return { hasPermission, permissions, user, isSuccess };
};
