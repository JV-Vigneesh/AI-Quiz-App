import json
import boto3
from decimal import Decimal
 
# Custom encoder to handle Decimal types from DynamoDB
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            # Convert Decimal to int if it’s a whole number, else float
            if o % 1 == 0:
                return int(o)
            else:
                return float(o)
        return super(DecimalEncoder, self).default(o)
 
def lambda_handler(event, context):
    try:
        # Verify Admin access via Cognito group
        claims = event["requestContext"]["authorizer"]["claims"]
        groups = claims.get("cognito:groups", "")
        if "Admins" not in groups:
            return {
                "statusCode": 403,
                "body": json.dumps({"error": "Access denied: Admins only"})
            }
 
        # Connect to DynamoDB Results table (updated)
        dynamodb = boto3.resource("dynamodb")
        results_table = dynamodb.Table("Results")
 
        # Scan all quiz results
        response = results_table.scan()
        items = response.get("Items", [])
 
        # Return all results in JSON
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Authorization, Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
            },
            "body": json.dumps({"results": items}, cls=DecimalEncoder)
        }
 
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
