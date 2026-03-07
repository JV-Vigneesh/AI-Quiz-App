import json
import boto3
from boto3.dynamodb.conditions import Attr
import decimal
 
dynamodb = boto3.resource('dynamodb')
results_table = dynamodb.Table('Results')
 
# Helper to convert Decimal -> int/float for JSON
def decimal_to_native(obj):
    if isinstance(obj, list):
        return [decimal_to_native(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: decimal_to_native(v) for k, v in obj.items()}
    elif isinstance(obj, decimal.Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    else:
        return obj
 
def lambda_handler(event, context):
    try:
        # Extract user info from token
        claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
        user_email = claims.get('email')
        user_name = claims.get('name')
 
        if not user_email:
            return {
                "statusCode": 403,
                "body": json.dumps({"error": "Unauthorized - no email found in token"})
            }
 
        # Query items by filtering user_email
        response = results_table.scan(
            FilterExpression=Attr('user_email').eq(user_email)
        )
 
        items = response.get('Items', [])
        items = decimal_to_native(items)
 
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,Authorization",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
            "body": json.dumps({
                "user": user_name,
                "email": user_email,
                "results": items
            })
        }
 
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
