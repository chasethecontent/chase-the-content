
import React, { useState, useEffect } from 'react';
import { Comment, User } from '../types';
import { supabase } from '../lib/supabase';

interface CommentsProps {
  clipId: string;
  currentUser: User;
  dbConnected: boolean;
}

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const Comments: React.FC<CommentsProps> = ({ clipId, currentUser, dbConnected }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dbConnected || !isUUID(clipId)) return;

    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('clip_id', clipId)
        .order('created_at', { ascending: true });
      
      if (!error && data) setComments(data);
    };

    fetchComments();

    const subscription = supabase
      .channel(`comments-${clipId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `clip_id=eq.${clipId}` }, 
        payload => {
          const incoming = payload.new as Comment;
          setComments(prev => {
            if (prev.some(c => c.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      ).subscribe();

    return () => { subscription.unsubscribe(); };
  }, [clipId, dbConnected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);

    const commentData: any = {
      clip_id: clipId,
      username: currentUser.username,
      text: newComment
    };

    // Use actual user ID if authenticated
    if (isUUID(currentUser.id)) {
      commentData.user_id = currentUser.id;
    }

    const tempId = 'temp-' + Math.random().toString();
    const optimisticComment: Comment = { 
      ...commentData, 
      id: tempId, 
      created_at: new Date().toISOString() 
    } as Comment;
    
    setComments(prev => [...prev, optimisticComment]);

    // Only save to DB if it's a real persistent clip (UUID)
    if (dbConnected && isUUID(clipId)) {
      const { data, error } = await supabase.from('comments').insert([commentData]).select();
      if (error) {
        console.error("Comment Save Error:", error);
        setComments(prev => prev.filter(c => c.id !== tempId));
      } else if (data && data.length > 0) {
        setComments(prev => prev.map(c => c.id === tempId ? { ...c, id: data[0].id } : c));
      }
    }

    setNewComment('');
    setLoading(false);
  };

  return (
    <div className="mt-6 border-t border-white/5 pt-6 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Community Discussion</h4>
      </div>

      <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar mb-6">
        {comments.length === 0 ? (
          <p className="text-[10px] italic text-slate-600 text-center py-4">No comments yet. Start the chase!</p>
        ) : (
          comments.map(c => (
            <div key={c.id} className="bg-black/20 p-3 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{c.username}</span>
                <span className="text-[8px] text-slate-600">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">{c.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input 
          type="text" 
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all pr-12"
        />
        <button 
          disabled={loading || !newComment.trim()}
          className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white px-3 rounded-lg text-[10px] font-black transition-all"
        >
          POST
        </button>
      </form>
    </div>
  );
};

export default Comments;
