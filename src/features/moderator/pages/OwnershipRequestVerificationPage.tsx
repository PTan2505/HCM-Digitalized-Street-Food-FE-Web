import type { JSX } from 'react';
import VendorVerificationPage from '@features/moderator/pages/VendorVerificationPage';

export default function OwnershipRequestVerificationPage(): JSX.Element {
  return (
    <VendorVerificationPage
      pendingType={2}
      hiddenColumnKeys={[
        'branch.vendorId',
        'branch.vendorOwnerName',
        'branch.email',
        'branch.phoneNumber',
      ]}
    />
  );
}
