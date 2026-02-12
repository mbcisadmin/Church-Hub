'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SimulationStatus {
  active: boolean;
  type?: 'impersonate' | 'roles' | 'app';
  user?: {
    Contact_ID: number;
    Display_Name: string;
    Email_Address: string;
    Nickname?: string;
    First_Name?: string;
    Last_Name?: string;
    Image_GUID?: string;
  };
  roles?: string[];
  applicationId?: number;
}

const BANNER_HEIGHT = '48px'; // Height of the banner to offset content
const HEADER_HEIGHT = '64px'; // Height of main header (h-16 = 64px)

export default function SimulationBanner() {
  const [status, setStatus] = useState<SimulationStatus>({ active: false });
  const [loading, setLoading] = useState(true);
  const [appName, setAppName] = useState<string>('');

  useEffect(() => {
    fetchStatus();
  }, []);

  // Add padding to body when banner is active (for header + banner)
  useEffect(() => {
    if (status.active) {
      document.body.style.paddingTop = `calc(${HEADER_HEIGHT} + ${BANNER_HEIGHT})`;
    } else {
      document.body.style.paddingTop = HEADER_HEIGHT;
    }

    return () => {
      document.body.style.paddingTop = HEADER_HEIGHT;
    };
  }, [status.active]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/simulation/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);

        // If app-specific simulation, fetch the app name
        if (data.type === 'app' && data.applicationId) {
          const appResponse = await fetch(`/api/applications/${data.applicationId}`);
          if (appResponse.ok) {
            const appData = await appResponse.json();
            setAppName(appData.name || '');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching simulation status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExit = async () => {
    try {
      const response = await fetch('/api/admin/simulation/clear', {
        method: 'POST',
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error exiting simulation:', error);
    }
  };

  if (loading || !status.active) {
    return null;
  }

  // Get avatar URL for impersonated user
  const getAvatarUrl = () => {
    if (status.type === 'impersonate' && status.user?.Image_GUID) {
      const mpBase = process.env.NEXT_PUBLIC_MINISTRY_PLATFORM_BASE_URL || '';
      return `${mpBase}/ministryplatformapi/files/${status.user.Image_GUID}`;
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();

  // Format name as Nickname (fallback to First_Name) + Last_Name
  const getFormattedName = () => {
    if (status.type === 'impersonate' && status.user) {
      const firstName = status.user.Nickname || status.user.First_Name || '';
      const lastName = status.user.Last_Name || '';
      return `${firstName} ${lastName}`.trim();
    }
    return '';
  };

  return (
    <div
      className="fixed right-0 left-0 z-[45] bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
      style={{ top: HEADER_HEIGHT, height: BANNER_HEIGHT }}
    >
      <div className="container mx-auto flex h-full items-center px-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            {status.type === 'impersonate' ? (
              <div>
                <p className="text-sm font-semibold">Impersonating: {getFormattedName()}</p>
                <p className="text-xs opacity-90">{status.user?.Email_Address}</p>
              </div>
            ) : status.type === 'app' ? (
              <div>
                <p className="text-sm font-semibold">
                  Testing {appName} with Roles:{' '}
                  {status.roles && status.roles.length > 0 ? status.roles.join(', ') : 'No Roles'}
                </p>
                <p className="text-xs opacity-90">Admin privileges removed for this app only</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold">
                  Simulating Roles:{' '}
                  {status.roles && status.roles.length > 0 ? status.roles.join(', ') : 'No Roles'}
                </p>
                <p className="text-xs opacity-90">Testing permission-based features</p>
              </div>
            )}
          </div>

          <button
            onClick={handleExit}
            className="flex items-center gap-2 rounded-md bg-white/20 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/30"
          >
            <X className="h-4 w-4" />
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
