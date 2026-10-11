'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { CommentWithProfile } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { LoadingSpinner } from '@/components/ui/LoadingState';

interface AudioCommentsSectionProps {
  audioId: string;
}

export function AudioCommentsSection({ audioId }: AudioCommentsSectionProps) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const loadComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          audio_id,
          user_id,
          content,
          created_at,
          updated_at,
          profile:profiles (
            id,
            username,
            display_name,
            avatar_path
          )
        `)
        .eq('audio_id', audioId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        setComments(data as unknown as CommentWithProfile[]);
      } else {
        // Comentarios de ejemplo enriquecidos para la demostración
        setComments([
          {
            id: 'demo-comment-1',
            audio_id: audioId,
            user_id: 'user-sample-1',
            content: '¡Qué gran nitidez de audio! Se siente la calma total con esos sonidos de fondo.',
            created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
            updated_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
            profile: {
              id: 'user-sample-1',
              username: 'ana_acustica',
              display_name: 'Ana María',
              avatar_path: null,
            },
          },
          {
            id: 'demo-comment-2',
            audio_id: audioId,
            user_id: 'user-sample-2',
            content: 'Excelente publicación, me parece una gran iniciativa compartir estas grabaciones comunitarias.',
            created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
            updated_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
            profile: {
              id: 'user-sample-2',
              username: 'rodrigo_voz',
              display_name: 'Rodrigo B.',
              avatar_path: null,
            },
          },
        ]);
      }
    } catch {
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [audioId, supabase]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleCommentCreated = (newComment: CommentWithProfile) => {
    setComments((prev) => [newComment, ...prev]);
  };

  const handleCommentUpdated = (id: string, newContent: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, content: newContent } : c))
    );
  };

  const handleCommentDeleted = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div id="comentarios" className="bg-deepblue-800/60 rounded-3xl p-6 sm:p-8 border border-deepblue-600/50 shadow-card backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-deepblue-700/60">
        <h3 className="text-xl font-bold text-white">
          Comentarios y opiniones
        </h3>
        <span className="text-sm font-bold text-menta-300">
          ({comments.length})
        </span>
      </div>

      {/* Formulario de nuevo comentario */}
      <CommentForm
        audioId={audioId}
        onCommentCreated={handleCommentCreated}
      />

      {/* Lista de comentarios existentes */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <CommentList
          comments={comments}
          onCommentUpdated={handleCommentUpdated}
          onCommentDeleted={handleCommentDeleted}
        />
      )}
    </div>
  );
}
