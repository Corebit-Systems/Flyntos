import { Queue } from 'bullmq';
import { queueNames } from '@flyntos/config';
const connection={url:process.env.REDIS_URL||'redis://localhost:6379'};
for (const name of queueNames) {
  new Queue(name,{connection});
}
console.log('Flyntos worker queues registered:',queueNames.join(', '));
console.log('TODO: attach processors, retries, dead-letter strategy, and observability hooks.');
