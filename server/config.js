export const DEMO_EMAIL = (process.env.DEMO_EMAIL || 'demo@amy-demo.local').toLowerCase();
export const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'demo12345';
export const TEAM_PASSWORD = process.env.TEAM_PASSWORD || 'amy-team-2026';
export const usingDefaultTeamPassword = !process.env.TEAM_PASSWORD;
