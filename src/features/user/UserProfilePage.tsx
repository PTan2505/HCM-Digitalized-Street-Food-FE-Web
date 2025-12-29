import { useAppSelector } from '@hooks/reduxHooks';
import { axiosApi } from '@lib/api/apiInstance';
import { selectUser } from '@slices/auth';

import { type JSX } from 'react';

export const UserProfilePage = (): JSX.Element => {
  const user = useAppSelector(selectUser);
  return (
    <>
      {user && <div className="title-large">{user.phoneNumber}</div>}
      <button
        onClick={() => axiosApi.userProfileApi.getUserList().then(console.log)}
      >
        get icd
      </button>
    </>
  );
};
