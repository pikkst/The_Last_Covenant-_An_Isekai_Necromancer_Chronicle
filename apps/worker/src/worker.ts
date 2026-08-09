import { createStructuredLogger, getTracer } from '@tlc/observability';

const logger = createStructuredLogger({
  sink: (entry) => {
    const logEntry = { ...entry, level: entry.level.toUpperCase() };
    switch (entry.level) {
      case 'error':
        console.error(logEntry);
        break;
      case 'warn':
        console.warn(logEntry);
        break;
      default:
        console.log(logEntry);
    }
  },
});

async function main() {
  const tracer = await getTracer();
  const span = tracer.startSpan('worker.start', { service: 'worker' });
  try {
    logger.log('info', 'Worker starting...');
    span.setAttribute('status', 'started');
  } finally {
    span.end();
  }
}

main().catch((err) => {
  logger.log('error', 'Worker failed', { cause: err });
  process.exit(1);
});
