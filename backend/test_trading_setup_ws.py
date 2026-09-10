import asyncio
import websockets


async def test():

    ws = await websockets.connect(
        "ws://127.0.0.1:8010/ws/trading-setups"
    )

    message = await ws.recv()

    print(message)

    await ws.close()


asyncio.run(test())
