import asyncio
import websockets

async def test():
    ws = await websockets.connect("ws://127.0.0.1:8010/ws/market/GOLD")
    data = await ws.recv()
    print("========== WEBSOCKET GOLD ==========")
    print(data)
    await ws.close()

asyncio.run(test())
