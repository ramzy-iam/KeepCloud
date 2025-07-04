import 'dotenv/config';
import winston, { format, Logger as WinstonLogger } from 'winston';
import util from 'util';
import { Env } from '../config';

const { combine, label, printf, colorize, timestamp } = format;

// Helper to format objects nicely in logs
function formatLogValue(value: any): string {
  if (typeof value === 'object' && value !== null) {
    return util.inspect(value, { depth: null, colors: false, compact: false });
  }
  return String(value);
}

const myFormat = printf(({ timestamp, level, message, label, ...meta }) => {
  const splatSymbol = Symbol.for('splat');
  const additionalArgs = ((meta[splatSymbol] as unknown[]) || []).map(
    formatLogValue,
  );
  const combinedMessage = additionalArgs.length
    ? `${message}, ${additionalArgs.join(', ')}`
    : message;

  const colorizer = colorize({
    message: true,
    colors: { info: 'blue', error: 'red', debug: 'yellow', warn: 'magenta' },
  });

  const coloredLevel = colorizer.colorize(level, level.toUpperCase());
  const coloredMessage = colorizer.colorize(level, combinedMessage as string);

  const coloredLabel = colorizer.colorize(level, `[${label}]`);

  return `${timestamp} ${coloredLabel} ${coloredLevel}: ${coloredMessage}`;
});

function getLogLevel(): string {
  const level = Env.LOG_LEVEL?.toLowerCase();
  if (level && ['error', 'warn', 'info', 'debug'].includes(level)) {
    return level;
  }
  return 'info';
}

export class Logger {
  private logger: WinstonLogger;
  private static defaultLogger: Logger;

  constructor(programName: string) {
    this.logger = winston.createLogger({
      level: getLogLevel(),
      format: combine(
        label({ label: programName }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        myFormat,
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logger.log',
          format: combine(
            label({ label: programName }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            myFormat, // no colorize here for clean file logs
          ),
        }),
      ],
    });
  }

  info(message: string, ...meta: unknown[]) {
    this.logger.info(message, ...meta);
  }

  error(message: string, ...meta: unknown[]) {
    this.logger.error(message, ...meta);
  }

  debug(message: string, ...meta: unknown[]) {
    this.logger.debug(message, ...meta);
  }

  warn(message: string, ...meta: unknown[]) {
    this.logger.warn(message, ...meta);
  }

  get raw(): WinstonLogger {
    return this.logger;
  }

  private static getDefaultLogger(): Logger {
    if (!Logger.defaultLogger) {
      Logger.defaultLogger = new Logger('App');
    }
    return Logger.defaultLogger;
  }

  static info(message: string, ...meta: unknown[]) {
    Logger.getDefaultLogger().info(message, ...meta);
  }

  static error(message: string, ...meta: unknown[]) {
    Logger.getDefaultLogger().error(message, ...meta);
  }

  static debug(message: string, ...meta: unknown[]) {
    Logger.getDefaultLogger().debug(message, ...meta);
  }

  static warn(message: string, ...meta: unknown[]) {
    Logger.getDefaultLogger().warn(message, ...meta);
  }
}
