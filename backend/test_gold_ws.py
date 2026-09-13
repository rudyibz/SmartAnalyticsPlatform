import asyncio
import websockets


async def run_gold_ws_manual():
    ws = await websockets.connect(
        "ws://127.0.0.1:8010/ws/market/GOLD"
    )

    try:
        message = await ws.recv()
        print(message)
    finally:
        await ws.close()


if __name__ == "__main__":
    asyncio.run(run_gold_ws_manual())

