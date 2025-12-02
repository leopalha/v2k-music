"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Trash2, MoreVertical, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { MENTION_REGEX } from "@/lib/utils/mentions";

interface Comment {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  isLiked: boolean;
  mentions?: string[];
  parentId?: string | null;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    profileImageUrl: string | null;
  };
}

interface CommentCardProps {
  comment: Comment;
  currentUserId?: string;
  onLike?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
  isReply?: boolean;
}

export function CommentCard({
  comment,
  currentUserId,
  onLike,
  onDelete,
  onReply,
  isReply = false,
}: CommentCardProps) {
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwnComment = currentUserId === comment.user.id;

  const handleLike = async () => {
    if (isLiking || !onLike) return;

    setIsLiking(true);

    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await fetch(`/api/comments/${comment.id}/like`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      // Update with server response
      setIsLiked(data.liked);
      setLikeCount(data.likes);

      onLike(comment.id);
    } catch (error) {
      // Revert on error
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      toast.error(error instanceof Error ? error.message : "Erro ao dar like");
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting || !onDelete) return;

    if (!confirm("Tem certeza que deseja deletar este comentário?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success("Comentário deletado");
      onDelete(comment.id);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao deletar comentário"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  // Highlight mentions in content
  const renderContent = () => {
    const parts = comment.content.split(MENTION_REGEX);
    const mentions = comment.content.match(MENTION_REGEX) || [];

    return parts.map((part, i) => {
      if (i === parts.length - 1) return part;

      return (
        <span key={i}>
          {part}
          <span className="text-primary-400 font-medium">
            {mentions[i]}
          </span>
        </span>
      );
    });
  };

  return (
    <div className="flex gap-3 p-4 bg-bg-elevated rounded-lg hover:bg-bg-primary transition-colors">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-secondary">
          {comment.user.profileImageUrl ? (
            <Image
              src={comment.user.profileImageUrl}
              alt={comment.user.name || "User"}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-400 text-white text-sm font-bold">
              {(comment.user.name || comment.user.username || "?")[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-primary truncate">
                {comment.user.name || comment.user.username || "Usuário"}
              </span>
              {comment.user.username && comment.user.name && (
                <span className="text-sm text-text-tertiary truncate">
                  @{comment.user.username}
                </span>
              )}
            </div>
            <span className="text-xs text-text-tertiary">{timeAgo}</span>
          </div>

          {/* Actions Menu */}
          {isOwnComment && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-bg-secondary rounded transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-text-tertiary" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 bg-bg-elevated border border-border-default rounded-lg shadow-lg py-1 min-w-[120px]">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleDelete();
                      }}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-sm text-error hover:bg-bg-secondary transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting ? "Deletando..." : "Deletar"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Comment Text */}
        <p className="text-text-primary text-sm mb-2 whitespace-pre-wrap break-words">
          {renderContent()}
        </p>

        {/* Actions: Like and Reply */}
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-50",
              isLiked
                ? "text-error"
                : "text-text-tertiary hover:text-error"
            )}
          >
            <Heart
              className={cn("w-4 h-4", isLiked && "fill-current")}
            />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          {/* Reply Button (only show on top-level comments) */}
          {!isReply && onReply && (
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1.5 text-sm font-medium text-text-tertiary hover:text-primary-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Responder
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
