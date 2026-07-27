import React, { useMemo } from 'react';
import { TreeLayout3D, TreeTheme } from '@shared/types';
import { BranchMesh } from './BranchMesh';
import { Leaves } from './Leaves';
import { Decorations } from './Decorations';

interface LivingTreeProps {
  layout: TreeLayout3D;
  theme: TreeTheme;
  repoPath?: string;
}

export function LivingTree({ layout, theme, repoPath }: LivingTreeProps) {
  const branches = useMemo(() => layout.branches, [layout]);

  return (
    <group>
      {branches.map((branch) => (
        <BranchMesh key={branch.id} branch={branch} theme={theme} />
      ))}
      <Leaves leaves={layout.leaves} theme={theme} repoPath={repoPath} />
      <Decorations decorations={layout.decorations} theme={theme} />
    </group>
  );
}
