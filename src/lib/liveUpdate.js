import { registerPlugin } from '@capacitor/core';

// Browser fallback keeps `npm run dev` and the deployed website working unchanged.
const web = {
  async info() {
    return { appliedVersion: 0, pendingVersion: 0, usingDownloadedBundle: false };
  },
  async sync() {
    return { available: false, reason: 'web' };
  },
  async markReady() {},
  async reset() {
    return { ok: true };
  },
};

const LiveUpdate = registerPlugin('LiveUpdate', { web: () => web });

export default LiveUpdate;
