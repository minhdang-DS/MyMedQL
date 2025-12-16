"""
Load testing script for API endpoints
"""
import asyncio
import time
import statistics
from typing import List, Dict, Any
import httpx


async def test_endpoint(
    client: httpx.AsyncClient,
    url: str,
    method: str = "GET",
    params: Dict[str, Any] = None,
    json_data: Dict[str, Any] = None
) -> tuple[float, int]:
    """
    Test a single endpoint request and return response time and status code.
    
    Args:
        client: HTTP client
        url: Endpoint URL
        method: HTTP method
        params: Query parameters
        json_data: JSON body data
        
    Returns:
        Tuple of (response_time_seconds, status_code)
    """
    start = time.time()
    try:
        if method == "GET":
            response = await client.get(url, params=params)
        elif method == "POST":
            response = await client.post(url, json=json_data, params=params)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        elapsed = time.time() - start
        return elapsed, response.status_code
    except Exception as e:
        elapsed = time.time() - start
        print(f"Error testing {url}: {e}")
        return elapsed, 0


async def run_load_test(
    base_url: str,
    endpoint: str,
    num_requests: int = 100,
    concurrency: int = 10,
    method: str = "GET",
    params: Dict[str, Any] = None,
    json_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Run a load test on an endpoint.
    
    Args:
        base_url: Base API URL (e.g., "http://localhost:3001")
        endpoint: Endpoint path (e.g., "/api/patients/1/history")
        num_requests: Total number of requests to make
        concurrency: Number of concurrent requests
        method: HTTP method
        params: Query parameters
        json_data: JSON body data
        
    Returns:
        Dictionary with test results
    """
    url = f"{base_url}{endpoint}"
    
    print(f"🚀 Starting load test...")
    print(f"   URL: {url}")
    print(f"   Requests: {num_requests}")
    print(f"   Concurrency: {concurrency}")
    print(f"   Method: {method}")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Create semaphore to limit concurrency
        semaphore = asyncio.Semaphore(concurrency)
        
        async def make_request():
            async with semaphore:
                return await test_endpoint(client, url, method, params, json_data)
        
        # Run all requests
        start_time = time.time()
        tasks = [make_request() for _ in range(num_requests)]
        results = await asyncio.gather(*tasks)
        total_time = time.time() - start_time
        
        # Analyze results
        response_times = [r[0] for r in results]
        status_codes = [r[1] for r in results]
        
        successful = sum(1 for code in status_codes if 200 <= code < 300)
        failed = num_requests - successful
        
        return {
            "url": url,
            "total_requests": num_requests,
            "successful": successful,
            "failed": failed,
            "total_time": total_time,
            "requests_per_second": num_requests / total_time if total_time > 0 else 0,
            "response_times": {
                "min": min(response_times) if response_times else 0,
                "max": max(response_times) if response_times else 0,
                "mean": statistics.mean(response_times) if response_times else 0,
                "median": statistics.median(response_times) if response_times else 0,
                "p95": statistics.quantiles(response_times, n=20)[18] if len(response_times) >= 20 else max(response_times) if response_times else 0,
                "p99": statistics.quantiles(response_times, n=100)[98] if len(response_times) >= 100 else max(response_times) if response_times else 0,
            },
            "status_codes": {
                code: status_codes.count(code) for code in set(status_codes)
            }
        }


def print_results(results: Dict[str, Any]):
    """Print load test results in a readable format."""
    print("\n" + "="*60)
    print("LOAD TEST RESULTS")
    print("="*60)
    print(f"URL: {results['url']}")
    print(f"Total Requests: {results['total_requests']}")
    print(f"Successful: {results['successful']}")
    print(f"Failed: {results['failed']}")
    print(f"Total Time: {results['total_time']:.2f} seconds")
    print(f"Requests/Second: {results['requests_per_second']:.2f}")
    print("\nResponse Times (seconds):")
    rt = results['response_times']
    print(f"  Min:    {rt['min']:.4f}")
    print(f"  Max:    {rt['max']:.4f}")
    print(f"  Mean:   {rt['mean']:.4f}")
    print(f"  Median: {rt['median']:.4f}")
    print(f"  P95:    {rt['p95']:.4f}")
    print(f"  P99:    {rt['p99']:.4f}")
    print("\nStatus Codes:")
    for code, count in results['status_codes'].items():
        print(f"  {code}: {count}")
    print("="*60)


async def main():
    """Main load test function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Load test API endpoints")
    parser.add_argument(
        "--url",
        type=str,
        default="http://localhost:3001",
        help="Base API URL"
    )
    parser.add_argument(
        "--endpoint",
        type=str,
        default="/api/patients/1/history",
        help="Endpoint to test"
    )
    parser.add_argument(
        "--requests",
        type=int,
        default=100,
        help="Number of requests"
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=10,
        help="Number of concurrent requests"
    )
    
    args = parser.parse_args()
    
    results = await run_load_test(
        base_url=args.url,
        endpoint=args.endpoint,
        num_requests=args.requests,
        concurrency=args.concurrency
    )
    
    print_results(results)


if __name__ == "__main__":
    asyncio.run(main())

