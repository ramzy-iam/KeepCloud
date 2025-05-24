export const getAWSConfig = (): {
  awsKeyId: string;
  awsSecret: string;
  awsRegion: string;
} => {
  const awsKeyId =
    process.env.APP_AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID;
  const awsSecret =
    process.env.APP_AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY;
  const awsRegion =
    process.env.APP_AWS_DEFAULT_REGION ?? process.env.AWS_DEFAULT_REGION;

  return { awsKeyId, awsSecret, awsRegion };
};
