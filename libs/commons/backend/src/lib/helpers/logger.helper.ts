import 'dotenv/config';
import winston, { format, Logger as WinstonLogger } from 'winston';
import util from 'util';
import { Env } from '../config';

const { combine, label, printf, colorize, timestamp } = format;

function formatLogValue(value: unknown): string {
  if (typeof value === 'object' && value !== null) {
    return util.inspect(value, { depth: null, colors: false, compact: false });
  }
  return String(value);
}

const myFormat = (useColors: boolean) =>
  printf(({ timestamp, level, message, label, ...meta }) => {
    const splatSymbol = Symbol.for('splat');
    const additionalArgs = ((meta[splatSymbol] as unknown[]) || []).map(
      formatLogValue,
    );
    const combinedMessage = additionalArgs.length
      ? `${message}, ${additionalArgs.join(', ')}`
      : message;

    let coloredLevel = level.toUpperCase();
    let coloredMessage = combinedMessage;
    let coloredLabel = `[${label}]`;

    if (useColors) {
      const colorizer = colorize({
        message: true,
        colors: {
          info: 'blue',
          error: 'red',
          debug: 'yellow',
          warn: 'magenta',
        },
      });

      coloredLevel = colorizer.colorize(level, level.toUpperCase());
      coloredMessage = colorizer.colorize(level, combinedMessage as string);
      coloredLabel = colorizer.colorize(level, `[${label}]`);
    }

    return `${timestamp} ${coloredLabel} ${coloredLevel}: ${coloredMessage}`;
  });

function getLogLevel(): string {
  const level = Env.LOG_LEVEL;
  if (level && ['error', 'warn', 'info', 'debug'].includes(level)) {
    return level;
  }
  return 'info';
}

export class Logger {
  private logger: WinstonLogger;
  private static defaultLogger: Logger;

  constructor(programName: string) {
    const isProduction = Env.NODE_ENV === 'production';

    this.logger = winston.createLogger({
      level: getLogLevel(),
      format: combine(
        label({ label: programName }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        myFormat(!isProduction), // disable colors in production
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logger.log',
          format: combine(
            label({ label: programName }),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            myFormat(false), // never use colors in file
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
