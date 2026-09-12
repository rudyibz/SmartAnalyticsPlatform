import asyncio
import websockets


async def test():
    ws = await websockets.connect(
        "ws://127.0.0.1:8010/ws/market/GOLD"
    )

    try:
        message = await ws.recv()
        print(message)
    finally:
        await ws.close()


if __name__ == "__main__":
    asyncio.run(test())