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
    const fetchAllComments = async () => {
      let dbData: Comment[] = [];
      
      // 1. Fetch from Local Storage Fallback
      const localKey = `sp_comments_${clipId}`;
      const localCommentsRaw = localStorage.getItem(localKey);
      const localComments: Comment[] = localCommentsRaw ? JSON.parse(localCommentsRaw) : [];

      // 2. Fetch from Database if connected and valid
      if (dbConnected && isUUID(clipId)) {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('clip_id', clipId)
          .order('created_at', { ascending: true });
        
        if (!error && data) dbData = data;
      }

      // Merge and sort
      const merged = [...dbData, ...localComments].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      // Deduplicate by ID
      const unique = Array.from(new Map(merged.map(c => [c.id, c])).values());
      setComments(unique);
    };

    fetchAllComments();

    // 3. Setup Realtime for Database
    let subscription: any = null;
    if (dbConnected && isUUID(clipId)) {
      subscription = supabase
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
    }

    return () => { if (subscription) subscription.unsubscribe(); };
  }, [clipId, dbConnected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);

    const tempId = 'c-' + Math.random().toString(36).substring(7);
    const commentData: any = {
      id: tempId,
      clip_id: clipId,
      username: currentUser.username,
      text: newComment,
      created_at: new Date().toISOString()
    };

    // Optimistically update UI
    setComments(prev => [...prev, commentData]);

    // Persistence logic
    if (dbConnected && isUUID(clipId)) {
      const dbPayload = {
        clip_id: clipId,
        username: currentUser.username,
        text: newComment,
        user_id: isUUID(currentUser.id) ? currentUser.id : null
      };

      const { data, error } = await supabase.from('comments').insert([dbPayload]).select();
      if (error) {
        console.error("Comment DB Error, falling back to local:", error);
        saveToLocal(commentData);
      } else if (data && data.length > 0) {
        setComments(prev => prev.map(c => c.id === tempId ? data[0] : c));
      }
    } else {
      saveToLocal(commentData);
    }

    setNewComment('');
    setLoading(false);
  };

  const saveToLocal = (comment: Comment) => {
    const localKey = `sp_comments_${clipId}`;
    const existingRaw = localStorage.getItem(localKey);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    localStorage.setItem(localKey, JSON.stringify([...existing, comment]));
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