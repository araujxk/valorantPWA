import { execSync } from 'child_process';
try {
  execSync('git checkout src/components/LineupDetail.tsx', { stdio: 'inherit' });
  console.log('Restored LineupDetail.tsx successfully.');
  execSync('git checkout src/components/AgentPage.tsx', { stdio: 'inherit' });
  console.log('Restored AgentPage.tsx successfully.');
  execSync('git checkout src/App.tsx', { stdio: 'inherit' });
  console.log('Restored App.tsx successfully.');
  execSync('git checkout src/lib/validation.ts', { stdio: 'inherit' });
  console.log('Restored validation.ts successfully.');
  execSync('git checkout src/components/LineupCreator.tsx', { stdio: 'inherit' });
  console.log('Restored LineupCreator.tsx successfully.');
  execSync('git checkout src/lib/schema.ts || true', { stdio: 'inherit' });
  execSync('git checkout src/db/lineups.json || true', { stdio: 'inherit' });
  execSync('git checkout db/lineups.json || true', { stdio: 'inherit' });
} catch (e) {
  console.error('Failed to restore:', e);
}
