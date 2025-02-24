
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Truth, Comment } from "@/lib/supabase";

export interface TruthWithMeta extends Truth {
  likes: number;
  comments: Comment[];
  factCheck?: {
    correction?: string;
    explanation?: string;
  };
}

export const useTruths = () => {
  const [truths, setTruths] = useState<TruthWithMeta[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;

  const fetchTruths = async (page = 1) => {
    // First, get the total count
    const { count } = await supabase
      .from('truths')
      .select('*', { count: 'exact', head: true })
      .eq('is_spam', false);

    const totalCount = count || 0;
    setTotalPages(Math.ceil(totalCount / postsPerPage));

    // Then fetch the paginated data
    const { data, error } = await supabase
      .from('truths')
      .select(`
        *,
        comments (*),
        truth_likes (truth_id)
      `)
      .eq('is_spam', false)
      .order('created_at', { ascending: false })
      .range((page - 1) * postsPerPage, page * postsPerPage - 1);

    if (error) {
      console.error('Error fetching truths:', error);
      return;
    }

    if (!data) return;

    const nonSpamTruths = data.filter(truth => !truth.is_spam);

    const truthsWithMeta = nonSpamTruths.map(truth => ({
      ...truth,
      likes: truth.truth_likes?.length || 0,
      comments: truth.comments || [],
      factCheck: truth.fact_check ? JSON.parse(truth.fact_check as string) : undefined,
    }));

    setTruths(truthsWithMeta);
    setCurrentPage(page);
  };

  const setupSubscription = () => {
    const truthsSubscription = supabase
      .channel('public:truths')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'truths' 
      }, (payload) => {
        console.log('Received real-time update:', payload);
        const newData = payload.new as Truth;
        if (!newData?.is_spam) {
          fetchTruths(currentPage);
        }
      })
      .subscribe();

    return () => {
      truthsSubscription.unsubscribe();
    };
  };

  useEffect(() => {
    fetchTruths();
    setupSubscription();
  }, []);

  return {
    truths,
    setTruths,
    currentPage,
    totalPages,
    fetchTruths
  };
};
