import asyncio
import websockets


import pytest


@pytest.mark.asyncio
async def test_websocket():

    url = "ws://127.0.0.1:8010/ws/market/AAPL"

    print("=" * 60)
    print("TEST WEBSOCKET")
    print("=" * 60)
    print(f"URL: {url}")
    print()

    try:

        async with websockets.connect(url) as websocket:

            print("WS CONNECTED")
            print("Esperando datos...")
            print()

            for i in range(3):

                message = await websocket.recv()

                print(f"Mensaje {i + 1}:")
                print(message)
                print()

            print("WebSocket funcionando correctamente.")

    except Exception as exc:

        print()
        print("ERROR WEBSOCKET")
        print(type(exc).__name__)
        print(str(exc))


if __name__ == "__main__":

    asyncio.run(test_websocket())