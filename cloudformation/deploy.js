import AWS from 'aws-sdk';
import fs from 'fs';
import archiver from 'archiver';

AWS.config.update({ region: process.env.AWSRegion });
const _cloudformation = new AWS.CloudFormation();
const _s3 = new AWS.S3();

const templateBucket = process.env.BucketName;
const identifier = new Date().toISOString().substring(0, 19).split(':').join('');
const lambdaName = `${process.env.LambdaFileName}-${identifier}`;

const zipLambdaKey = `${process.env.LambdaBucketFolder}/${lambdaName}.zip`;
const templateKey = `${process.env.BucketFolder}/${process.env.CloudFormationTemplateName}-${identifier}.yaml`;
const apiTemplateKey = `${process.env.BucketFolder}/${process.env.APITemplateName}-${identifier}.yaml`;
const stackName = process.env.StackName || 'test-stack';

export default function deploy(): void {
  const request = {
    StackName: stackName,
    TemplateURL: `https://s3.amazonaws.com/${templateBucket}/${templateKey}`,
    Capabilities: ['CAPABILITY_IAM'],
    Parameters: []
  };

  // zipLambda();
  const uploadTemplate = uploadTextFile('./cloudformation/template.yaml', templateKey);
  const uploadAPI = uploadTextFile('./cloudformation/api.yaml', apiTemplateKey);
  const uploadLambda = uploadFile('./build/lambda.zip', zipLambdaKey);

  const uploads = Promise.all([uploadAPI, uploadTemplate, uploadLambda]);

  uploads
    .then(
      () => {
        return _cloudformation.describeStacks({ StackName: stackName }).promise();
      },
      err => {
        console.log(`Could not upload stack: ${err}`);
      }
    )
    .then(
      () => {
        // Stack exists - update
        return _cloudformation.updateStack(request).promise();
      },
      err => {
        // Stack does not exist - create
        return _cloudformation.createStack(request).promise();
      }
    )
    .then(
      () => {
        console.log('Successfully sent request to AWS. Check cloudformation.');
      },
      err => {
        console.log(err);
      }
    );
}

export function zipLambda(): void {
  const outputFile = fs.createWriteStream('build/lambda.zip');
  const zipFile = archiver('zip');
  zipFile.on('error', err => {
    console.log(err);
  });
  zipFile.pipe(outputFile);
  zipFile.directory('dist', '');
  zipFile.finalize();
}

function replaceAll(inStr: string): string {
  let result = inStr;
  // TODO: should use a different format to replace strings since !Ref uses the ${variable} format
  const regexMap = {
    '\\$\\{zipLambdaKey\\}': zipLambdaKey,
    '\\$\\{ApiTemplateKey\\}': apiTemplateKey,
    '\\$\\{LambdaName\\}': lambdaName,
    '\\$\\{AWSRegion\\}': process.env.AWSRegion || '',
    '\\$\\{AccountId\\}': process.env.AccountId || ''
  };

  Object.keys(regexMap).forEach(key => {
    result = result.replace(new RegExp(key, 'g'), regexMap[key]);
  });

  return result;
}

function uploadFile(fileName: string, key: string): Promise<any> {
  return _s3
    .upload({
      Bucket: templateBucket,
      Key: key,
      Body: fs.createReadStream(fileName)
    })
    .promise();
}

function uploadTextFile(fileName: string, key: string): Promise<any> {
  return _s3
    .upload({
      Bucket: templateBucket,
      Key: key,
      Body: replaceAll(fs.readFileSync(fileName, { encoding: 'UTF-8' }))
    })
    .promise();
}
