import { Box, SegmentedControl, SegmentedControlProps, Text } from "@mantine/core";
import { FC } from "react";

export const SegmentedControlWithLabel: FC<SegmentedControlProps & { label: string }> = ({ label, ...props }) => {
  return (
    <Box>
      <Text size="sm" fw={500} mb={3}>{label}</Text>
      <SegmentedControl {...props} />
    </Box>
  );
};
