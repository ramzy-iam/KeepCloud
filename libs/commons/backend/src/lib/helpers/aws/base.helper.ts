import { getAWSConfig } from './aws.config';

abstract class AwsServiceHelper<T> {
  protected abstract client: T;

  protected static _getInstance<P>(
    ctor: new (...args: unknown[]) => P,
    targetRegion?: string,
    ...args: unknown[]
  ): P {
    const instanceMap = (this as any).instanceMap as Map<string, P>; //should be defined in the inherited class as protected static property
    const { awsKeyId, awsSecret, awsRegion } = getAWSConfig();
    const region = targetRegion ?? awsRegion;
    let instance = instanceMap.get(region);

    if (!instance) {
      instance = new ctor(awsKeyId, awsSecret, region, ...args);
      instanceMap.set(region, instance);
    }
    return instance as P;
  }
}

export default AwsServiceHelper;
