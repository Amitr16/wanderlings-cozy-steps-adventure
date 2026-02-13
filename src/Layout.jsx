import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { handleDayRollover } from '@/components/system/DailyQuestGenerator';
import { getAnonUser } from '@/components/system/anonUser';
const createPageUrl = (pageName) => `/${pageName}`;

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: progress, isLoading, isError, error } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const user = getAnonUser();
      const results = await base44.entities.UserProgress.filter({ created_by: user.email });
      return results && results[0] ? results[0] : null;
    },
    retry: false
  });

  useEffect(() => {
    // Don't redirect if there's an API error
    if (isError) return;

    // Redirect to onboarding if not complete
    if (!isLoading && currentPageName !== 'Onboarding') {
      if (!progress || !progress.onboarding_complete) {
        navigate(createPageUrl('Onboarding'));
      }
    }
  }, [progress, isLoading, isError, currentPageName, navigate]);

  useEffect(() => {
    // Handle daily rollover
    if (progress && progress.onboarding_complete && currentPageName !== 'Onboarding') {
      handleDayRollover(progress).then((result) => {
        if (result.dayChanged) {
          queryClient.invalidateQueries(['userProgress']);
          queryClient.invalidateQueries(['quests']);
        }
      });
    }
  }, [progress, currentPageName, queryClient]);

  // Show loading while checking progress
  if (isLoading && currentPageName !== 'Onboarding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🌿</div>
          <p className="text-gray-600">Loading Wanderlings...</p>
        </div>
      </div>
    );
  }

  // Show error if API fails
  if (isError && currentPageName !== 'Onboarding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white p-8 rounded-2xl border-2 border-red-200 shadow-lg">
          <div className="text-2xl font-bold mb-2 text-red-600">⚠️ Connection Issue</div>
          <p className="text-sm text-gray-600 mb-4">{String(error?.message || 'Failed to load user data')}</p>
          <button onClick={() => window.location.reload()} className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Try Again
          </button>
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