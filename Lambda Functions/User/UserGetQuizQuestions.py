import boto3
import json
from decimal import Decimal
 
dynamodb = boto3.resource('dynamodb')
quiz_table = dynamodb.Table('Quizzes')
question_table = dynamodb.Table('QuestionBank')
 
# Helper function to convert Decimal → int/float recursively
def decimal_to_native(obj):
    if isinstance(obj, list):
        return [decimal_to_native(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: decimal_to_native(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        # Convert to int if no fractional part
        return int(obj) if obj % 1 == 0 else float(obj)
    else:
        return obj
 
 
def lambda_handler(event, context):
    try:
        quiz_id = event.get('queryStringParameters', {}).get('quiz_id')
        if not quiz_id:
            return {'statusCode': 400, 'body': json.dumps({'error': 'quiz_id is required'})}
 
        # Get quiz metadata
        quiz_data = quiz_table.get_item(Key={'quiz_id': quiz_id}).get('Item')
        if not quiz_data:
            return {'statusCode': 404, 'body': json.dumps({'error': 'Quiz not found'})}
 
        # Fetch all questions
        question_ids = quiz_data.get('question_ids', [])
        questions = []
        for qid in question_ids:
            q = question_table.get_item(Key={'question_id': qid}).get('Item')
            if q:
                questions.append(q)
 
        # Convert Decimal to int/float safely
        result = decimal_to_native({
            'quiz_id': quiz_id,
            'metadata': quiz_data,
            'questions': questions
        })
 
        return {
            'statusCode': 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Authorization, Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
            },
            'body': json.dumps(result)
        }
 
    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
