from pydantic import BaseModel

class SearchTextQueryRequest(BaseModel):
    query: str
    region: str

class SearchZipCodesRequest(BaseModel):
    zip_codes: str | list[str]
    included_types: str | list[str]
    radius: int = 5000