import * as cdk from '@aws-cdk/core';
import { Topic } from '@aws-cdk/aws-sns'
import { Queue } from '@aws-cdk/aws-sqs'
import { Effect, ManagedPolicy, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda'
import * as path from 'path'
import { SnsEventSource } from '@aws-cdk/aws-lambda-event-sources'
import { Alarm } from '@aws-cdk/aws-cloudwatch'

const cdkifyName = (name: string) => `${name}-cdk`

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const topic = new Topic(this, 'topic', {
      topicName: cdkifyName('where-things-begin')
    })

    const queue = new Queue(this, 'queue', {
      queueName: cdkifyName('where-things-end-up')
    })

    const role =new Role(this, 'role', {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      inlinePolicies: {
        translation: new PolicyDocument({
          statements: [ new PolicyStatement(
            {
              effect: Effect.ALLOW,
              actions: ['translate:*', 'comprehend:*'],
              resources: ['*']
            }
          )]
        })
      },
      managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')]
    })

    queue.grantSendMessages(role)


    const lambda = new Function(this,  'lambda', {
      code: Code.fromAsset(
        path.join(__dirname, "../../lambdas/meaningFinder/dist")
      ),
      handler: 'index.handler',
      role: role,
      runtime: Runtime.NODEJS_14_X,
      environment: {
        QUEUE_URL: queue.queueUrl
      }
    })

    lambda.addEventSource(new SnsEventSource(topic))

    new Alarm(this, 'alarm', {
      evaluationPeriods: 1,
      metric: lambda.metricErrors(),
      threshold: 1
    })
  }
}
