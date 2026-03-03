import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis-4';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import * as dotenv from 'dotenv';

// Load environment variables for the SDK initialization
dotenv.config();

const enableTracing = process.env.ENABLE_TRACING === 'true';
const enableMetrics = process.env.ENABLE_METRICS === 'true';

if (enableTracing || enableMetrics) {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]:
        process.env.OTEL_SERVICE_NAME || 'nestjs-boilerplate',
    }),
    traceExporter: enableTracing
      ? new OTLPTraceExporter({
          url:
            process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
            'http://localhost:4318/v1/traces',
        })
      : undefined,
    metricReader: enableMetrics
      ? new PrometheusExporter({
          port: 9464, // Default port for Prometheus exporter
        })
      : undefined,
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new NestInstrumentation(),
      new RedisInstrumentation(),
      new PrismaInstrumentation(),
      new AwsInstrumentation(),
    ],
  });

  // Gracefully shut down the SDK on process exit
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('OTel SDK shut down successfully'))
      .catch((err) => console.log('Error shutting down OTel SDK', err))
      .finally(() => process.exit(0));
  });

  try {
    sdk.start();
    console.log('OpenTelemetry SDK started successfully');
    if (enableTracing) console.log('Tracing enabled');
    if (enableMetrics) console.log('Metrics enabled (Prometheus exporter on port 9464)');
  } catch (error) {
    console.error('Error starting OpenTelemetry SDK', error);
  }
}
