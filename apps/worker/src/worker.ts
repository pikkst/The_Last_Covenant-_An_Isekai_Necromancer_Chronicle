import { createStructuredLogger, createJsonConsoleSink, getTracer } from '@tlc/observability';

const logger = createStructuredLogger({
  sink: createJsonConsoleSink(),
});

async function main() {
  const tracer = getTracer();
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
