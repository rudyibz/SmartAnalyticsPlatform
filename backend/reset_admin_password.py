"""
SmartAnalyticsPlatform
Restablecimiento de contraseña del usuario administrador.

USO:
    python backend/reset_admin_password.py

Este script:
1. Busca admin@smartanalytics.com
2. Genera un nuevo hash bcrypt
3. Actualiza únicamente hashed_password
4. Mantiene el resto de los datos del usuario intactos
"""

import sqlite3

from app.core.security import hash_password


# ============================================================
# CONFIGURACIÓN
# ============================================================

DATABASE = r"data\smartanalytics.db"

ADMIN_EMAIL = "admin@smartanalytics.com"

NEW_PASSWORD = "Test1234!"


# ============================================================
# RESET PASSWORD
# ============================================================

def reset_admin_password():

    print("=" * 60)
    print("SmartAnalyticsPlatform")
    print("RESTABLECIMIENTO DE CONTRASEÑA")
    print("=" * 60)

    print()
    print(f"Base de datos : {DATABASE}")
    print(f"Usuario       : {ADMIN_EMAIL}")
    print()

    # --------------------------------------------------------
    # Generar hash compatible con el sistema actual
    # --------------------------------------------------------

    hashed_password = hash_password(
        NEW_PASSWORD
    )

    print("Hash bcrypt generado correctamente.")
    print()

    # --------------------------------------------------------
    # Conectar SQLite
    # --------------------------------------------------------

    connection = sqlite3.connect(
        DATABASE
    )

    cursor = connection.cursor()

    try:

        # ----------------------------------------------------
        # Comprobar que el administrador existe
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT id, email, is_active
            FROM users
            WHERE email = ?
            """,
            (
                ADMIN_EMAIL,
            ),
        )

        user = cursor.fetchone()

        if not user:

            print(
                "ERROR: El usuario administrador no existe."
            )

            return

        user_id, email, is_active = user

        print(
            f"Usuario encontrado: ID={user_id}"
        )

        print(
            f"Email encontrado : {email}"
        )

        print(
            f"Activo            : {is_active}"
        )

        print()

        # ----------------------------------------------------
        # Actualizar únicamente la contraseña
        # ----------------------------------------------------

        cursor.execute(
            """
            UPDATE users
            SET hashed_password = ?
            WHERE id = ?
            """,
            (
                hashed_password,
                user_id,
            ),
        )

        connection.commit()

        # ----------------------------------------------------
        # Comprobar actualización
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT email, hashed_password
            FROM users
            WHERE id = ?
            """,
            (
                user_id,
            ),
        )

        updated_user = cursor.fetchone()

        if not updated_user:

            print(
                "ERROR: No se pudo verificar la actualización."
            )

            return

        updated_email, updated_hash = updated_user

        print("=" * 60)
        print("CONTRASEÑA RESTABLECIDA CORRECTAMENTE")
        print("=" * 60)

        print()
        print(
            f"Email      : {updated_email}"
        )

        print(
            f"Contraseña : {NEW_PASSWORD}"
        )

        print(
            f"Hash       : {updated_hash}"
        )

        print()
        print(
            "La contraseña ha sido almacenada mediante bcrypt."
        )

        print(
            "El resto de los datos del usuario no se han modificado."
        )

        print()

    finally:

        connection.close()


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    reset_admin_password()