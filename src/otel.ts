import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis-4';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';
import { RuntimeNodeInstrumentation } from '@opentelemetry/instrumentation-runtime-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  ATTR_SERVICE_INSTANCE_ID,
} from '@opentelemetry/semantic-conventions';
import {
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-node';
import * as dotenv from 'dotenv';
import * as os from 'os';
import * as packageJson from '../package.json';

// Load environment variables for the SDK initialization
dotenv.config();

const enableTracing = process.env.ENABLE_TRACING === 'true';
const enableMetrics = process.env.ENABLE_METRICS === 'true';

const sdk: NodeSDK | null = null;

if (enableTracing || enableMetrics) {
  // Configurable sampling
  const defaultSampling = process.env.NODE_ENV === 'production' ? 0.2 : 1.0;
  const samplerArg = process.env.OTEL_TRACES_SAMPLER_ARG;
  const rawRatio = samplerArg ? parseFloat(samplerArg) : defaultSampling;
  let ratio: number;

  if (!isNaN(rawRatio) && rawRatio >= 0 && rawRatio <= 1) {
    ratio = rawRatio;
  } else {
    console.warn(
      `[OTEL] Invalid OTEL_TRACES_SAMPLER_ARG="${samplerArg}", falling back to default (${defaultSampling})`,
    );
    ratio = defaultSampling;
  }

  const percentage = Math.round(ratio * 100);

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]:
        process.env.OTEL_SERVICE_NAME || 'nestjs-boilerplate',
      [ATTR_SERVICE_VERSION]: packageJson.version,
      [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]:
        process.env.NODE_ENV || 'development',
      [ATTR_SERVICE_INSTANCE_ID]:
        process.env.SERVICE_INSTANCE_ID || os.hostname(),
    }),

    // Sampling strategy
    sampler: new ParentBasedSampler({
      root: new TraceIdRatioBasedSampler(ratio),
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
          port: parseInt(process.env.METRICS_PORT || '9464', 10),
        })
      : undefined,

    instrumentations: [
      new HttpInstrumentation({
        // Hardening: ignore internal endpoints
        ignoreIncomingRequestHook: (req) => {
          const url = req.url || '';
          return (
            url.startsWith('/metrics') ||
            url.startsWith('/health') ||
            url.startsWith('/docs')
          );
        },
      }),
      new ExpressInstrumentation(),
      new NestInstrumentation(),
      new RedisInstrumentation(),
      new PrismaInstrumentation(),
      new AwsInstrumentation(),
      new RuntimeNodeInstrumentation(), // Enable runtime metrics
    ],
  });

  sdk.start();

  console.log('OpenTelemetry SDK started successfully');

  if (enableTracing) {
    console.log(`Tracing enabled (sampling: ${percentage}% | ratio: ${ratio})`);
  }

  if (enableMetrics) {
    console.log(
      `Metrics enabled (Prometheus exporter on port ${
        process.env.METRICS_PORT || '9464'
      })`,
    );
  }
}

export { sdk as otelSdk };
