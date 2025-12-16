import asyncio
import json
import math
import random
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .api_client import APIClient


@dataclass
class ScenarioStep:
    time: int
    hr: int
    spo2: float
    behavior: str


def load_scenario(path: Path) -> list[ScenarioStep]:
    data = json.loads(path.read_text())
    return [ScenarioStep(**step) for step in data["steps"]]


def generate_next_vital(current_val: float, target_val: float, noise_level: float = 2.0):
    step = (target_val - current_val) * 0.1
    jitter = random.uniform(-noise_level, noise_level)
    return current_val + step + jitter


class DeviceSimulator:
    def __init__(self, config: dict[str, Any]):
        self.backend_url = config["backend_url"]
        self.patient_id = config["patient_id"]
        self.sensor_id = config["sensor_id"]
        self.send_interval = float(config.get("send_interval_seconds", 1))
        scenario_path = Path(config["scenario_file"])
        self.scenario_steps = load_scenario(scenario_path)
        seed = config.get("seed")
        if seed is not None:
            random.seed(seed)
        self.client = APIClient(self.backend_url)

    async def run(self):
        current_hr = self.scenario_steps[0].hr
        current_spo2 = self.scenario_steps[0].spo2
        current_step_idx = 0
        start = datetime.now(timezone.utc)

        while current_step_idx < len(self.scenario_steps):
            step = self.scenario_steps[current_step_idx]
            target_hr = step.hr
            target_spo2 = step.spo2

            current_hr = generate_next_vital(current_hr, target_hr)
            current_spo2 = generate_next_vital(current_spo2, target_spo2, noise_level=1)

            payload = [
                {
                    "patient_id": self.patient_id,
                    "sensor_id": self.sensor_id,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "heart_rate": int(math.floor(current_hr)),
                    "spo2": max(0, min(100, round(current_spo2, 1))),
                    "systolic_bp": 120,
                    "diastolic_bp": 80,
                    "body_temp": 98.6,
                }
            ]

            await self.client.send_vitals(payload)
            await asyncio.sleep(self.send_interval)

            elapsed = (datetime.now(timezone.utc) - start).total_seconds()
            if (
                current_step_idx + 1 < len(self.scenario_steps)
                and elapsed >= self.scenario_steps[current_step_idx + 1].time
            ):
                current_step_idx += 1


def load_config() -> dict[str, Any]:
    config_path = Path(__file__).resolve().parent.parent / "config.json"
    return json.loads(config_path.read_text())


if __name__ == "__main__":
    config = load_config()
    simulator = DeviceSimulator(config)
    asyncio.run(simulator.run())
import asyncio
import json
from pathlib import Path
from typing import List, Optional

from pydantic import BaseModel, Field

from .api_client import ApiClient


class VitalFrame(BaseModel):
    heart_rate: float = Field(..., ge=0)
    spo2: float = Field(..., ge=0, le=100)
    respiratory_rate: Optional[float] = Field(default=None, ge=0)
    systolic_bp: Optional[float] = Field(default=None, ge=0)
    diastolic_bp: Optional[float] = Field(default=None, ge=0)


class Scenario(BaseModel):
    patient_id: int
    interval_seconds: float = Field(default=1.0, gt=0)
    frames: List[VitalFrame]


async def run_scenario(path: Path) -> None:
    data = json.loads(path.read_text())
    scenario = Scenario(**data)

    client = ApiClient()
    for frame in scenario.frames:
        payload = frame.model_dump()
        payload["patient_id"] = scenario.patient_id
        response = await client.post_vital(payload)
        print(f"[{path.name}] status={response.status_code} body={response.text}")
        await asyncio.sleep(scenario.interval_seconds)

    await client.close()


async def main() -> None:
    scenarios_dir = Path(__file__).parent / "scenarios"
    scenario_files = list(scenarios_dir.glob("*.json"))
    if not scenario_files:
        print("No scenario files found.")
        return

    await asyncio.gather(*(run_scenario(path) for path in scenario_files))


if __name__ == "__main__":
    asyncio.run(main())



