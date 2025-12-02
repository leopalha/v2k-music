"use client";

import Image from "next/image";
import Link from "next/link";
import { FollowButton } from "./FollowButton";

interface User {
  id: string;
  name: string | null;
  username: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  isFollowing: boolean;
}

interface UserCardProps {
  user: User;
  currentUserId?: string;
  showFollowButton?: boolean;
}

export function UserCard({
  user,
  currentUserId,
  showFollowButton = true,
}: UserCardProps) {
  const displayName = user.name || user.username || "Usuário";
  const isOwnProfile = currentUserId === user.id;

  return (
    <div className="flex items-center justify-between p-4 bg-bg-elevated rounded-lg hover:bg-bg-primary transition-colors">
      {/* User Info */}
      <Link
        href={`/profile/${user.id}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-bg-secondary">
            {user.profileImageUrl ? (
              <Image
                src={user.profileImageUrl}
                alt={displayName}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-secondary-400 text-white text-lg font-bold">
                {displayName[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Name and Bio */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-text-primary truncate">
              {displayName}
            </h3>
            {user.username && (
              <span className="text-sm text-text-tertiary truncate">
                @{user.username}
              </span>
            )}
          </div>
          {user.bio && (
            <p className="text-sm text-text-secondary mt-0.5 truncate">
              {user.bio}
            </p>
          )}
        </div>
      </Link>

      {/* Follow Button */}
      {showFollowButton && !isOwnProfile && currentUserId && (
        <div className="ml-4 flex-shrink-0">
          <FollowButton
            userId={user.id}
            initialIsFollowing={user.isFollowing}
            size="sm"
            showIcon={false}
          />
        </div>
      )}
    </div>
  );
}
