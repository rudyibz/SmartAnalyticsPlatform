from pydantic import BaseModel


class AlertTrigger(BaseModel):

    current_value: float
