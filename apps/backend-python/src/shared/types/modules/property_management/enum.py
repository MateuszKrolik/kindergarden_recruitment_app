from enum import StrEnum


class REQUIREMENT_TYPE(StrEnum):
    always = "always"
    conditional = "conditional"


class CONDITION_KEY(StrEnum):
    is_employed = "is_employed"
    is_self_employed = "is_self_employed"
    is_student = "is_student"
    filed_tax_in_desired_location = "filed_tax_in_desired_location"
    resides_in_desired_location = "resides_in_desired_location"


class CHILD_CONDITION_KEY(StrEnum):
    has_disability = "has_disability"
