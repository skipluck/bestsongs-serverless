# Best Songs (Serverless)
Project to demonstrate using Serverless framework to
* Create DynamoDB table
* Create S3 bucket
* Create IAM roles
* Trigger Lambda function when a file is uploaded to S3 bucket
    * Lambda function reads the file and loads data into DynamoDB table
* Create 3 API Gateway endpoints to trigger Lamgda functions that:
    * displays a random song from [list of 100 songs](http://www.johnsandford.org/prey16x1.html)
    * displays a ranked song from [list of 100 songs](http://www.johnsandford.org/prey16x1.html)
    * displays [list of 100 songs](http://www.johnsandford.org/prey16x1.html)

## Prerequisites
* AWS Account
* AWS IAM Role with Access Keys and appropriate policies attached
* [Serverless framework installed and configured](https://gist.github.com/skipluck/8d2084dc2425cc8350789ca0efd7c4ba)

## Running this project
Open terminal window and run the following commands

### Cloning this project from github
````
git clone https://github.com/skipluck/bestsongs-serverless
cd bestsongs-serverless
````
### Deploy the code to AWS
````
sls deploy
````