/**
 * Auth module barrel export.
 * Import auth helpers from '@/lib/auth' instead of individual files.
 */
export {
  registerAction,
  loginAction,
  logoutAction,
  getAuthUser,
  getAuthProfile,
  type AuthState,
} from './actions';
