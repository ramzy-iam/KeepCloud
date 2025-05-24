import { getAWSConfig } from './aws.config';

class AwsServiceHelper {
  protected static _getInstance<P>(
    ctor: new (...args: any[]) => P,
    targetRegion?: string,
    ...args: any[]
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
