"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

interface CommentInputProps {
  trackId: string;
  currentUser?: {
    name: string | null;
    profileImageUrl: string | null;
  };
  onCommentAdded?: (comment: any) => void;
  parentId?: string;
  placeholder?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export function CommentInput({
  trackId,
  currentUser,
  onCommentAdded,
  parentId,
  placeholder = "Adicione um comentário...",
  onCancel,
  autoFocus = false,
}: CommentInputProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<
    Array<{ id: string; name: string; username: string }>
  >([]);
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Detect @ mentions and search for users
  useEffect(() => {
    const lastAtIndex = content.lastIndexOf("@", cursorPosition);
    if (lastAtIndex !== -1 && cursorPosition > lastAtIndex) {
      const searchQuery = content.substring(lastAtIndex + 1, cursorPosition);

      // Only show suggestions if search query is valid (no spaces)
      if (searchQuery && !searchQuery.includes(" ")) {
        setMentionSearch(searchQuery);
        setShowMentions(true);

        // Fetch user suggestions (simple debounced search)
        const timer = setTimeout(async () => {
          try {
            const res = await fetch(
              `/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=5`
            );
            if (res.ok) {
              const data = await res.json();
              setMentionSuggestions(data.users || []);
            }
          } catch (error) {
            console.error("Error fetching mentions:", error);
          }
        }, 300);

        return () => clearTimeout(timer);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  }, [content, cursorPosition]);

  const handleMentionSelect = (username: string) => {
    const lastAtIndex = content.lastIndexOf("@", cursorPosition);
    const beforeMention = content.substring(0, lastAtIndex);
    const afterCursor = content.substring(cursorPosition);

    const newContent = `${beforeMention}@${username} ${afterCursor}`;
    setContent(newContent);
    setShowMentions(false);

    // Set cursor position after mention
    const newPosition = beforeMention.length + username.length + 2;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Comentário não pode estar vazio");
      return;
    }

    if (content.length > 500) {
      toast.error("Comentário muito longo (máx 500 caracteres)");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId,
          content: content.trim(),
          parentId: parentId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao postar comentário");
      }

      toast.success(parentId ? "Resposta postada!" : "Comentário postado!");
      setContent("");

      if (onCommentAdded) {
        onCommentAdded(data.comment);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao postar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = content.length;
  const charLimit = 500;
  const isOverLimit = charCount > charLimit;

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-bg-secondary">
          {currentUser?.profileImageUrl ? (
            <Image
              src={currentUser.profileImageUrl}
              alt={currentUser.name || "You"}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-400 text-white text-sm font-bold">
              {(currentUser?.name || "?")[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="flex-1">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setCursorPosition(e.target.selectionStart);
            }}
            onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart)}
            onClick={(e) => setCursorPosition(e.currentTarget.selectionStart)}
            placeholder={placeholder}
            disabled={isSubmitting}
            rows={parentId ? 2 : 3}
            className={cn(
              "w-full px-4 py-3 bg-bg-elevated border rounded-lg resize-none focus:outline-none focus:ring-2 transition-colors disabled:opacity-50",
              isOverLimit
                ? "border-error focus:ring-error"
                : "border-border-default focus:ring-primary-400"
            )}
          />

          {/* Mention Suggestions Dropdown */}
          {showMentions && mentionSuggestions.length > 0 && (
            <div className="absolute left-4 bottom-full mb-2 bg-bg-elevated border border-border-default rounded-lg shadow-lg overflow-hidden z-10 max-w-xs">
              {mentionSuggestions.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleMentionSelect(user.username)}
                  className="w-full px-4 py-2 text-left hover:bg-bg-secondary transition-colors flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(user.name || user.username)[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-text-tertiary truncate">
                      @{user.username}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Character Counter */}
          <div
            className={cn(
              "absolute bottom-2 right-2 text-xs",
              isOverLimit
                ? "text-error font-medium"
                : charCount > charLimit * 0.8
                ? "text-warning"
                : "text-text-tertiary"
            )}
          >
            {charCount}/{charLimit}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-2 mt-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !content.trim() || isOverLimit}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Postando..." : parentId ? "Responder" : "Comentar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
