import { checkDatabaseHealth, disconnectPrisma } from '@/server/db/prisma'
import { checkRedisHealth, disconnectRedis } from '@/server/cache/redis'
import {
  checkQueueHealth,
  closeAllQueues,
} from '@/server/queue/queues'
import { closeQueueConnection } from '@/server/queue/connection'

async function main() {
  const db = await checkDatabaseHealth()
  const redis = await checkRedisHealth()
  const queue = await checkQueueHealth()
  console.log(JSON.stringify({ db, redis, queue }, null, 2))
  await closeAllQueues()
  await closeQueueConnection()
  await disconnectRedis()
  await disconnectPrisma()
  if (!(db.ok && redis.ok && queue.ok)) process.exit(1)
}

void main()
