import { redirect } from 'next/navigation';

export default function LegacyHealthPage() {
  return redirect('/admin/health');
}
