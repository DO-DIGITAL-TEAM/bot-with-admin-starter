import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { Admin } from "typeorm";

export const CurrentAdmin = createParamDecorator((data: keyof Admin, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;

  return data ? user[data] : user;
});
