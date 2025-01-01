import boto3

s3_client = boto3.client(
    "s3",
    endpoint_url=f"http://localhost:4566",
    aws_access_key_id="csengo-access-key-id",
    aws_secret_access_key="csengo-secret-access-key",
    region_name="csengo-region"
)

s3_client.create_bucket(Bucket="csengo-sounds-s3-bucket")