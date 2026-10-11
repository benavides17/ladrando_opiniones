'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { CommentWithProfile } from '@/types/database';
import { useAuth } from '@/lib/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { formatRelativeTime, getInitials } from '@/lib/utils/formatters';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface CommentItemProps {
  comment: CommentWithProfile;
  onUpdate: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
}

export function CommentItem({ comment, onUpdate, onDelete }: CommentItemProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const isOwner = user?.id === comment.user_id;
  const authorName = comment.profile?.display_name || comment.profile?.username || 'Usuario';
  const authorUsername = comment.profile?.username || 'usuario';

  const handleSaveEdit = async () => {
    const trimmed = editedContent.trim();
    if (!trimmed) {
      setEditError('El comentario no puede estar vacío');
      return;
    }
    if (trimmed.length > 1000) {
      setEditError('El comentario no puede superar los 1.000 caracteres');
      return;
    }

    setIsSaving(true);
    setEditError(null);

    try {
      const { error } = await supabase
        .from('comments')
        .update({
          content: trimmed,
        })
        .eq('id', comment.id);

      if (error) {
        setEditError('Error al guardar: ' + error.message);
        return;
      }

      onUpdate(comment.id, trimmed);
      setIsEditing(false);
    } catch {
      setEditError('Error inesperado al actualizar el comentario');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-deepblue-750/70 border border-deepblue-600/50 shadow-sm space-y-3">
      {/* Cabecera del comentario */}
      <div className="flex items-center justify-between">
        <Link
          href={`/perfil/${authorUsername}`}
          className="flex items-center space-x-2.5 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 text-white flex items-center justify-center font-bold text-xs ring-2 ring-menta-300/40 shrink-0">
            {getInitials(authorName)}
          </div>
          <div>
            <span className="text-xs font-bold text-white mr-1.5">
              {authorName}
            </span>
            <span className="text-[11px] text-teal-300/70">
              @{authorUsername}
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-petroleo-300">
            {formatRelativeTime(comment.created_at)}
          </span>

          {isOwner && !isEditing && (
            <div className="flex items-center space-x-1 pl-2 border-l border-deepblue-600/60">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-petroleo-300 hover:text-menta-300 rounded transition-colors"
                title="Editar comentario"
                aria-label="Editar comentario"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(comment.id)}
                className="p-1 text-petroleo-300 hover:text-rose-400 rounded transition-colors"
                title="Eliminar comentario"
                aria-label="Eliminar comentario"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido / Modo edición */}
      {isEditing ? (
        <div className="space-y-2 pt-1">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={3}
            error={editError || undefined}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditedContent(comment.content);
                setIsEditing(false);
                setEditError(null);
              }}
              leftIcon={<X className="w-3 h-3" />}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveEdit}
              isLoading={isSaving}
              leftIcon={<Check className="w-3 h-3" />}
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-petroleo-100 leading-relaxed whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      )}
    </div>
  );
}
