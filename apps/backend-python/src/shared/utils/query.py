from typing import Callable, TypeVar, Awaitable, Union, Tuple

T = TypeVar("T")


async def try_except(
    func: Callable[..., Awaitable[T]], *args, **kwargs
) -> Union[Tuple[T, None], Tuple[None, Exception]]:
    try:
        data = await func(*args, **kwargs)
        return data, None
    except Exception as e:
        return None, e
