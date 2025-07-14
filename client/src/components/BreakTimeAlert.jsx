import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { takeBreak, setBreakAlertShown } from '@/redux/screenTimeSlice';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from '@/components/ui/button';

const BreakTimeAlert = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { breakAlertShown } = useSelector(state => state.screenTime);
  
  console.log("BreakTimeAlert rendered, alert shown:", breakAlertShown);

  // Helper function to determine user age group
  const getUserAgeGroup = (dateOfBirth) => {
    if (!dateOfBirth) return { group: 'adult' };
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 13) {
      return { group: 'children' };
    } else if (age < 18) {
      return { group: 'teenage' };
    } else {
      return { group: 'adult' };
    }
  };

  // Format message based on user age group
  const getBreakReminderMessage = () => {
    const { group } = getUserAgeGroup(user?.dateOfBirth);
    
    switch (group) {
      case 'children':
        return "You've been using the screen for 1 hour. Time to take a break and rest your eyes!";
      case 'teenage':
        return "You've been using the screen for 3 hours. Consider taking a short break to reduce eye strain.";
      case 'adult':
      default:
        return "You've been using the screen for 6 hours. A short break would be beneficial for your eyes and health.";
    }
  };

  // Handle taking a break
  const handleBreakTaken = () => {
    console.log("Taking a break - resetting timer");
    dispatch(takeBreak());
    toast.success("Break taken! Screen time reset.");
  };

  return (
    <Dialog 
      open={breakAlertShown} 
      onOpenChange={(isOpen) => {
        console.log("Dialog open state changed to:", isOpen);
        dispatch(setBreakAlertShown(isOpen));
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Time for a break!
          </DialogTitle>
          <DialogDescription>
            {getBreakReminderMessage()}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Health Reminder</AlertTitle>
            <AlertDescription>
              Taking regular breaks helps reduce eye strain and improves focus.
              Try the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              console.log("Remind me later clicked");
              dispatch(setBreakAlertShown(false));
            }}
          >
            Remind me later
          </Button>
          <Button onClick={handleBreakTaken}>
            I'll take a break
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BreakTimeAlert; 