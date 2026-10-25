import React from "react";
import { CompanyMember, CompanyMemberRole } from "@/shared/api/generated/model";
import { Button } from "@/shared/components/ui";
import { MdDeleteOutline } from "react-icons/md";
import { formatTimeAgo } from "@/shared/utils/date-utils";
import { MemberRoleIcon } from "./MemberRoleIcon";

interface MemberTableRowProps {
  member: CompanyMember;
  currentUserId: string | undefined;
  isCurrentUserAdmin: boolean;
  currentStatus: "ACTIVE" | "PENDING" | "SUSPENDED";
  onRoleChange: (memberId: string, newRole: CompanyMemberRole) => void;
  onSuspend: (memberId: string, memberName: string) => void;
  onActivate: (memberId: string, memberName: string) => void;
  onRemove: (memberId: string, memberName: string) => void;
}

export const MemberTableRow: React.FC<MemberTableRowProps> = ({
  member,
  currentUserId,
  isCurrentUserAdmin,
  currentStatus,
  onRoleChange,
  onSuspend,
  onActivate,
  onRemove,
}) => {
  const memberName = `${member.firstName} ${member.lastName}`;
  const isMe = member.userId === currentUserId;

  return (
    <tr className="hover:bg-row-hover transition-colors">
      <td className="px-5 py-3.5">
        <div className="font-medium text-foreground flex items-center gap-2">
          {memberName}
          {isMe && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full uppercase tracking-wider">
              You
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {member.email}
        </div>
      </td>
      <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">
        {formatTimeAgo(member.joinedAt)}
      </td>
      <td className="px-5 py-3.5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-xs">
          <MemberRoleIcon role={member.role} />
          <select
            value={member.role}
            onChange={(e) =>
              onRoleChange(member.userId, e.target.value as CompanyMemberRole)
            }
            disabled={isMe || !isCurrentUserAdmin || member.status !== "ACTIVE"}
            className="bg-transparent border-none outline-none cursor-pointer text-foreground font-medium disabled:cursor-not-allowed"
          >
            <option value="ADMIN" className="bg-card text-foreground">
              Admin
            </option>
            <option value="HIRING_MANAGER" className="bg-card text-foreground">
              Hiring Manager
            </option>
            <option value="STAFF" className="bg-card text-foreground">
              Staff
            </option>
          </select>
        </div>
      </td>
      {isCurrentUserAdmin && (
        <td className="px-5 py-3.5">
          <div className="flex items-center justify-end gap-2">
            {!isMe && currentStatus === "ACTIVE" && (
              <Button
                variant="ghost"
                onClick={() => onSuspend(member.userId, memberName)}
                className="text-xs px-2 py-1 h-8 rounded-lg"
              >
                Suspend
              </Button>
            )}
            {!isMe && currentStatus === "SUSPENDED" && (
              <Button
                variant="ghost"
                onClick={() => onActivate(member.userId, memberName)}
                className="text-xs px-2 py-1 h-8 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                Unsuspend
              </Button>
            )}
            {!isMe && (
              <Button
                variant="ghost"
                onClick={() => onRemove(member.userId, memberName)}
                className="w-8 h-8 p-0 text-red-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg inline-flex items-center justify-center shrink-0"
                title={
                  currentStatus === "PENDING"
                    ? "Cancel Invite"
                    : "Remove Permanently"
                }
              >
                <MdDeleteOutline className="text-lg" />
              </Button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
};
