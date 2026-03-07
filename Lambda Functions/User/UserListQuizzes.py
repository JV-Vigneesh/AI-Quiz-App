import json
import boto3
from decimal import Decimal
from boto3.dynamodb.conditions import Attr

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return int(o) if o % 1 == 0 else float(o)
        return super().default(o)

def lambda_handler(event, context):
    try:
        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table("Quizzes")

        quizzes = []
        scan_kwargs = {
            "FilterExpression": Attr("status").eq("PUBLISHED")
        }

        # ----- Handle pagination -----
        while True:
            response = table.scan(**scan_kwargs)
            quizzes.extend(response.get("Items", []))

            if "LastEvaluatedKey" not in response:
                break

            scan_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Authorization, Content-Type",
                "Access-Control-Allow-Methods": "GET, OPTIONS"
            },
            "body": json.dumps({"quizzes": quizzes}, cls=DecimalEncoder)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"error": str(e)})
        }
