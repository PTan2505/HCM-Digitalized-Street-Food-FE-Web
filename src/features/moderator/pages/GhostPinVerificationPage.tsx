import type { JSX } from 'react';
import VendorVerificationPage from '@features/moderator/pages/VendorVerificationPage';

export default function GhostPinVerificationPage(): JSX.Element {
  return (
    <VendorVerificationPage
      pendingType={0}
      hiddenColumnKeys={[
        'branch.vendorId',
        'branch.vendorOwnerName',
        'branch.email',
        'branch.phoneNumber',
      ]}
    />
  );
}
