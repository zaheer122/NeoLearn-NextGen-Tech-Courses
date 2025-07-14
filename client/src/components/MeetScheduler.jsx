import React, { useState } from 'react';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { format, addHours, parseISO } from 'date-fns';
import { Calendar, Clock, X, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

const MeetScheduler = ({ onSchedule, onClose }) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [duration, setDuration] = useState(60); // Default 1 hour
  const [description, setDescription] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [googleToken, setGoogleToken] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showScopeError, setShowScopeError] = useState(false);

  // Custom login with proper scopes
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google authentication successful with access token");
      setGoogleToken(tokenResponse.access_token);
      setIsAuthenticated(true);
      toast.success("Google authentication successful");
    },
    onError: (error) => {
      console.error('Google authentication failed:', error);
      toast.error("Google authentication failed");
    },
    scope: 'https://www.googleapis.com/auth/calendar',
  });

  // Format dates for Google Calendar API (ISO 8601 format)
  const formatDateForAPI = (dateTimeStr) => {
    const date = parseISO(dateTimeStr);
    return date.toISOString();
  };

  // Function to create a demo meeting with fixed link as backup
  const createDemoMeeting = () => {
    const meetingId = Math.random().toString(36).substring(2, 12);
    return {
      title,
      startTime,
      duration,
      description,
      meetLink: `https://meet.google.com/${meetingId}`
    };
  };

  const handleSchedule = async () => {
    if (!title.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }

    if (!isAuthenticated || !googleToken) {
      toast.error('Not authenticated with Google');
      return;
    }

    try {
      setIsScheduling(true);

      // Calculate end time
      const startDate = parseISO(startTime);
      const endDate = addHours(startDate, duration / 60);
      
      // Try to use the Google Calendar API
      const event = {
        summary: title,
        description: description || 'Meeting scheduled via our app',
        start: {
          dateTime: formatDateForAPI(startTime),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).substring(7),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      };

      console.log("Sending event data:", JSON.stringify(event, null, 2));

      try {
        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });

        const responseData = await response.json();
        console.log("API Response status:", response.status);
        console.log("API Response data:", responseData);

        if (!response.ok) {
          if (response.status === 400) {
            // Handle specific error for Bad Request
            console.error('Bad Request Error:', responseData.error?.message || 'Unknown error');
            toast.error(responseData.error?.message || "Invalid meeting data format");
            throw new Error(responseData.error?.message || "Bad Request");
          } else if (response.status === 401 || response.status === 403) {
            setShowScopeError(true);
            throw new Error("OAuth scope error");
          } else {
            throw new Error(responseData.error?.message || `Error (${response.status})`);
          }
        }
        
        if (responseData.hangoutLink) {
          toast.success("Meeting scheduled successfully!");
          onSchedule({
            title,
            startTime,
            duration,
            description,
            meetLink: responseData.hangoutLink,
          });
          onClose();
          return;
        } else {
          console.warn("No hangoutLink found in response:", responseData);
          throw new Error("No meeting link found in response");
        }
      } catch (apiError) {
        console.error('Calendar API error:', apiError);
        throw apiError;
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error(`Could not create Google Meet: ${error.message}. Using demo link instead.`);
      
      // Even if everything fails, still create a demo meeting
      const demoMeeting = createDemoMeeting();
      onSchedule(demoMeeting);
      onClose();
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-violet-500" />
            Schedule Google Meet
          </DialogTitle>
        </DialogHeader>
        
        {showScopeError && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-start mt-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5 mr-2" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Calendar API Permission Issue</p>
              <p>There was an issue accessing your Google Calendar. Creating a demo meeting link instead.</p>
            </div>
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-gray-500">Please authenticate with Google to schedule meetings</p>
              <div className="p-4 border border-gray-200 rounded-lg bg-slate-50">
                <Button 
                  onClick={() => login()}
                  className="w-full bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Sign in with Google
                </Button>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Note: This requires Google Calendar access to create a real meeting.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter meeting title"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                  min="15"
                  step="15"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter meeting description"
                />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {isAuthenticated && (
            <Button 
              onClick={handleSchedule} 
              disabled={isScheduling || !title.trim()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isScheduling ? (
                <>
                  <span className="mr-2">Scheduling...</span>
                  <span className="animate-spin">⟳</span>
                </>
              ) : (
                "Schedule Meeting"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MeetScheduler; 