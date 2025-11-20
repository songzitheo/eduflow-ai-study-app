import OpenAI from 'openai';

import { getEnvVar } from '@/utils/get-env-var';

export const openaiClient = new OpenAI({
  apiKey: getEnvVar(process.env.OPENAI_API_KEY, 'OPENAI_API_KEY'),
});
