from datetime import datetime, timezone

import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_websocket_receives_alert(client, seeded_patient):
    with client.websocket_connect("/ws") as websocket:
        payload = [
            {
                "patient_id": seeded_patient.patient_id,
                "sensor_id": "sensor-ws",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "heart_rate": 150,
                "spo2": 88.0,
                "systolic_bp": 110,
                "diastolic_bp": 70,
                "body_temp": 98.0,
            }
        ]
        response = client.post("/api/v1/vitals", json=payload)
        assert response.status_code == status.HTTP_202_ACCEPTED

        received_alert = None
        for _ in range(2):
            message = websocket.receive_json()
            if message["type"] == "ALERT_NEW":
                received_alert = message
                break

        assert received_alert is not None
        assert received_alert["data"]["patient_id"] == seeded_patient.patient_id

