#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Retry decorator for API calls
"""

import asyncio
import functools
import logging
import random
import time
from typing import Any, Callable, List, Optional, Type, Union

logger = logging.getLogger(__name__)

def async_retry(
    exceptions: Union[Type[Exception], List[Type[Exception]]] = Exception,
    tries: int = 6,
    delay: float = 1,
    max_delay: Optional[float] = 60,
    backoff: float = 2,
    jitter: float = 0.1,
    logger_name: Optional[str] = None
):
    """
    Retry decorator for async functions with exponential backoff.
    
    Args:
        exceptions: The exception(s) to catch and retry on.
        tries: The maximum number of attempts.
        delay: Initial delay between retries in seconds.
        max_delay: Maximum delay between retries in seconds.
        backoff: Backoff multiplier e.g. value of 2 will double the delay each retry.
        jitter: Jitter factor to add randomness to delay.
        logger_name: Logger name for logging retries.
    
    Returns:
        The decorated function.
    """
    if isinstance(exceptions, list):
        exceptions_tuple = tuple(exceptions)
    else:
        exceptions_tuple = (exceptions,)
    
    local_logger = logging.getLogger(logger_name or __name__)
    
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            _tries, _delay = tries, delay
            
            while _tries > 0:
                try:
                    return await func(*args, **kwargs)
                except exceptions_tuple as e:
                    _tries -= 1
                    if _tries == 0:
                        local_logger.error(
                            f"Function {func.__name__} failed after {tries} tries. "
                            f"Exception: {str(e)}"
                        )
                        raise
                    
                    # Calculate next delay with jitter
                    jitter_value = _delay * jitter * random.random()
                    sleep_time = _delay + jitter_value
                    
                    if max_delay is not None:
                        sleep_time = min(sleep_time, max_delay)
                    
                    local_logger.warning(
                        f"Function {func.__name__} failed. "
                        f"Retrying in {sleep_time:.2f} seconds... "
                        f"({tries - _tries}/{tries}) "
                        f"Exception: {str(e)}"
                    )
                    
                    await asyncio.sleep(sleep_time)
                    _delay *= backoff
        
        return wrapper
    
    return decorator

def sync_retry(
    exceptions: Union[Type[Exception], List[Type[Exception]]] = Exception,
    tries: int = 6,
    delay: float = 1,
    max_delay: Optional[float] = 60,
    backoff: float = 2,
    jitter: float = 0.1,
    logger_name: Optional[str] = None
):
    """
    Retry decorator for synchronous functions with exponential backoff.
    
    Args:
        exceptions: The exception(s) to catch and retry on.
        tries: The maximum number of attempts.
        delay: Initial delay between retries in seconds.
        max_delay: Maximum delay between retries in seconds.
        backoff: Backoff multiplier e.g. value of 2 will double the delay each retry.
        jitter: Jitter factor to add randomness to delay.
        logger_name: Logger name for logging retries.
    
    Returns:
        The decorated function.
    """
    if isinstance(exceptions, list):
        exceptions_tuple = tuple(exceptions)
    else:
        exceptions_tuple = (exceptions,)
    
    local_logger = logging.getLogger(logger_name or __name__)
    
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            _tries, _delay = tries, delay
            
            while _tries > 0:
                try:
                    return func(*args, **kwargs)
                except exceptions_tuple as e:
                    _tries -= 1
                    if _tries == 0:
                        local_logger.error(
                            f"Function {func.__name__} failed after {tries} tries. "
                            f"Exception: {str(e)}"
                        )
                        raise
                    
                    # Calculate next delay with jitter
                    jitter_value = _delay * jitter * random.random()
                    sleep_time = _delay + jitter_value
                    
                    if max_delay is not None:
                        sleep_time = min(sleep_time, max_delay)
                    
                    local_logger.warning(
                        f"Function {func.__name__} failed. "
                        f"Retrying in {sleep_time:.2f} seconds... "
                        f"({tries - _tries}/{tries}) "
                        f"Exception: {str(e)}"
                    )
                    
                    time.sleep(sleep_time)
                    _delay *= backoff
        
        return wrapper
    
    return decorator