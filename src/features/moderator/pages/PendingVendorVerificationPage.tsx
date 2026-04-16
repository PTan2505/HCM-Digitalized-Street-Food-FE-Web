import type { JSX } from 'react';
import VendorVerificationPage from '@features/moderator/pages/VendorVerificationPage';

export default function PendingVendorVerificationPage(): JSX.Element {
  return <VendorVerificationPage pendingType={1} />;
}
