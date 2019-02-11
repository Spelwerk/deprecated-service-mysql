const winston = require('winston');

/*
log levels:
    error: 0
    warn: 1
    info: 2
    verbose: 3
    debug: 4
    silly: 5
*/

const logLevel = process.env.LOG_LEVEL || 'warn';

const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.json(),
    maxsize: 5242880,
    maxFiles: 20,
    transports: [
        new winston.transports.File({
            filename: 'logs/spelwerk-service-mysql.log',
            handleExceptions: true,
        }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        level: logLevel,
        format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.splat(),
            winston.format.simple(),
        ),
    }));
}

module.exports = logger;
