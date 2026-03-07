import json
import boto3
import os
 
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('QUESTION_TABLE', 'QuestionBank')
table = dynamodb.Table(table_name)
 
def lambda_handler(event, context):
    try:
 
        # --- Authorization check ---
        claims = event['requestContext']['authorizer']['claims']
        groups = claims.get('cognito:groups', '')
 
        if not groups:
            return {
                "statusCode": 403,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Authorization, Content-Type",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
                },
                "body": json.dumps({"error": "Access denied: No group found in token"})
            }
 
        if 'Admins' not in groups:
            return {
                "statusCode": 403,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Authorization, Content-Type",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
                },
                "body": json.dumps({"error": "Access denied: Admins only"})
            }
 
        # --- Parse request body ---
        body = json.loads(event['body'])
        question_id = body.get('question_id')
        question_text = body.get('question_text')
        options = body.get('options')
        answer = body.get('answer')
 
        if not (question_id and question_text and options and answer):
            return {
                "statusCode": 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Authorization, Content-Type",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
                },
                "body": json.dumps({"error": "Invalid input: Missing required fields"})
            }
 
        # --- Save to DynamoDB ---
        table.put_item(Item={
            'question_id': question_id,
            'question_text': question_text,
            'options': options,
            'answer': answer
        })
 
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Authorization, Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
            },
            "body": json.dumps({"message": "Question added successfully"})
        }
 
    except Exception as e:
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "headers": {                             
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Authorization, Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
            },
            "body": json.dumps({"error": str(e)})
        }
