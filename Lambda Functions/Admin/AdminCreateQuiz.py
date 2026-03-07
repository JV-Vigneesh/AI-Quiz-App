import json
import boto3
import uuid
from datetime import datetime
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get("QUIZ_TABLE", "Quizzes"))

ALLOWED_STATUSES = ["DRAFT", "PUBLISHED", "CLOSED"]

def lambda_handler(event, context):
    try:
        # ---------- Authorization ----------
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims')
        if not claims:
            return {
                'statusCode': 401,
                'body': json.dumps({'error': 'Unauthorized'})
            }

        groups = claims.get('cognito:groups', '')
        if 'Admins' not in groups:
            return {
                'statusCode': 403,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Authorization, Content-Type",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
                },
                'body': json.dumps({'error': 'Access denied: Admins only'})
            }

        # ---------- Parse input ----------
        body = json.loads(event.get('body', '{}'))

        title = body.get('title')
        topic = body.get('topic')
        duration = body.get('duration')
        marks = body.get('marks')
        question_ids = body.get('question_ids', [])
        status = body.get('status', 'DRAFT')  # default to DRAFT

        # ---------- Validation ----------
        if not (title and topic and duration and marks and question_ids):
            return {
                'statusCode': 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Authorization, Content-Type",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
                },
                'body': json.dumps({'error': 'Missing required fields'})
            }

        if status not in ALLOWED_STATUSES:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': f'Invalid status. Allowed: {ALLOWED_STATUSES}'
                })
            }

        # ---------- Create quiz ----------
        quiz_id = f"quiz-{str(uuid.uuid4())[:8]}"
        created_at = datetime.utcnow().isoformat()

        table.put_item(
            Item={
                'quiz_id': quiz_id,
                'title': title,
                'topic': topic,
                'duration': duration,
                'marks': marks,
                'question_ids': question_ids,
                'status': status,
                'created_at': created_at
            },
            ConditionExpression="attribute_not_exists(quiz_id)"
        )

        return {
            'statusCode': 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Authorization, Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
            },
            'body': json.dumps({
                'message': 'Quiz created successfully',
                'quiz_id': quiz_id,
                'status': status
            })
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Authorization, Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
            },
            'body': json.dumps({'error': str(e)})
        }
