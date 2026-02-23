'use client';

import { AuthGuard } from '@/src/components/AuthGuard';

export default function BoardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Board coming soon...</p>
      </div>
    </AuthGuard>
  );
}
