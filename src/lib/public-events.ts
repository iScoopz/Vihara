import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_EVENTS } from '@/lib/mock-data';

// Invalidated by the event publish/complete actions so the landing page updates right away.
export const PUBLIC_EVENTS_TAG = 'public-events';

export type PublicEvent = {
  id: string;
  title: string;
  event_date: string;
  location: string;
  category?: string;
};

// Published, unfinished events from today on, for the public landing page.
// Uses a cookie-free client so the page can stay static and refresh every 5 minutes.
export const getUpcomingPublicEvents = unstable_cache(
  async (limit: number = 4): Promise<PublicEvent[]> => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    if (url && key && url !== 'https://placeholder.supabase.co') {
      try {
        const supabase = createClient(url, key, { auth: { persistSession: false } });
        const { data, error } = await supabase
          .from('events')
          .select('id, title, event_date, location, category')
          .eq('is_published', true)
          .eq('is_completed', false)
          .gte('event_date', startOfToday.toISOString())
          .order('event_date', { ascending: true })
          .limit(limit);
        if (!error && data) return data;
        if (error) console.error('getUpcomingPublicEvents error:', error.message);
      } catch (e) {
        console.error('getUpcomingPublicEvents exception:', e);
      }
      return [];
    }

    return INITIAL_EVENTS.filter(e => e.is_published && !e.is_completed && new Date(e.event_date) >= startOfToday)
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .slice(0, limit)
      .map(({ id, title, event_date, location, category }) => ({ id, title, event_date, location, category }));
  },
  ['landing-upcoming-events'],
  { revalidate: 300, tags: [PUBLIC_EVENTS_TAG] }
);
