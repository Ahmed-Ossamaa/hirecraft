import React from 'react';
import { CompanyMemberRole } from '@/shared/api/generated/model';
import { MdAdminPanelSettings, MdWorkOutline, MdPerson } from 'react-icons/md';

interface MemberRoleIconProps {
  role: CompanyMemberRole;
  className?: string;
}

export const MemberRoleIcon: React.FC<MemberRoleIconProps> = ({ role, className = '' }) => {
  switch (role) {
    case 'ADMIN':
      return <MdAdminPanelSettings className={`text-primary ${className}`} />;
    case 'HIRING_MANAGER':
      return <MdWorkOutline className={`text-secondary ${className}`} />;
    default:
      return <MdPerson className={`text-muted-foreground ${className}`} />;
  }
};
