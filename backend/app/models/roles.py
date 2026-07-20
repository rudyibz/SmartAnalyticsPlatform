from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    ANALYST = "analyst"
    TRADER = "trader"
    PREMIUM = "premium"