import json
import boto3
from decimal import Decimal
 
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("QuestionBank")
 
 
def lambda_handler(event, context):
    print("RAW EVENT:", event)   # debug
 
    method = event["httpMethod"]
 
    # extract claims (same fix you applied earlier)
    authorizer = event.get("requestContext", {}).get("authorizer", {})
    claims = authorizer.get("claims") or authorizer.get("jwt", {}).get("claims", {})
    groups = claims.get("cognito:groups") or ""
    if "Admins" not in groups:
        return response(403, {"error": "Admins only"})
 
    # GET → return all questions
    if method == "GET":
        items = table.scan().get("Items", [])
        return response(200, {"questions": items})
 
    # PUT → update question
    if method == "PUT":
        body = json.loads(event["body"])
        question_id = body["question_id"]
        updates = {k: v for k, v in body.items() if k != "question_id"}
 
        update_expr = ", ".join([f"{k} = :{k}" for k in updates])
        values = {f":{k}": v for k, v in updates.items()}
 
        table.update_item(
            Key={"question_id": question_id},
            UpdateExpression=f"SET {update_expr}",
            ExpressionAttributeValues=values
        )
 
        return response(200, {"message": "Question updated"})
 
    # DELETE → delete question
    if method == "DELETE":
        body = json.loads(event["body"])
        question_id = body["question_id"]
 
        table.delete_item(Key={"question_id": question_id})
        return response(200, {"message": "Question deleted"})
 
    return response(400, {"error": "Method not supported"})
 
 
def response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS"
        },
        "body": json.dumps(body),
    }
