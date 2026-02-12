'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionProvider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Shield, ShieldAlert, Loader2 } from 'lucide-react';

interface AppSimulationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: number;
  applicationName: string;
}

interface AppRole {
  roleName: string;
  canView: boolean;
  canEdit: boolean;
}

export default function AppSimulationModal({
  open,
  onOpenChange,
  applicationId,
  applicationName,
}: AppSimulationModalProps) {
  const session = useSession();
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRoles, setFetchingRoles] = useState(false);

  const isAdmin = session?.roles?.includes('Administrators');

  // Fetch available roles for this app
  useEffect(() => {
    if (open && isAdmin) {
      fetchAvailableRoles();
      fetchSimulationStatus();
    }
  }, [open, isAdmin, applicationId]);

  const fetchAvailableRoles = async () => {
    setFetchingRoles(true);
    try {
      const response = await fetch(
        `/api/admin/simulation/app/roles?applicationId=${applicationId}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setFetchingRoles(false);
    }
  };

  const fetchSimulationStatus = async () => {
    try {
      const response = await fetch('/api/admin/simulation/app');
      if (response.ok) {
        const data = await response.json();
        const isActive = data.active && data.applicationId === applicationId;
        setIsSimulating(isActive);
        if (isActive && data.roles) {
          setSelectedRoles(data.roles);
        } else {
          setSelectedRoles([]);
        }
      }
    } catch (error) {
      console.error('Error fetching simulation status:', error);
    }
  };

  const handleToggleSimulation = async (checked: boolean) => {
    if (!checked) {
      // Disable simulation
      setLoading(true);
      try {
        const response = await fetch('/api/admin/simulation/app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId: null }),
        });

        if (response.ok) {
          setIsSimulating(false);
          setSelectedRoles([]);
          window.location.reload();
        }
      } catch (error) {
        console.error('Error disabling simulation:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Just enable the toggle, user needs to select roles and apply
      setIsSimulating(true);
    }
  };

  const handleToggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
    );
  };

  const handleApply = async () => {
    if (selectedRoles.length === 0) {
      alert('Please select at least one role to simulate');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/simulation/app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          roles: selectedRoles,
        }),
      });

      if (response.ok) {
        // Reload to apply simulation
        window.location.reload();
      } else {
        alert('Failed to apply simulation');
      }
    } catch (error) {
      console.error('Error applying simulation:', error);
      alert('Failed to apply simulation');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSimulating ? (
              <ShieldAlert className="h-5 w-5 text-amber-600" />
            ) : (
              <Shield className="text-muted-foreground h-5 w-5" />
            )}
            Permission Testing - {applicationName}
          </DialogTitle>
          <DialogDescription>
            Test this app with specific role permissions by removing your admin privileges.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Enable/Disable Simulation Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="simulation-enabled" className="text-base font-medium">
              Enable Simulation Mode
            </Label>
            <Switch
              id="simulation-enabled"
              checked={isSimulating}
              onCheckedChange={handleToggleSimulation}
              disabled={loading}
            />
          </div>

          {isSimulating && (
            <>
              <div className="border-t pt-4">
                <Label className="mb-3 block text-sm font-medium">
                  Select Roles to Test ({selectedRoles.length} selected)
                </Label>

                {fetchingRoles ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="text-primary h-6 w-6 animate-spin" />
                  </div>
                ) : availableRoles.length === 0 ? (
                  <div className="text-muted-foreground py-4 text-center text-sm">
                    No roles configured for this app
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableRoles.map((role) => (
                      <div
                        key={role.roleName}
                        className="hover:bg-muted/50 flex items-start space-x-3 rounded-lg border p-3 transition-colors"
                      >
                        <Checkbox
                          id={`role-${role.roleName}`}
                          checked={selectedRoles.includes(role.roleName)}
                          onCheckedChange={() => handleToggleRole(role.roleName)}
                          disabled={loading}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`role-${role.roleName}`}
                            className="cursor-pointer text-sm font-medium"
                          >
                            {role.roleName}
                          </label>
                          <p className="text-muted-foreground text-xs">
                            {role.canView && 'View'}
                            {role.canView && role.canEdit && ' • '}
                            {role.canEdit && 'Edit'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleApply}
                  disabled={loading || selectedRoles.length === 0}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    'Apply Simulation'
                  )}
                </Button>
                <Button onClick={() => onOpenChange(false)} variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> When you apply simulation, the page will reload and your
                  admin role will be temporarily removed for this app only.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
