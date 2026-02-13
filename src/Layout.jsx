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

  const { data: progress, isLoading } = useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const user = getAnonUser();
      const results = await base44.entities.UserProgress.filter({ created_by: user.email });
      return results && results[0] ? results[0] : null;
    },
    retry: false
  });

  useEffect(() => {
    // Redirect to onboarding if not complete
    if (!isLoading && currentPageName !== 'Onboarding') {
      if (!progress || !progress.onboarding_complete) {
        navigate(createPageUrl('Onboarding'));
      }
    }
  }, [progress, isLoading, currentPageName, navigate]);

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

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}