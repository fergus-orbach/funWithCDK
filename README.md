# funWithCDK

small repo to demo some of the fun that can be had with the CDK

it was used forr the live demo at the end of this [talk on using CDK](https://www.dropbox.com/scl/fi/ve01c0n10757514xxdcji/_-AWS-CDK-infra-as-code-but-not-as-you-know-it.paper?dl=0&rlkey=3fs5q6v2uefkt16pb2rw6mwf1)

## Deploying

Make sure your current session has credentials to deploy resources (including IAM resources) into the target account

### Cdk stack
If it is  your first time working with the cdk you will have to [bootstrap](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html) your account to make sure you have the correct resources from things like the code from assests construct
- `make bootstrap-cdk`

- `make deploy-app-cdk` bundles lambda and deploys the cdk stack

### Cloudformation stack
 - `make deploy-lambda-code` to deploy lambda code
 - `make deploy-app-cloudformation` to deploy the cloudformation stack


## Using the lambda

Both the cloudformation and cdk stacks deploy an sns topic, lambda and sqs queue.
The lambda is subscribed to the topic and any messages placed on it will be consumed by the lambda and then posted to the queue

The messages should be of the following format
```json
{
  "text": "some text ot translate",
  "targetLanguage": "language code of language to translate to" //this is optional and will translate to Spanish by default 
}
```

The lambda uses the [AWS translate](https://aws.amazon.com/translate/) and should pick up the source language automagically


## Disclaimer

If deployed to a personal account this should not rack up any usage above the free tier, however if it does - I am not to blame :)


