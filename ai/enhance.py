import os
import json
import sys
import time
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict
from queue import Queue
from threading import Lock
# INSERT_YOUR_CODE
import requests

import dotenv
import argparse
from tqdm import tqdm

import langchain_core.exceptions
from langchain_openai import ChatOpenAI
from langchain.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from structure import Structure

if os.path.exists('.env'):
    dotenv.load_dotenv()
template = open("template.txt", "r").read()
system = open("system.txt", "r").read()

def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, required=True, help="jsonline data file")
    parser.add_argument("--max_workers", type=int, default=1, help="Maximum number of parallel workers")
    return parser.parse_args()

def process_single_item(chain, item: Dict, language: str) -> Dict:
    def is_sensitive(content: str) -> bool:
        """
        Check if content contains sensitive words by calling the spam.dw-dengwei.workers.dev API.
        Returns True if sensitive words are detected, False otherwise.
        """
        try:
            resp = requests.post(
                "https://spam.dw-dengwei.workers.dev",
                json={"text": content},
                timeout=5
            )
            if resp.status_code == 200:
                result = resp.json()
                return result.get("sensitive", False)
            else:
                # Modified by JH 2026-03-20: fail-open on API error
                # Previously returned True (drop paper) on any HTTP error,
                # causing all papers to be silently removed when the API was down.
                print(f"Sensitive check HTTP {resp.status_code}, skipping filter", file=sys.stderr)
                return False
        except Exception as e:
            # Modified by JH 2026-03-20: fail-open — API unreachable does NOT drop papers
            print(f"Sensitive check unreachable, skipping filter: {e}", file=sys.stderr)
            return False

    def check_github_code(content: str) -> Dict:
        """Extract and validate GitHub links"""
        code_info = {}

        # 1. Prioritize matching github.com/owner/repo format
        github_pattern = r"https?://github\.com/([a-zA-Z0-9-_]+)/([a-zA-Z0-9-_\.]+)"
        match = re.search(github_pattern, content)
        
        if match:
            owner, repo = match.groups()
            # Clean repository name: remove .git suffix and trailing punctuation
            repo = repo.rstrip(".git").rstrip(".,)")
            
            full_url = f"https://github.com/{owner}/{repo}"
            code_info["code_url"] = full_url
            
            # Attempt to call GitHub API to get information
            github_token = os.environ.get("TOKEN_GITHUB")
            headers = {"Accept": "application/vnd.github.v3+json"}
            if github_token:
                headers["Authorization"] = f"token {github_token}"
            
            try:
                api_url = f"https://api.github.com/repos/{owner}/{repo}"
                resp = requests.get(api_url, headers=headers, timeout=5)
                if resp.status_code == 200:
                    data = resp.json()
                    code_info["code_stars"] = data.get("stargazers_count", 0)
                    code_info["code_last_update"] = data.get("pushed_at", "")[:10]
            except Exception:
                # API call failure does not affect the main flow
                pass
            return code_info

        # 2. If no github.com match, attempt to match github.io
        github_io_pattern = r"https?://[a-zA-Z0-9-_]+\.github\.io(?:/[a-zA-Z0-9-_\.]+)*"
        match_io = re.search(github_io_pattern, content)
        
        if match_io:
            url = match_io.group(0)
            # Clean up trailing punctuation
            url = url.rstrip(".,)")
            code_info["code_url"] = url
            # github.io URLs do not have star/update information
                
        return code_info

    # Check summary field
    if is_sensitive(item.get("summary", "")):
        return None

    # Check code availability
    code_info = check_github_code(item.get("summary", ""))
    if code_info:
        item.update(code_info)

    """Process a single item"""
    # Default structure with meaningful fallback values
    default_ai_fields = {
        "tldr": "Summary generation failed",
        "motivation": "Motivation analysis unavailable",
        "method": "Method extraction failed",
        "result": "Result analysis unavailable",
        "conclusion": "Conclusion extraction failed"
    }
    
    try:
# ==============================================
        # #modified by JH(2026.03.23) - sleep for Groq AI API rate limit only
        # Groq free tier: 30 RPM → theoretical min = 60/30 = 2s per request.
        # sleep(3) = 20 RPM effective (33% headroom). NOT related to crawling.
        # Model: meta-llama/llama-4-scout-17b-16e-instruct (RPM=30, TPM=30K, TPD=500K)
        # ~265 papers × ~800 tokens = ~212K tokens/day → well within 500K TPD.
        time.sleep(3)
# ==============================================
        response: Structure = chain.invoke({
            "language": language,
            "content": item['summary']
        })
        item['AI'] = response.model_dump()
    except langchain_core.exceptions.OutputParserException as e:
        # JSON string 
        error_msg = str(e)
        partial_data = {}
        
        if "Function Structure arguments:" in error_msg:
            try:
                # Extract JSON string
                json_str = error_msg.split("Function Structure arguments:", 1)[1].strip().split('are not valid JSON')[0].strip()
                # Preprocess LaTeX math symbols - use four backslashes to ensure correct escaping
                json_str = json_str.replace('\\', '\\\\')
                # Attempt to parse fixed JSON
                partial_data = json.loads(json_str)
            except Exception as json_e:
                print(f"Failed to parse JSON for {item.get('id', 'unknown')}: {json_e}", file=sys.stderr)
        
        # Merge partial data with defaults to ensure all fields exist
        item['AI'] = {**default_ai_fields, **partial_data}
        print(f"Using partial AI data for {item.get('id', 'unknown')}: {list(partial_data.keys())}", file=sys.stderr)
    except Exception as e:
        # Catch any other exceptions and provide default values
        print(f"Unexpected error for {item.get('id', 'unknown')}: {e}", file=sys.stderr)
        item['AI'] = default_ai_fields
    
    # Final validation to ensure all required fields exist
    for field in default_ai_fields.keys():
        if field not in item['AI']:
            item['AI'][field] = default_ai_fields[field]

    # Check all AI-generated fields
    for v in item.get("AI", {}).values():
        if is_sensitive(str(v)):
            return None
    return item

def process_all_items(data: List[Dict], model_name: str, language: str, max_workers: int) -> List[Dict]:
    """Process all items in parallel"""
    # #modified by JH(2026.03.22) - changed from "function_calling" to "json_schema"
    # "function_calling" breaks on models that output Python-style Structure(...)
    # instead of proper JSON (e.g. kimi-k2-instruct → tool_use_failed 400 error).
    # "json_schema" is widely supported across OpenAI-compatible APIs including Groq.
    llm = ChatOpenAI(model=model_name).with_structured_output(Structure, method="json_schema")
    print('Connect to:', model_name, file=sys.stderr)
    
    prompt_template = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(system),
        HumanMessagePromptTemplate.from_template(template=template)
    ])

    chain = prompt_template | llm
    
    # Use thread pool for parallel processing
    processed_data = [None] * len(data)  # Preallocate result list
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        future_to_idx = {
            executor.submit(process_single_item, chain, item, language): idx
            for idx, item in enumerate(data)
        }
        
        # Use tqdm to show progress
        for future in tqdm(
            as_completed(future_to_idx),
            total=len(data),
            desc="Processing items"
        ):
            idx = future_to_idx[future]
            try:
                result = future.result()
                processed_data[idx] = result
            except Exception as e:
                print(f"Item at index {idx} generated an exception: {e}", file=sys.stderr)
                # Add default AI fields to ensure consistency
                processed_data[idx] = data[idx]
                processed_data[idx]['AI'] = {
                    "tldr": "Processing failed",
                    "motivation": "Processing failed",
                    "method": "Processing failed",
                    "result": "Processing failed",
                    "conclusion": "Processing failed"
                }
    
    return processed_data

def main():
    # Check and delete target file
    args = parse_args()
    model_name = os.environ.get("MODEL_NAME", 'deepseek-chat')
    language = os.environ.get("LANGUAGE", 'Chinese')

    target_file = args.data.replace('.jsonl', f'_AI_enhanced_{language}.jsonl')
    if os.path.exists(target_file):
        os.remove(target_file)
        print(f'Removed existing file: {target_file}', file=sys.stderr)

    # Read data
    data = []
    with open(args.data, "r") as f:
        for line in f:
            data.append(json.loads(line))

    # Deduplicate
    seen_ids = set()
    unique_data = []
    for item in data:
        if item['id'] not in seen_ids:
            seen_ids.add(item['id'])
            unique_data.append(item)

    data = unique_data
    print('Open:', args.data, file=sys.stderr)
    
    # Process all data in parallel
    processed_data = process_all_items(
        data,
        model_name,
        language,
        args.max_workers
    )
    
    # Save results
    with open(target_file, "w") as f:
        for item in processed_data:
            if item is not None:
                f.write(json.dumps(item) + "\n")

if __name__ == "__main__":
    main()
