"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { CommentCard } from "./CommentCard";
import { CommentInput } from "./CommentInput";
import { Button } from "@/components/ui";

interface Reply {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  isLiked: boolean;
  mentions?: string[];
  parentId: string | null;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    profileImageUrl: string | null;
  };
}

interface Comment {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  isLiked: boolean;
  mentions?: string[];
  parentId?: string | null;
  replyCount: number;
  replies: Reply[];
  user: {
    id: string;
    name: string | null;
    username: string | null;
    profileImageUrl: string | null;
  };
}

interface CommentSectionProps {
  trackId: string;
  currentUser?: {
    id: string;
    name: string | null;
    profileImageUrl: string | null;
  };
}

export function CommentSection({ trackId, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const LIMIT = 10;

  useEffect(() => {
    loadComments();
  }, [trackId]);

  const loadComments = async (offset = 0) => {
    try {
      if (offset === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const res = await fetch(
        `/api/comments?trackId=${trackId}&limit=${LIMIT}&offset=${offset}`
      );
      const data = await res.json();

      if (res.ok) {
        if (offset === 0) {
          setComments(data.comments);
        } else {
          setComments((prev) => [...prev, ...data.comments]);
        }
        setHasMore(data.hasMore);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleCommentAdded = (newComment: Comment | Reply) => {
    // If it's a reply (has parentId), add it to the parent's replies array
    if ("parentId" in newComment && newComment.parentId) {
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === newComment.parentId) {
            return {
              ...comment,
              replies: [...comment.replies, newComment as Reply],
              replyCount: comment.replyCount + 1,
            };
          }
          return comment;
        })
      );
      setReplyingTo(null); // Clear reply state
    } else {
      // It's a top-level comment
      setComments((prev) => [newComment as Comment, ...prev]);
      setTotalCount((prev) => prev + 1);
    }
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setTotalCount((prev) => prev - 1);
  };

  const handleLike = () => {
    // Refresh comment to get updated like count
    // Already handled by optimistic update in CommentCard
  };

  const handleLoadMore = () => {
    loadComments(comments.length);
  };

  return (
    <div className="bg-bg-secondary border border-border-default rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-primary-400" />
        <h3 className="text-lg font-semibold text-text-primary">
          Comentários
          {totalCount > 0 && (
            <span className="text-text-tertiary ml-2">({totalCount})</span>
          )}
        </h3>
      </div>

      {/* Comment Input */}
      {currentUser ? (
        <div className="mb-6">
          <CommentInput
            trackId={trackId}
            currentUser={currentUser}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      ) : (
        <div className="mb-6 p-4 bg-bg-elevated border border-border-subtle rounded-lg text-center">
          <p className="text-sm text-text-secondary">
            Faça login para comentar
          </p>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary">Nenhum comentário ainda</p>
          <p className="text-sm text-text-tertiary mt-1">
            Seja o primeiro a comentar nesta música!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              {/* Top-level comment */}
              <CommentCard
                comment={comment}
                currentUserId={currentUser?.id}
                onLike={handleLike}
                onDelete={handleCommentDeleted}
                onReply={() => setReplyingTo(comment.id)}
              />

              {/* Reply input (if replying to this comment) */}
              {replyingTo === comment.id && currentUser && (
                <div className="ml-12 pl-4 border-l-2 border-border-default">
                  <CommentInput
                    trackId={trackId}
                    currentUser={currentUser}
                    onCommentAdded={handleCommentAdded}
                    parentId={comment.id}
                    placeholder={`Responder a @${comment.user.username || comment.user.name || "usuário"}...`}
                    onCancel={() => setReplyingTo(null)}
                    autoFocus
                  />
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 pl-4 border-l-2 border-border-subtle space-y-3">
                  {comment.replies.map((reply) => (
                    <CommentCard
                      key={reply.id}
                      comment={reply}
                      currentUserId={currentUser?.id}
                      onLike={handleLike}
                      onDelete={handleCommentDeleted}
                      isReply
                    />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  `Carregar mais (${totalCount - comments.length} restantes)`
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
