import { Channel, ConsumeMessage } from 'amqplib';
import { winstonLogger } from '@quickstartfreelancing/common';
import { config } from '@notifications/config';
import { Logger } from 'winston';
import { createConnection } from './connection';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationQueueConnection', 'debug');

async function consumeAuthEmailMessages(channel: Channel): Promise<void> {
    try {
        if (!channel){
            channel = await createConnection() as Channel;
        }

        const exchangeName = 'quickstart-email-notification';
        const routingKey = 'auth-email';
        const queueName = 'auth-email-queue';

        await channel.assertExchange(exchangeName, 'direct');
        const quickStartQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
        await channel.bindQueue(quickStartQueue.queue, exchangeName, routingKey);

        channel.consume(quickStartQueue.queue, async (msg: ConsumeMessage | null) => {
            console.log(JSON.parse(msg!.content.toString()));

            channel.ack(msg!);
        });
    } catch (error) {
        log.log('error', 'Notification Serive EmailConsumer consumeAuthEmailMessages() method error:' ,error);
    }
}

export { consumeAuthEmailMessages };