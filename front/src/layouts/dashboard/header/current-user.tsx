import { PiSignOut } from 'react-icons/pi';
import { Avatar, AvatarProps, ElementProps, Menu } from '@mantine/core';
import { useAuth, useGetAccountInfo, useLogout } from '@/hooks';
import { app } from '@/config';

type CurrentUserProps = Omit<AvatarProps, 'src' | 'alt'> & ElementProps<'div', keyof AvatarProps>;

export function CurrentUser(props: CurrentUserProps) {
  const { mutate: logout } = useLogout();
  const { setIsAuthenticated } = useAuth();
  // const { data: user } = useGetAccountInfo();

  const handleLogout = () => {
    localStorage.removeItem(app.accessTokenStoreKey);
    setIsAuthenticated(false)
  };

  return (
    <Menu>
      <Menu.Target>
        <Avatar
          // src={user?.avatarUrl}
          // alt={user?.displayName ?? 'Current user'}
          alt={'Current user'}
          {...props}
          style={{ cursor: 'pointer', ...props.style }}
        >
          CU
        </Avatar>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<PiSignOut size="1rem" />} onClick={handleLogout}>
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
