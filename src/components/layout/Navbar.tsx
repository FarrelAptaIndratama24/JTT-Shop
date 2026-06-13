import { getAuthProfile } from '@/lib/auth/actions';
import { NavbarClient } from './NavbarClient';

/**
 * Server Component wrapper — fetches session on server,
 * passes result to the interactive Client Component.
 */
export async function Navbar() {
  const profile = await getAuthProfile();
  return <NavbarClient profile={profile} />;
}
