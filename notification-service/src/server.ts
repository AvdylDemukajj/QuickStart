import 'express-async-errors';
import { Logger } from 'winston';
import { config } from '@notifications/config';
import { winstonLogger } from '@quickstartfreelancing/common';
import { Application } from 'express';
import http from 'http';
import { healthRoutes } from './routes';
import { checkConnection } from './elasticsearch';

const SERVER_PORT = 4001;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug');
export function start(app:Application): void {
    startServer(app);
    app.use('', healthRoutes);
    startQueue();
    startElasticSearch();
}

async function startQueue(): Promise<void>{

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