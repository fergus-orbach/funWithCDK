PATH_TO_LAMBDA=lambdas/meaningFinder

deploy-artifacts-bucket:
	 aws cloudformation deploy \
 		--template-file ./cloudformation/lambda-artifacts-bucket.yaml \
      	--stack-name lambda-artifacts-bucket \
      	--region eu-west-1

bundle-lambda:
	yarn --cwd $(PATH_TO_LAMBDA)
	yarn --cwd $(PATH_TO_LAMBDA) build
	yarn --cwd $(PATH_TO_LAMBDA) install --frozen-lockfile --production --modules-folder ./dist/node_modules
	zip -r $(PATH_TO_LAMBDA)/dist.zip $(PATH_TO_LAMBDA)/dist

copy-lambda-code-to-bucket:
	aws s3api put-object --bucket fergios-artifacts-bucket \
      --key meaningFinder-lambda \
      --region eu-west-1 \
      --body "./lambdas/meaningFinder/dist.zip"


deploy-lambda-code: deploy-artifacts-bucket bundle-lambda copy-lambda-code-to-bucket
