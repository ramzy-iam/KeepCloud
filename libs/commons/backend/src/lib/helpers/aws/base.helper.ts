import { getAWSConfig } from './aws.config';

export abstract class AwsServiceHelper {
  protected readonly accessKeyId: string;
  protected readonly secretAccessKey: string;
  protected readonly region: string;

  constructor(accessKeyId: string, secretAccessKey: string, region: string) {
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.region = region;
  }

  protected getCredentials() {
    return {
      ...(this.accessKeyId && this.secretAccessKey
        ? {
            credentials: {
              accessKeyId: this.accessKeyId,
              secretAccessKey: this.secretAccessKey,
            },
          }
        : {}),
    };
  }

  protected getRegion() {
    return this.region;
  }

  protected static _getInstance<P>(
    ctor: new (...args: any[]) => P,
    targetRegion?: string,
    ...args: any[]
  ): P {
    const instanceMap = (this as any).instanceMap as Map<string, P>;
    const { awsKeyId, awsSecret, awsRegion } = getAWSConfig();

    const region = targetRegion ?? awsRegion;
    let instance = instanceMap.get(region);

    if (!instance) {
      instance = new ctor(awsKeyId, awsSecret, region, ...args);
      instanceMap.set(region, instance);
    }

    return instance;
  }
}

export default AwsServiceHelper;
