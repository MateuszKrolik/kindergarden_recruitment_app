from abc import ABC, abstractmethod
import asyncio
import boto3

from src.shared.types.response import HTTPError, HTTPErrorResponse
from src.shared.utils.query import try_except


class IS3Repository(ABC):
    @abstractmethod
    async def get_document_url_by_file_path(
        self, key: str, bucket: str = "mybucket", expires_in: int = 3600
    ) -> HTTPErrorResponse[str]:
        pass


class S3Repository(IS3Repository):
    def __init__(self):
        self.client = boto3.client(
            "s3",
            endpoint_url="http://localhost:9000",
            aws_access_key_id="minioadmin",
            aws_secret_access_key="minioadmin",
            config=boto3.session.Config(s3={"addressing_style": "path"}),
        )

    async def get_document_url_by_file_path(
        self, key: str, bucket: str = "mybucket", expires_in: int = 3600
    ) -> HTTPErrorResponse[str]:
        def _generate_url():
            return self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket, "Key": key},
                ExpiresIn=expires_in,
            )

        url, error = await try_except(lambda: asyncio.to_thread(_generate_url))
        if error:
            return None, HTTPError(code=500, message=str(error))
        assert url is not None
        return url, None
