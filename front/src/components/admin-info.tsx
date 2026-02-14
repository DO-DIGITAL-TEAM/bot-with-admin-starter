import { Admin } from "@/api/entities";
import { firstLetters } from "@/utilities/text";
import { Avatar, Box, Group, rem, Text } from "@mantine/core";
import { FC } from "react";

interface Props {
  admin?: Admin | undefined | null;
}

export const AdminInfo: FC<Props> = ({ admin }) => {
  return (
    admin ?
      <Group wrap="nowrap">
        <Avatar src={admin.image} alt={admin.username}>
          {firstLetters(admin.username)}
        </Avatar>
        <Box w="16rem">
          <Text truncate="end" fz={rem(14)}>{admin.username}</Text>
          <Text size="sm" c="dimmed" truncate="end" fz={rem(14)}>
            {admin.email}
          </Text>
        </Box>
      </Group> :
      <>N/A</>
  )
};

