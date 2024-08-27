import 'express-async-errors';
import { Logger } from 'winston';
import { config } from '@notifications/config';
import { winstonLogger } from '@quickstartfreelancing/common';
import { Application } from 'express';
import http from 'http';
import { healthRoutes } from './routes';
import { checkConnection } from './elasticsearch';
import { createConnection } from './queues/connection';
import { Channel } from 'amqplib';
import { consumeAuthEmailMessages } from './queues/email.consumer';

const SERVER_PORT = 4001;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug');
export function start(app:Application): void {
    startServer(app);
    app.use('', healthRoutes);
    startQueue();
    startElasticSearch();
    startQueue();
}

async function startQueue(): Promise<void>{
    const emailChannel: Channel = await createConnection() as Channel;
    await consumeAuthEmailMessages(emailChannel);
    await emailChannel.assertExchange('quickstart-email-notification', 'direct');
    const message = JSON.stringify({name: 'quickstart', service: 'notification service'});
    emailChannel.publish('quickstart-email-notification','auth-email', Buffer.from(message));
}

function startElasticSearch(): void {
    checkConnection();
}

function startServer(app:Application): void {
    try {
        const httpServer: http.Server = new http.Server(app);
        log.info(`Worker with process id of ${process.pid} on notification server has started`);
        httpServer.listen(SERVER_PORT, () => {
            log.info(`Notification server is listening on port ${SERVER_PORT}`);
        });
    } catch (error) {
        log.log('error','NotificationService startServer() method:',error);
    }
}