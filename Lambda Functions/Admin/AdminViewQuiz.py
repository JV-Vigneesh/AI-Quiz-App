import json
import boto3
import os

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ.get("QUIZ_TABLE", "Quizzes"))

ALLOWED_STATUSES = ["DRAFT", "PUBLISHED", "CLOSED"]

from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    try:
        # ---------- Authorization ----------
        claims = event.get("requestContext", {}).get("authorizer", {}).get("claims")
        if not claims:
            return response(401, {"error": "Unauthorized"})

        groups = claims.get("cognito:groups", "")
        if "Admins" not in groups:
            return response(403, {"error": "Admins only"})

        method = event.get("httpMethod")

        # ---------- GET : View all quizzes ----------
        if method == "GET":
            data = table.scan(
                ProjectionExpression="#qid, #t, #tp, #d, #m, #s, #c",
                ExpressionAttributeNames={
                    "#qid": "quiz_id",
                    "#t": "title",
                    "#tp": "topic",
                    "#d": "duration",     # 👈 alias for reserved word
                    "#m": "marks",
                    "#s": "status",
                    "#c": "created_at"
                }
            )

            quizzes = data.get("Items", [])
            quizzes.sort(key=lambda x: x.get("created_at", ""), reverse=True)

            return response(200, {"quizzes": quizzes})

        # ---------- PUT : Edit quiz ----------
        if method == "PUT":
            body = json.loads(event.get("body", "{}"))
            quiz_id = body.get("quiz_id")

            if not quiz_id:
                return response(400, {"error": "quiz_id is required"})

            update_expr = []
            expr_names = {}
            expr_values = {}

            for field in ["title", "topic", "duration", "marks", "question_ids", "status"]:
                if field in body:
                    if field == "status" and body[field] not in ALLOWED_STATUSES:
                        return response(400, {"error": "Invalid status"})
                    update_expr.append(f"#{field} = :{field}")
                    expr_names[f"#{field}"] = field
                    expr_values[f":{field}"] = body[field]

            if not update_expr:
                return response(400, {"error": "No fields to update"})

            table.update_item(
                Key={"quiz_id": quiz_id},
                UpdateExpression="SET " + ", ".join(update_expr),
                ExpressionAttributeNames=expr_names,
                ExpressionAttributeValues=expr_values
            )

            return response(200, {"message": "Quiz updated successfully"})

        # ---------- DELETE : Delete quiz ----------
        if method == "DELETE":
            body = json.loads(event.get("body", "{}"))
            quiz_id = body.get("quiz_id")

            if not quiz_id:
                return response(400, {"error": "quiz_id is required"})

            table.delete_item(Key={"quiz_id": quiz_id})

            return response(200, {"message": "Quiz deleted successfully"})

        # ---------- Unsupported ----------
        return response(405, {"error": "Method not allowed"})

    except Exception as e:
        print("Error:", str(e))
        return response(500, {"error": str(e)})

# ---------- Common response ----------
def response(status, body):
    return {
        "statusCode": status,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS"
        },
        "body": json.dumps(body, cls=DecimalEncoder)
    }
