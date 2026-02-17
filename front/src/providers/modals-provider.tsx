import { AdminModal, LangModal, WordbookModal } from "@/components/widgets/modals";
import { ModalsProvider } from '@mantine/modals';
import { FC, ReactNode } from "react";

interface IProps {
  children: ReactNode;
}

const modals = {
  ADMIN: AdminModal,
  LANG: LangModal,
  WORDBOOK: WordbookModal,
};

export const MODAL_NAMES = Object.keys(modals).reduce((acc, key) => {
  acc[key as keyof typeof modals] = key;
  return acc;
}, {} as Record<keyof typeof modals, string>);

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals;
  }
}

export const CustomModalsProvider: FC<IProps> = ({ children }) => {
  return <ModalsProvider modals={modals}>{children}</ModalsProvider>;
};
