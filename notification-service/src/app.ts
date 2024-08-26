import { winstonLogger } from '@quickstartfreelancing/common';
import { Logger } from 'winston';
import { config } from './config';
import express, { Express } from 'express';
import { start } from './server';


const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationElasticSearchServer', 'debug');

function initialize(): void {
    const app: Express = express();
    start(app);
    log.info('Notification Service initialized');
}

initialize();