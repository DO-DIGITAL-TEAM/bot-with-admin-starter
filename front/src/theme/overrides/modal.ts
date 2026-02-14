import { ModalOverlay } from '@mantine/core';

export default {
  ModalOverlay: ModalOverlay.extend({
    defaultProps: {
      backgroundOpacity: 0.5,
      blur: 2,
    },
  }),
};
