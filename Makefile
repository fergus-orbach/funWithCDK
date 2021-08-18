PATH_TO_LAMBDA=lambdas/meaningFinder
ARTIFACT_BUCKET_NAME=fergios-artifacts-bucket
ARTIFACT_BUCKET_KEY=meaningFinder-lambda

deploy-artifacts-bucket:
	 aws cloudformation deploy \
 		--template-file ./cloudformation/lambda-artifacts-bucket.yaml \
      	--stack-name lambda-artifacts-bucket \
      	--region eu-west-1 \
      	--parameter-overrides \
      		ArtifactBucketName=$(ARTIFACT_BUCKET_NAME)

bundle-lambda:
	yarn --cwd $(PATH_TO_LAMBDA)
	yarn --cwd $(PATH_TO_LAMBDA) build
	yarn --cwd $(PATH_TO_LAMBDA) install --frozen-lockfile --production --modules-folder ./dist/node_modules

zip-lambda:
	cd $(PATH_TO_LAMBDA) && zip -r dist.zip ./dist

copy-lambda-code-to-bucket:
	aws s3api put-object --bucket fergios-artifacts-bucket \
      --key $(ARTIFACT_BUCKET_KEY)/dist.zip \
      --region eu-west-1 \
      --body "./lambdas/meaningFinder/dist.zip"


deploy-lambda-code: deploy-artifacts-bucket bundle-lambda zip-lambda copy-lambda-code-to-bucket

deploy-app-cloudformation:
	aws cloudformation deploy \
		--template-file ./cloudformation/app-stack.yaml \
		--stack-name meaning-finder-stack \
		--region eu-west-1 \
		--capabilities CAPABILITY_NAMED_IAM \
		--parameter-overrides \
			ArtifactBucket=$(ARTIFACT_BUCKET_NAME) \
			ArtifactBucketKey=$(ARTIFACT_BUCKET_KEY)

bootstrap-cdk:
	cd cdk && yarn && yarn cdk bootstrap

deploy-app-cdk: bundle-lambda
	cd cdk && yarn cdk deploy CdkStack --require-approval never

