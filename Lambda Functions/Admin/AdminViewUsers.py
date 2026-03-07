import json
import boto3
import os
 
def lambda_handler(event, context):
    try:
        claims = event["requestContext"]["authorizer"]["claims"]
        groups = claims.get("cognito:groups", "")
        if "Admins" not in groups:
            return {
                "statusCode": 403,
                "body": json.dumps({"error": "Access denied: Admins only"})
            }
 
        user_pool_id = os.environ.get("USER_POOL_ID")
        cognito_client = boto3.client("cognito-idp")
 
        users = []
        response = cognito_client.list_users(UserPoolId=user_pool_id)
 
        for user in response["Users"]:
            # Get user's email
            email = next(
                (attr["Value"] for attr in user["Attributes"] if attr["Name"] == "email"),
                "N/A"
            )
 
            # Fetch Cognito user groups
            groups_resp = cognito_client.admin_list_groups_for_user(
                UserPoolId=user_pool_id,
                Username=user["Username"]
            )
 
            group_name = groups_resp["Groups"][0]["GroupName"] if groups_resp.get("Groups") else "User"
 
            users.append({
                "username": user["Username"],
                "email": email,
                "group": group_name   # Include group in payload
            })
 
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Authorization, Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
            },
            "body": json.dumps({"users": users})
        }
 
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
