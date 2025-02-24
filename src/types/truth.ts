
export interface Comment {
  id: number;
  text: string;
  created_at: string;
  truth_id: number;
  user_id: string;
  is_spam: boolean;
  is_fact_check?: boolean;
}

export interface TruthCardProps {
  id: number;
  text: string;
  created_at: string;
  likes: number;
  comments: Comment[];
  factCheck?: {
    correction?: string;
    explanation?: string;
  };
}
