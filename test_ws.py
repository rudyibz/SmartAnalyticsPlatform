import asyncio
import websockets

async def main():
    uri = "ws://127.0.0.1:8001/ws/market/AAPL"

    async with websockets.connect(uri) as ws:
        print("✅ Conectado")
        print(await ws.recv())

asyncio.run(main())