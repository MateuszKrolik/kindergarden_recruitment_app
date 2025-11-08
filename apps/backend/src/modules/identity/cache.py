from typing import Any, Callable

IDENTITY_NAMESPACE = "identity"


def get_property_user_key_builder(
    func: Callable[..., Any],
    *args: Any,
    **kwargs: Any,
) -> str:
    property_id = str(kwargs.get("property_id"))
    user_id = str(kwargs.get("user_id"))
    return f"property:{property_id}:users:{user_id}"
