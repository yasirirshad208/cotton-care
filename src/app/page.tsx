import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to login by default, or to detect if already authenticated (handled by AuthGuard/AuthContext)
  redirect('/detect');
}
