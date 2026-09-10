from __future__ import annotations

from math import isfinite


def calculate_risk_management(
    capital: float,
    risk_percent: float,
    entry: float,
    stop_loss: float,
    take_profit: float,
    quantity: float | None = None,
):
    capital = float(capital)
    risk_percent = float(risk_percent)
    entry = float(entry)
    stop_loss = float(stop_loss)
    take_profit = float(take_profit)

    if capital <= 0:
        raise ValueError(
            "Capital must be greater than 0"
        )

    if risk_percent <= 0:
        raise ValueError(
            "Risk percent must be greater than 0"
        )

    if risk_percent > 100:
        raise ValueError(
            "Risk percent cannot exceed 100"
        )

    if entry <= 0:
        raise ValueError(
            "Entry must be greater than 0"
        )

    if stop_loss <= 0:
        raise ValueError(
            "Stop loss must be greater than 0"
        )

    if take_profit <= 0:
        raise ValueError(
            "Take profit must be greater than 0"
        )

    if entry == stop_loss:
        raise ValueError(
            "Entry and stop loss cannot be equal"
        )

    risk_per_unit = abs(
        entry - stop_loss
    )

    reward_per_unit = abs(
        take_profit - entry
    )

    risk_amount = (
        capital * risk_percent / 100
    )

    recommended_quantity = (
        risk_amount / risk_per_unit
    )

    position_quantity = (
        float(quantity)
        if quantity is not None
        else recommended_quantity
    )

    if position_quantity <= 0:
        raise ValueError(
            "Quantity must be greater than 0"
        )

    actual_risk = (
        risk_per_unit *
        position_quantity
    )

    potential_profit = (
        reward_per_unit *
        position_quantity
    )

    position_value = (
        entry *
        position_quantity
    )

    actual_risk_percent = (
        actual_risk / capital * 100
    )

    risk_reward = (
        reward_per_unit / risk_per_unit
        if risk_per_unit > 0
        else None
    )

    max_loss = actual_risk

    result = {
        "capital": round(
            capital,
            2,
        ),
        "risk_percent": round(
            risk_percent,
            2,
        ),
        "risk_amount": round(
            risk_amount,
            2,
        ),
        "entry": round(
            entry,
            4,
        ),
        "stop_loss": round(
            stop_loss,
            4,
        ),
        "take_profit": round(
            take_profit,
            4,
        ),
        "risk_per_unit": round(
            risk_per_unit,
            4,
        ),
        "reward_per_unit": round(
            reward_per_unit,
            4,
        ),
        "recommended_quantity": round(
            recommended_quantity,
            4,
        ),
        "quantity": round(
            position_quantity,
            4,
        ),
        "position_value": round(
            position_value,
            2,
        ),
        "actual_risk": round(
            actual_risk,
            2,
        ),
        "actual_risk_percent": round(
            actual_risk_percent,
            2,
        ),
        "max_loss": round(
            max_loss,
            2,
        ),
        "potential_profit": round(
            potential_profit,
            2,
        ),
        "risk_reward": (
            round(risk_reward, 2)
            if risk_reward is not None
            else None
        ),
    }

    for key, value in result.items():

        if isinstance(
            value,
            float,
        ) and not isfinite(value):

            raise ValueError(
                f"Invalid numeric result: {key}"
            )

    return result