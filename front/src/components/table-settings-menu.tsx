import { ActionIcon, Box, Menu, rem, Tooltip } from "@mantine/core";
import { FC, ReactNode } from "react";
import { PiGear, PiToggleRight, PiClockCounterClockwiseDuotone } from "react-icons/pi";
import { AiOutlineColumnWidth } from "react-icons/ai";

interface MenuItem {
  label: string;
  leftSection: ReactNode;
  onClick: () => void;
}

interface Props {
  resetColumnsToggle: () => void;
  resetColumnsOrder: () => void;
  resetColumnsWidth: () => void;
}

export const TableSettingsMenu: FC<Props> = ({ resetColumnsToggle, resetColumnsOrder, resetColumnsWidth }) => {
  const menuItems: MenuItem[] = [
    {
      label: "Reset toggled columns",
      leftSection: <PiToggleRight />,
      onClick: resetColumnsToggle,
    },
    {
      label: "Reset column widths",
      leftSection: <AiOutlineColumnWidth />,
      onClick: resetColumnsWidth,
    },
    {
      label: "Reset column order",
      leftSection: <PiClockCounterClockwiseDuotone />,
      onClick: resetColumnsOrder,
    },
  ];

  return (
    <Menu>
      <Menu.Target>
        <Box>
            <Tooltip
              label="Table settings"
              position="bottom"
              withArrow
            >
              <ActionIcon variant='default' size={rem(30)}>
                <PiGear />
              </ActionIcon>
            </Tooltip>
        </Box>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Table settings</Menu.Label>
        {menuItems.map(({ label, ...props }, i) =>
          <Menu.Item key={i} {...props}>{label}</Menu.Item>)}
      </Menu.Dropdown>
    </Menu>
  );
};
