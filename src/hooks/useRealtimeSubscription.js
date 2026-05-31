import { useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * Sets up Supabase Realtime subscriptions for the given tables.
 * Calls `callback` whenever any row in those tables is inserted, updated, or deleted.
 *
 * Usage:
 *   useRealtimeSubscription(['attendance_logs', 'student_internships'], fetchLogs);
 */
export function useRealtimeSubscription(tables, callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!tables || tables.length === 0) return;

    const channelId = `rt-${tables.join('-')}-${Math.random().toString(36).slice(2, 7)}`;
    const channel = supabase.channel(channelId);

    tables.forEach(table => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => callbackRef.current()
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.join(',')]);
}
