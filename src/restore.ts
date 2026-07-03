import { execSync } from 'child_process';
try {
  execSync('git checkout src/components/LineupDetail.tsx', { stdio: 'inherit' });
  console.log('Restored LineupDetail.tsx successfully.');
} catch (e) {
  console.error('Failed to restore:', e);
}
