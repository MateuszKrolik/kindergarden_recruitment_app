from pydantic import BaseModel


class ParentConditionKeys(BaseModel):
    is_employed: bool
    is_self_employed: bool
    is_student: bool
    filed_tax_in_desired_location: bool
    resides_in_desired_location: bool
