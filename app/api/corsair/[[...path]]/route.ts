import { toNextJsHandler } from 'corsair';
import { corsair } from '../../../../lib/corsair';

export const { GET, POST, OPTIONS } = toNextJsHandler(corsair, {
  basePath: '/api/corsair',
});