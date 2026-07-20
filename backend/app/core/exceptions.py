"""
Excepciones personalizadas de SmartAnalyticsPlatform.
"""


class SmartAnalyticsException(Exception):
    """
    Excepción base del proyecto.
    """

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class UserAlreadyExistsError(SmartAnalyticsException):
    """
    El usuario ya existe.
    """
    pass


class UserNotFoundError(SmartAnalyticsException):
    """
    Usuario no encontrado.
    """
    pass


class InvalidCredentialsError(SmartAnalyticsException):
    """
    Credenciales inválidas.
    """
    pass


class PermissionDeniedError(SmartAnalyticsException):
    """
    Permisos insuficientes.
    """
    pass