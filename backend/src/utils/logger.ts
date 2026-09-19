import winston from 'winston';

const maskFormat = winston.format((info) => {
  const secrets = ['password', 'token', 'authorization', 'apiKey'];
  for (const key of secrets) {
    if (info[key]) {
      info[key] = '********';
    }
  }
  return info;
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    maskFormat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});
