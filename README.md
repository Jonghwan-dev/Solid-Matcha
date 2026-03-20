# 🍵 Solid-Matcha

> **Based on**: [dw-dengwei/daily-arXiv-ai-enhanced](https://github.com/dw-dengwei/daily-arXiv-ai-enhanced)
> **Maintained by**: Jonghwan Kim — National Cancer Center, Korea
> **#modified by JH(2026.03.20)** — rebranded, Groq integration, bug fixes, Slack bot

[English](#english) | [Korean](#korean)

---

## <a name="english"></a>English

### 📖 Overview

**Solid-Matcha** is a serverless daily arXiv paper tracker powered by Groq AI.
Built entirely on GitHub Actions and Pages — zero infrastructure, completely free.

### ✨ Key Features

🎯 **Zero Infrastructure**
- GitHub Actions (compute) + GitHub Pages (hosting) + data branch (storage)
- No server, no database, no cost

🤖 **AI Summarization via Groq (Free)**
- Daily paper crawling with structured AI summaries
- 5-field output: TL;DR / Motivation / Method / Result / Conclusion
- Powered by `llama-3.3-70b-versatile` on Groq free tier

💫 **Smart Reading Experience**
- Personalized keyword & author filtering
- Calendar navigation (only dates with data are enabled)
- Real-time text search across all fields
- Statistics page with word cloud and charts

🔔 **Slack Notifications**
- Daily success/failure alerts via Slack webhook
- One-click link to the paper viewer

👉 **[Open Solid-Matcha](https://jonghwan-dev.github.io/Solid-Matcha/)** — No installation required

---

### 🚀 Quick Start

#### Prerequisites
- GitHub account
- [Groq API key](https://console.groq.com/keys) (free)
- Slack webhook URL (optional)

#### Setup

1. **Fork this repository**

2. **Secrets** (Settings → Secrets and variables → Actions → Secrets)

| Name | Value |
|------|-------|
| `OPENAI_API_KEY` | Groq API key (`gsk_...`) |
| `OPENAI_BASE_URL` | `https://api.groq.com/openai/v1` |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL (optional) |
| `TOKEN_GITHUB` | GitHub PAT — for code star counts (optional) |
| `ACCESS_PASSWORD` | Page password (optional) |

3. **Variables** (same page, Variables tab)

| Name | Value |
|------|-------|
| `MODEL_NAME` | `llama-3.3-70b-versatile` |
| `LANGUAGE` | `English` |
| `CATEGORIES` | `cs.CV, cs.CL` |
| `EMAIL` | your git commit email |
| `NAME` | your name |

4. **Enable GitHub Actions**
   - Actions tab → Enable workflows
   - Click **Run workflow** to trigger manually
   - Runs automatically every day at **07:00 KST (22:00 UTC)**

5. **Enable GitHub Pages**
   - Settings → Pages → Source: `main` branch, `/ (root)`
   - Visit: `https://<username>.github.io/Solid-Matcha/`

---

### 📋 Supported ArXiv Categories

`cs.AI` · `cs.CL` · `cs.CV` · `cs.LG` · `cs.RO` · and many more
→ [Full list](https://arxiv.org/category_taxonomy)

### ⏱️ Schedule

```yaml
# .github/workflows/run.yml
- cron: "0 22 * * *"   # 07:00 KST daily
```
Fetches the previous day's arXiv announcement batch.

### 🛠️ Local Development

```bash
export OPENAI_API_KEY="gsk_..."
export OPENAI_BASE_URL="https://api.groq.com/openai/v1"
export LANGUAGE="English"
export CATEGORIES="cs.CV, cs.CL"
export MODEL_NAME="llama-3.3-70b-versatile"
./run.sh
```

### 📊 Project Structure

```
├── .github/workflows/run.yml   # GitHub Actions workflow
├── daily_arxiv/                # Scrapy crawler
├── ai/                         # Groq AI summarization
├── to_md/                      # Markdown conversion
├── js/                         # Frontend JavaScript
├── css/                        # Stylesheets
├── index.html                  # Main page
├── statistic.html              # Statistics page
├── settings.html               # Settings page
└── login.html                  # Auth page (optional)
```

---

## <a name="korean"></a>Korean

### 📖 개요

**Solid-Matcha**는 Groq AI 기반 서버리스 arXiv 논문 트래커입니다.
GitHub Actions + Pages만으로 운영 — 인프라 불필요, 완전 무료.

### ✨ 주요 기능

🎯 **인프라 불필요**
- GitHub Actions (연산) + GitHub Pages (호스팅) + data 브랜치 (저장)
- 서버·DB·비용 전부 없음

🤖 **Groq 무료 AI 요약**
- 일일 논문 크롤링 + 구조화된 AI 요약
- 5개 필드: TL;DR / 동기 / 방법 / 결과 / 결론
- `llama-3.3-70b-versatile` (Groq 무료 티어)

💫 **스마트 읽기 환경**
- 키워드·저자 기반 맞춤 필터링
- 캘린더 탐색 (데이터 있는 날짜만 활성화)
- 전 필드 실시간 텍스트 검색
- 통계 페이지 (워드클라우드·차트)

🔔 **Slack 알림**
- 매일 성공/실패 알림 (Slack 웹훅)
- 버튼 한 번으로 논문 뷰어 접속

👉 **[Solid-Matcha 열기](https://jonghwan-dev.github.io/Solid-Matcha/)** — 설치 불필요

---

### 🚀 빠른 시작

#### 사전 요구사항
- GitHub 계정
- [Groq API 키](https://console.groq.com/keys) (무료)
- Slack 웹훅 URL (선택)

#### 설정

1. **이 저장소 Fork**

2. **Secrets** (Settings → Secrets and variables → Actions → Secrets)

| 이름 | 값 |
|------|-----|
| `OPENAI_API_KEY` | Groq API 키 (`gsk_...`) |
| `OPENAI_BASE_URL` | `https://api.groq.com/openai/v1` |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL (선택) |
| `TOKEN_GITHUB` | GitHub PAT — 논문 GitHub star 수 표시용 (선택) |
| `ACCESS_PASSWORD` | 페이지 비밀번호 (선택) |

3. **Variables** (같은 페이지, Variables 탭)

| 이름 | 값 |
|------|-----|
| `MODEL_NAME` | `llama-3.3-70b-versatile` |
| `LANGUAGE` | `English` |
| `CATEGORIES` | `cs.CV, cs.CL` |
| `EMAIL` | git 커밋용 이메일 |
| `NAME` | 이름 |

4. **GitHub Actions 활성화**
   - Actions 탭 → 워크플로우 활성화
   - **Run workflow** 클릭으로 수동 실행
   - 매일 **오전 7시 KST (22:00 UTC)** 자동 실행

5. **GitHub Pages 활성화**
   - Settings → Pages → Source: `main` 브랜치, `/ (root)`
   - 방문: `https://<username>.github.io/Solid-Matcha/`

---

### ⏱️ 스케줄

```yaml
- cron: "0 22 * * *"   # 매일 KST 07:00
```
전날 arXiv 공지 배치를 가져옵니다 (평일 기준).

### 🛠️ 로컬 개발

```bash
export OPENAI_API_KEY="gsk_..."
export OPENAI_BASE_URL="https://api.groq.com/openai/v1"
export LANGUAGE="English"
export CATEGORIES="cs.CV, cs.CL"
export MODEL_NAME="llama-3.3-70b-versatile"
./run.sh
```

---

## 📜 License

Apache License 2.0 — See [LICENSE](LICENSE) for details

## 🙏 Based on

[dw-dengwei/daily-arXiv-ai-enhanced](https://github.com/dw-dengwei/daily-arXiv-ai-enhanced) — Original project by Wei Deng & Jian Guan
