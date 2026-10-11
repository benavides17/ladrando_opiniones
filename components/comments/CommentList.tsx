'use client';

import React, { useState } from 'react';
import { ArrowUpDown, MessageSquare } from 'lucide-react';
import type { CommentWithProfile } from '@/types/database';
import { CommentItem } from './CommentItem';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { createClient } from '@/lib/supabase/client';

interface CommentListProps {
  comments: CommentWithProfile[];
  onCommentUpdated: (id: string, newContent: string) => void;
  onCommentDeleted: (id: string) => void;
}

export function CommentList({
  comments,
  onCommentUpdated,
  onCommentDeleted,
}: CommentListProps) {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createClient();

  const sortedComments = [...comments].sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentToDelete);

      if (!error) {
        onCommentDeleted(commentToDelete);
      }
    } catch {
      // Error manejado
    } finally {
      setIsDeleting(false);
      setCommentToDelete(null);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 bg-humo-100 rounded-2xl border border-humo-200">
        <MessageSquare className="w-8 h-8 text-petroleo-300 mx-auto mb-2" />
        <p className="text-sm font-semibold text-petroleo-700">
          Aún no hay comentarios en este audio
        </p>
        <p className="text-xs text-petroleo-400 mt-0.5">
          Sé el primero en compartir tu opinión.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selector de orden */}
      <div className="flex items-center justify-between text-xs text-petroleo-500 pb-2">
        <span>{comments.length} {comments.length === 1 ? 'comentario' : 'comentarios'}</span>
        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="flex items-center space-x-1 hover:text-teal-600 transition-colors"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>
            {sortOrder === 'desc' ? 'Más recientes primero' : 'Más antiguos primero'}
          </span>
        </button>
      </div>

      {/* Lista de comentarios */}
      <div className="space-y-3">
        {sortedComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onUpdate={onCommentUpdated}
            onDelete={(id) => setCommentToDelete(id)}
          />
        ))}
      </div>

      {/* Diálogo de confirmación para eliminar comentario */}
      <ConfirmDialog
        isOpen={!!commentToDelete}
        title="Eliminar comentario"
        description="¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setCommentToDelete(null)}
      />
    </div>
  );
}

