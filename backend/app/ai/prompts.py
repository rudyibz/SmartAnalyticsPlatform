def build_prompt(data: dict):

    return f"""
Actúa como un analista financiero profesional.

Símbolo:

{data["symbol"]}

Precio:

{data["price"]}

Score:

{data["score"]}

Señal:

{data["signal"]}

Indicadores:

{data["indicators"]}

Genera:

1. Resumen técnico

2. Riesgos

3. Oportunidades

4. Tendencia

5. Conclusión
"""