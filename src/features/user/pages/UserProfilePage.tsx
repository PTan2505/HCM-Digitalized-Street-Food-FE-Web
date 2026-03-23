import { useAppSelector } from '@hooks/reduxHooks';
import { selectUser } from '@slices/auth';

import { type JSX } from 'react';

export const UserProfilePage = (): JSX.Element => {
  const user = useAppSelector(selectUser);
  return <>{user && <div className="title-large">{user.phoneNumber}</div>}</>;
};
