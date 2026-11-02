"use client";

import React, { useState } from 'react';
import { WorkerMachineSkill } from '@/shared/api/generated/model';
import { Button } from '@/shared/components/ui/Button';
import { MdAdd, MdEdit, MdDelete, MdPrecisionManufacturing } from 'react-icons/md';
import { useRemoveMachineSkill } from "@/features/worker-profiles/api/useProfileMutations";
import { AddSkillModal } from './AddSkillModal';
import { EditSkillModal } from './EditSkillModal';
import { toast } from 'sonner';
import { getApiError } from '@/shared/utils/error';

interface MachineSkillsListProps {
  skills?: WorkerMachineSkill[];
  profileId?: string;
}

export const MachineSkillsList: React.FC<MachineSkillsListProps> = ({ skills = [], profileId }) => {
  const deleteSkillMutation = useRemoveMachineSkill();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [skillToEdit, setSkillToEdit] = useState<WorkerMachineSkill | null>(null);

  const handleDelete = async (skillId: string) => {
    if (!window.confirm('Are you sure you want to remove this skill?')) return;
    
    try {
      await deleteSkillMutation.mutateAsync({ skillId });
      toast.success("Skill removed successfully");
    } catch (error) {
      console.error('Failed to delete skill:', error);
      toast.error(getApiError(error, 'Failed to delete skill. Please try again.'));
    }
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-headline font-semibold text-foreground mb-1">
            Machine Experience
          </h2>
          <p className="text-xs text-muted-foreground">
            List the machinery and control systems you are proficient with.
          </p>
        </div>
        <Button 
          onClick={() => setIsAddOpen(true)} 
          disabled={!profileId}
          leftIcon={<MdAdd />}
          variant="secondary"
          className="shrink-0 w-full sm:w-auto"
        >
          Add Skill
        </Button>
      </div>

      {!profileId && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm font-medium mb-4">
          Please save your basic profile information first before adding machine skills.
        </div>
      )}

      {skills.length === 0 && profileId && (
        <div className="text-center py-12 px-4 border-2 border-dashed border-border rounded-xl">
          <div className="w-12 h-12 bg-input rounded-full flex items-center justify-center mx-auto mb-3 text-muted-foreground">
            <MdPrecisionManufacturing className="text-2xl" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">No machine skills added yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
            Employers search for specific machinery experience. Add the machines you know to stand out.
          </p>
          <Button onClick={() => setIsAddOpen(true)} variant="outline" className="h-8 text-xs">
            Add Your First Skill
          </Button>
        </div>
      )}

      {skills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => (
            <div 
              key={skill.id} 
              className="p-4 rounded-xl border border-border bg-card-hover hover:border-primary/50 transition-colors group flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-foreground truncate min-w-0">
                    {skill.machineNameEn || 'Unknown Machine'}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wide uppercase bg-primary/10 text-primary border border-primary/20 shrink-0 whitespace-nowrap">
                    {skill.experienceLevel.replace('_', ' ')}
                  </span>
                </div>
                {skill.categoryNameEn && (
                  <p className="text-xs text-muted-foreground mb-3 font-mono uppercase tracking-wider">
                    {skill.categoryNameEn}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
                  <span>{skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'} experience</span>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-4 pt-2 border-t border-border/50 ">
                <button 
                  onClick={() => setSkillToEdit(skill)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg  hover:bg-border text-foreground transition-colors cursor-pointer"
                  title="Edit skill"
                >
                  <MdEdit className="text-sm" />
                </button>
                <button 
                  onClick={() => handleDelete(skill.id)}
                  disabled={deleteSkillMutation.isPending}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer"
                  title="Remove skill"
                >
                  <MdDelete className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddSkillModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
      />
      
      <EditSkillModal
        isOpen={!!skillToEdit}
        onClose={() => setSkillToEdit(null)}
        skill={skillToEdit}
      />
    </div>
  );
};
