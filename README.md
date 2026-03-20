# 🌿 Solid Matcha (Daily-ArXiv-Tool)

> **Original Project**: [dw-dengwei/daily-arXiv-ai-enhanced](https://github.com/dw-dengwei/daily-arXiv-ai-enhanced)  
> **Modified by**: Jonghwan Kim (2026-01-30) / **Affiliation**: National Cancer Center, Korea

[English](#english) | [Korean](#korean)

---

## <a name="english"></a>English

### 📖 Overview

This tool transforms how you stay updated with arXiv papers by combining automated crawling with AI-powered summarization.  
Built on GitHub Actions and Pages, it requires zero infrastructure and is completely free to use.  

### ✨ Key Features

🎯 **Zero Infrastructure Required**
- Leverages GitHub Actions and Pages - no server needed
- Completely free to deploy and use

🤖 **Smart AI Summarization**
- Daily paper crawling with AI-powered summaries
- Cost-effective: Only ~$0.03 USD per day (Deepseek)
- Supports multiple LLM providers (OpenAI, DeepSeek, Groq, etc.)

💫 **Smart Reading Experience**
- Personalized paper highlighting based on your interests
- Cross-device compatibility (desktop & mobile)
- Local preference storage for privacy
- Flexible date range filtering
- Multi-language support (English, Chinese)

👉 **[Try it now!](https://jonghwan-dev.github.io/Daily-ArXiv-Tool/)** - No installation required

### 🚀 Quick Start

#### Prerequisites
- GitHub account
- OpenAI API key (or compatible API like DeepSeek)

#### Setup Instructions

1. **Fork this repository** to your own GitHub account

2. **Configure Secrets** (Settings → Secrets and variables → Actions → Secrets)
   - `OPENAI_API_KEY`: Your OpenAI-compatible API key
   - `OPENAI_BASE_URL`: API base URL (e.g., `https://api.openai.com/v1`)
   - `ACCESS_PASSWORD` (Optional): Set a password to protect your page

3. **Configure Variables** (Settings → Secrets and variables → Actions → Variables)
   - `CATEGORIES`: ArXiv categories to crawl (e.g., `"cs.CV, cs.CL, cs.AI"`)
   - `LANGUAGE`: Summary language (`"English"` or `"Chinese"`)
   - `MODEL_NAME`: LLM model to use (e.g., `"gpt-4o-mini"`, `"deepseek-chat"`)
   - `EMAIL`: Your email for Git commits
   - `NAME`: Your name for Git commits

4. **Enable GitHub Actions**
   - Go to Actions tab → Enable workflows
   - Click "Run workflow" to test (takes ~30-60 minutes)
   - By default, runs daily at 6:00 AM KST (21:00 UTC)

5. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `main`, folder: `/(root)`
   - Wait a few minutes, then visit: `https://<username>.github.io/Daily-ArXiv-Tool/`

### 📝 Configuration Details

#### Supported ArXiv Categories
- `cs.AI` - Artificial Intelligence
- `cs.CL` - Computation and Language
- `cs.CV` - Computer Vision
- `cs.LG` - Machine Learning
- `cs.RO` - Robotics
- And many more... (see [arXiv categories](https://arxiv.org/category_taxonomy))

#### Supported LLM Providers
- OpenAI (GPT-4, GPT-3.5)
- DeepSeek
- Any OpenAI-compatible API

#### Schedule Customization
Edit `.github/workflows/run.yml` to change the crawling schedule:
```yaml
schedule:
  - cron: "0 21 * * *"  # 6:00 AM KST (21:00 UTC previous day)
```

### 🛠️ Local Development

Run `./run.sh` for local testing. Set environment variables:
```bash
export OPENAI_API_KEY="your-api-key"
export OPENAI_BASE_URL="https://api.openai.com/v1"
export LANGUAGE="English"
export CATEGORIES="cs.CV, cs.CL"
export MODEL_NAME="gpt-4o-mini"
```

### 📊 Project Structure

```
├── .github/workflows/run.yml  # GitHub Actions workflow
├── daily_arxiv/               # Paper crawling scripts
├── ai/                        # AI enhancement scripts
├── to_md/                     # Markdown conversion
├── js/                        # Frontend JavaScript
├── css/                       # Stylesheets
├── index.html                 # Main page
├── statistic.html             # Statistics page
└── settings.html              # Settings page
```

---

## <a name="korean"></a>Korean

### 📖 개요

이 도구는 자동화된 크롤링과 AI 기반 요약을 결합하여 arXiv 논문을 최신 상태로 유지하는 방식을 혁신합니다.  
GitHub Actions와 Pages를 기반으로 구축되어 인프라가 필요 없으며 완전히 무료로 사용할 수 있습니다.  

### ✨ 주요 기능

🎯 **인프라 불필요**
- GitHub Actions와 Pages 활용 - 서버 불필요
- 완전 무료 배포 및 사용

🤖 **스마트 AI 요약**
- AI 기반 요약을 통한 일일 논문 크롤링
- 비용 효율적: 하루 약 40원 (Deep Seek 사용시)
- 다양한 LLM 제공업체 지원 (OpenAI, DeepSeek, groq(무료) 등)

💫 **스마트 읽기 경험**
- 관심사 기반 맞춤형 논문 하이라이팅
- 크로스 디바이스 호환성 (데스크톱 및 모바일)
- 프라이버시를 위한 로컬 설정 저장
- 유연한 날짜 범위 필터링
- 다국어 지원 (영어, 중국어, 한국어)

👉 **[지금 사용해보세요!](https://jonghwan-dev.github.io/Daily-ArXiv-Tool/)** - 설치 불필요

### 🚀 빠른 시작

#### 사전 요구사항
- GitHub 계정
- OpenAI API 키 (또는 DeepSeek 같은 호환 API)

#### 설정 방법

1. **이 저장소를 포크**하여 자신의 GitHub 계정으로 가져오기

2. **Secrets 설정** (Settings → Secrets and variables → Actions → Secrets)
   - `OPENAI_API_KEY`: OpenAI 호환 API 키
   - `OPENAI_BASE_URL`: API 기본 URL (예: `https://api.openai.com/v1`)
   - `ACCESS_PASSWORD` (선택사항): 페이지 보호를 위한 비밀번호 설정

3. **Variables 설정** (Settings → Secrets and variables → Actions → Variables)
   - `CATEGORIES`: 크롤링할 ArXiv 카테고리 (예: `"cs.CV, cs.CL, cs.AI"`)
   - `LANGUAGE`: 요약 언어 (`"English"` 또는 `"Chinese"`)
   - `MODEL_NAME`: 사용할 LLM 모델 (예: `"gpt-4o-mini"`, `"deepseek-chat"`)
   - `EMAIL`: Git 커밋용 이메일
   - `NAME`: Git 커밋용 이름

4. **GitHub Actions 활성화**
   - Actions 탭으로 이동 → 워크플로우 활성화
   - "Run workflow" 클릭하여 테스트 (약 30-60분 소요)
   - 기본적으로 매일 오전 6시(KST)에 실행됨

5. **GitHub Pages 활성화**
   - Settings → Pages로 이동
   - Source: "Deploy from a branch"
   - Branch: `main`, folder: `/(root)`
   - 몇 분 기다린 후 방문: `https://<username>.github.io/Daily-ArXiv-Tool/`

### 📝 설정 세부사항

#### 지원되는 ArXiv 카테고리
- `cs.AI` - 인공지능
- `cs.CL` - 계산 및 언어
- `cs.CV` - 컴퓨터 비전
- `cs.LG` - 머신러닝
- `cs.RO` - 로봇공학
- 그 외 다수... ([arXiv 카테고리](https://arxiv.org/category_taxonomy) 참조)

#### 지원되는 LLM 제공업체
- OpenAI (GPT-4, GPT-3.5)
- DeepSeek
- OpenAI 호환 API

#### 스케줄 커스터마이징
`.github/workflows/run.yml` 파일을 편집하여 크롤링 스케줄 변경:
```yaml
schedule:
  - cron: "0 21 * * *"  # 오전 6시 KST (전날 21:00 UTC)
```

### 🛠️ 로컬 개발

로컬 테스트를 위해 `./run.sh` 실행. 환경 변수 설정:
```bash
export OPENAI_API_KEY="your-api-key"
export OPENAI_BASE_URL="https://api.openai.com/v1"
export LANGUAGE="English"
export CATEGORIES="cs.CV, cs.CL"
export MODEL_NAME="gpt-4o-mini"
```

### 📊 프로젝트 구조

```
├── .github/workflows/run.yml  # GitHub Actions 워크플로우
├── daily_arxiv/               # 논문 크롤링 스크립트
├── ai/                        # AI 향상 스크립트
├── to_md/                     # Markdown 변환
├── js/                        # 프론트엔드 JavaScript
├── css/                       # 스타일시트
├── index.html                 # 메인 페이지
├── statistic.html             # 통계 페이지
└── settings.html              # 설정 페이지
```

---

## 📜 License

Apache License(Modified) 2.0 - See [LICENSE](LICENSE) for details

## 🙏 Original Project

**Original Repository**: [dw-dengwei/daily-arXiv-ai-enhanced](https://github.com/dw-dengwei/daily-arXiv-ai-enhanced)

This is a modified version with the following changes:
- Korean language support (commented out for future use)
- English translations throughout
- Schedule adjusted to 6 AM KST

Planning : add slack bot

## 👥 Original Repo's Contributors

Thanks to the original project contributors for their amazing work:
<table>
  <tbody>
    <tr>
      <td align="center" valign="top">
        <a href="https://github.com/JianGuanTHU"><img src="https://avatars.githubusercontent.com/u/44895708?v=4" width="100px;" alt="JianGuanTHU"/><br /><sub><b>JianGuanTHU</b></sub></a><br />
      </td>
      <td align="center" valign="top">
        <a href="https://github.com/Chi-hong22"><img src="https://avatars.githubusercontent.com/u/75403952?v=4" width="100px;" alt="Chi-hong22"/><br /><sub><b>Chi-hong22</b></sub></a><br />
      </td>
      <td align="center" valign="top">
        <a href="https://github.com/chaozg"><img src="https://avatars.githubusercontent.com/u/69794131?v=4" width="100px;" alt="chaozg"/><br /><sub><b>chaozg</b></sub></a><br />
      </td>
      <td align="center" valign="top">
        <a href="https://github.com/quantum-ctrl"><img src="https://avatars.githubusercontent.com/u/16505311?v=4" width="100px;" alt="quantum-ctrl"/><br /><sub><b>quantum-ctrl</b></sub></a><br />
      </td>
      <td align="center" valign="top">
        <a href="https://github.com/Zhao2z"><img src="https://avatars.githubusercontent.com/u/141019403?v=4" width="100px;" alt="Zhao2z"/><br /><sub><b>Zhao2z</b></sub></a><br />
      </td>
      <td align="center" valign="top">
        <a href="https://github.com/eclipse0922"><img src="https://avatars.githubusercontent.com/u/6214316?v=4" width="100px;" alt="eclipse0922"/><br /><sub><b>eclipse0922</b></sub></a><br />
      </td>
    </tr>


  </tbody>
  <tbody>
   <tr>
      <td align="center" valign="top">
        <a href="https://github.com/xuemian168"><img src="https://avatars.githubusercontent.com/u/38741078?v=4" width="100px;" alt="xuemian168"/><br /><sub><b>xuemian168</b></sub></a><br />
      </td>
      <td align="center" valign="top">
        <a href="https://github.com/Lrrrr549"><img src="https://avatars.githubusercontent.com/u/71866027?v=4" width="100px;" alt="Lrrrr549"/><br /><sub><b>Lrrrr549</b></sub></a><br />
      </td>
      <td align="center" valign="top">
        <a href="https://github.com/AinzRimuru"><img src="https://avatars.githubusercontent.com/u/59441476?v=4" width="100px;" alt="AinzRimuru"/><br /><sub><b>AinzRimuru</b></sub></a><br />
      </td>
      <td align="center" valign="top">
        <a href="https://github.com/fengxueguiren"><img src="https://avatars.githubusercontent.com/u/153522370?v=4" width="100px;" alt="fengxueguiren"/><br /><sub><b>fengxueguiren</b></sub></a><br />
      </td>
   </tr>
  </tbody>
</table>

# Acknowledgement
We sincerely thank the following individuals and organizations for their promotion and support!!!
<table>
  <tbody>
    <tr>
      <td align="center" valign="top">
        <a href="https://x.com/GitHub_Daily/status/1930610556731318781"><img src="https://pbs.twimg.com/profile_images/1660876795347111937/EIo6fIr4_400x400.jpg" width="100px;" alt="Github_Daily"/><br /><sub><b>Github_Daily</b></sub></a><br />
      </td>
      <td align="center" valign="top">
        <a href="https://x.com/aigclink/status/1930897858963853746"><img src="https://pbs.twimg.com/profile_images/1729450995850027008/gllXr6bh_400x400.jpg" width="100px;" alt="AIGCLINK"/><br /><sub><b>AIGCLINK</b></sub></a><br />
      </td>
      <td align="center" valign="top">
        <a href="https://www.ruanyifeng.com/blog/2025/06/weekly-issue-353.html"><img src="https://avatars.githubusercontent.com/u/905434" width="100px;" alt="阮一峰的网络日志"/><br /><sub><b>阮一峰的网络日志 <br> 科技爱好者周刊 <br> （第 353 期）</b></sub></a><br />
      </td>
      <td align="center" valign="top">
        <a href="https://hellogithub.com/periodical/volume/111"><img src="https://github.com/user-attachments/assets/eff6b6dd-0323-40c4-9db6-444a51bbc80a" width="100px;" alt="《HelloGitHub》第 111 期"/><br /><sub><b>《HelloGitHub》<br> 月刊第 111 期</b></sub></a><br />
      </td>
    </tr>
  </tbody>
</table>
