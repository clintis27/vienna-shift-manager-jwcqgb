
import { useEffect, useState } from 'react';
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

          if (onChange) {
            onChange(payload);
          }

          if (payload.eventType === 'INSERT' && onInsert) {
            onInsert(payload);
          } else if (payload.eventType === 'UPDATE' && onUpdate) {
            onUpdate(payload);
          } else if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload);
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
  }, [table, filter, event]);

  return { connected, channel };
}
