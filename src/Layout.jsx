import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { handleDayRollover } from '@/components/system/DailyQuestGenerator';
import { getAnonUser } from '@/components/system/anonUser';
import { getOrCreateProfile } from '@/components/social/profileHelper';
const createPageUrl = (pageName) => `/${pageName}`;

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isChecking, setIsChecking] = React.useState(true);

  useEffect(() => {
    (async () => {
      try {
        await base44.auth.me();
        // Bootstrap profile on first load
        await getOrCreateProfile();
        setIsChecking(false);
      } catch (error) {
        // No valid session → redirect to Base44 login, which will come back with a session
        base44.auth.redirectToLogin(window.location.href);
      }
    })();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌿</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}