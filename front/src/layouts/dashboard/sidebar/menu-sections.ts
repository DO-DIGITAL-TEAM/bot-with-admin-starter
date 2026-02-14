import { ElementType } from 'react';
import {
  PiUserPlusDuotone,
} from 'react-icons/pi';
import { paths } from '@/routes/paths';

interface MenuItem {
  header: string;
  section: {
    name: string;
    href: string;
    icon: ElementType;
    key?: string | undefined;
    dropdownItems?: {
      name: string;
      href: string;
      badge?: string;
    }[];
  }[];
}

export const menu: MenuItem[] = [
  {
    header: 'Management',
    section: [
      {
        name: 'Admins',
        key: 'admins',
        icon: PiUserPlusDuotone,
        href: paths.dashboard.management.admins.list,
      },
    ],
  },
];
