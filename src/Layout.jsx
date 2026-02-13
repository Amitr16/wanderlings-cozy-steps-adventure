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

  // No auth check - just let users test freely

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}