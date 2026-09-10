import type { Consumer, EachMessagePayload } from "kafkajs";
import { createKafkaClient } from "./client";
import { logger } from "../logger/logger";

export async function createConsumer(
  clientId: string,
  groupId: string,
): Promise<Consumer> {
  const kafka = createKafkaClient(clientId);

  const consumer = kafka.consumer({ groupId });

  await consumer.connect();

  logger.info({ clientId, groupId }, "kafka consumer connected");

  return consumer;
}

// Subscribe to the topic names
// Start a poll
// Call business handler for every/each message

export async function runConsumer(
  consumer: Consumer,
  topics: string[],
  handler: (payload: EachMessagePayload) => Promise<void>,
  options?: { fromBeginning?: boolean },
): Promise<void> {
  await consumer.subscribe({
    topics,
    fromBeginning: options?.fromBeginning ?? false,
  });

  await consumer.run({
    eachMessage: async (payload) => {
      const { topic, partition, message } = payload;

      logger.info(
        {
          topic,
          partition,
          offset: message.offset,
          key: message.key?.toString(),
        },
        "Kafka messages received",
      );

      await handler(payload);
    },
  });
}
