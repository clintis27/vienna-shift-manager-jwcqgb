
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/app/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionOptions {
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  onChange?: (payload: any) => void;
}

export function useRealtimeSubscription({
  table,
  filter,
  event = '*',
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: UseRealtimeSubscriptionOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [connected, setConnected] = useState(false);

  // Wrap callbacks in useCallback to stabilize references
  const stableOnChange = useCallback((payload: any) => {
    if (onChange) onChange(payload);
  }, [onChange]);

  const stableOnInsert = useCallback((payload: any) => {
    if (onInsert) onInsert(payload);
  }, [onInsert]);

  const stableOnUpdate = useCallback((payload: any) => {
    if (onUpdate) onUpdate(payload);
  }, [onUpdate]);

  const stableOnDelete = useCallback((payload: any) => {
    if (onDelete) onDelete(payload);
  }, [onDelete]);

  useEffect(() => {
    console.log(`Setting up realtime subscription for ${table}`);

    const channelName = filter ? `${table}:${filter}` : table;
    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: event,
          schema: 'public',
          table: table,
          filter: filter,
        },
        (payload) => {
          console.log(`Realtime event on ${table}:`, payload);

          stableOnChange(payload);

          if (payload.eventType === 'INSERT') {
            stableOnInsert(payload);
          } else if (payload.eventType === 'UPDATE') {
            stableOnUpdate(payload);
          } else if (payload.eventType === 'DELETE') {
            stableOnDelete(payload);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${table}:`, status);
        setConnected(status === 'SUBSCRIBED');
      });

    setChannel(realtimeChannel);

    return () => {
      console.log(`Cleaning up realtime subscription for ${table}`);
      realtimeChannel.unsubscribe();
    };
  }, [table, filter, event, stableOnChange, stableOnInsert, stableOnUpdate, stableOnDelete]);

  return { connected, channel };
}
