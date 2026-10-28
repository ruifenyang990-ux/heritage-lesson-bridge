import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'heritage-ai-lesson-w29f1orh',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_B0CNwueWNHI4HiD-OUt6qrS8ZoRLNYMo',
  authRequired: false,
  auth: { mode: 'managed' },
})
