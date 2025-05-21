import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

export default function ExitIntentPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem('exit_intent_shown') === 'true';
    if (shown) return;

    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0) {
        sessionStorage.setItem('exit_intent_shown', 'true');
        setOpen(true);
        trackEvent('exit_intent_popup');
      }
    }

    document.addEventListener('mouseout', handleMouseLeave);
    return () => document.removeEventListener('mouseout', handleMouseLeave);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Wait! Before you go...</DialogTitle>
          <DialogDescription>
            Grab a 10% discount on your first month.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>No thanks</Button>
          <Button
            className="bg-gradient-to-r from-blue-500 to-blue-700"
            onClick={() => {
              trackEvent('exit_intent_accept');
              setOpen(false);
            }}
          >
            Claim Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
