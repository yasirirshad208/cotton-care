import { redirect } from 'next/navigation';

export default function AdminDashboardPage() {
  // Redirect to the primary admin section by default
  redirect('/admin/products');
}
