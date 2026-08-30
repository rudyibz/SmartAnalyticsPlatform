import asyncio
import websockets

async def main():
    url = "ws://127.0.0.1:8010/ws/market/GOLD"

    print("CONEXIÓN:", url)

    try:
        async with websockets.connect(url) as ws:
            print("CONECTADO")

            for i in range(3):
                message = await ws.recv()
                print("MENSAJE:", message)

    except Exception as exc:
        print("ERROR:", type(exc).__name__)
        print("DETALLE:", exc)

asyncio.run(main())
