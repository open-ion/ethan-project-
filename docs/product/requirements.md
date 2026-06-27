# News Digest App Requirements

## 1. Product Decision

AGATHON LABS will build a personal AI news digest app as the next development target.

The app helps Ion understand important news every morning in five minutes without needing to open a new application every day.

## 2. AGATHON LABS Context

This product should follow the AGATHON LABS operating model:

1. Ion is the founder, human user, and final decision-maker.
2. Ethan is Ion's partner AI and the CIO / AGATHON AI Command Center.
3. Ethan coordinates AI employees and specialized divisions.
4. News collection and summarization should primarily involve Nova, Atlas, Sage, Flow, Pulse, and Guard.
5. Ethan consolidates the final digest and reports it to Ion.

The product should not exist to replace human judgment. It should expand Ion's ability to understand the world quickly and make better decisions.

## 3. Purpose

Users should be able to understand the day's most important news in roughly five minutes each morning.

The product should emphasize:

- low-friction daily use;
- reliable collection of important news;
- concise AI summaries;
- personalized categories;
- delivery through channels users already check, especially LINE or Email.

## 4. Target User

### Initial Target

The first version is for individual personal use.

Primary user profile:

- busy professional;
- wants important news but has limited time;
- prefers summaries over opening multiple news apps;
- wants categories matched to personal interests;
- wants delivery in the morning without manual effort.

### Future Target

After the personal MVP, the product may expand into:

- Premium personal users;
- Pro users in specialized industries;
- corporate teams that need shared news intelligence.

## 5. MVP Scope

The MVP should include the minimum set of features needed to validate a daily personalized AI news digest.

### MVP Feature 1: Interest Category Selection

Users can select their interest categories from the following list:

- AI・テクノロジー
- 投資・株式市場
- 医療・看護
- ビジネス・スタートアップ
- 政治・経済
- スポーツ
- 物価・生活

MVP behavior:

- users can select multiple categories;
- the Free plan should eventually be limited to three categories;
- category choices should drive collection, ranking, and summary personalization.

### MVP Feature 2: Scheduled Morning Collection

The system automatically collects news every morning at the user's selected time.

MVP behavior:

- start with one configured delivery time for Ion;
- later support per-user timezone and delivery settings;
- collection should run without the user opening the app;
- failures should be logged and visible to Ethan or the operator.

### MVP Feature 3: AI Digest Format

Ethan should report the daily digest to Ion using this structure:

1. 今日の重要ニュース3〜5本
2. それぞれ一言要約
3. なぜ重要か
4. 忙しい人向けの結論
5. 詳細を読みたい人向けリンク

Each news item should include:

- title;
- source;
- category;
- one-line summary;
- why it matters;
- takeaway for busy readers;
- original article link.

### MVP Feature 4: LINE or Email Delivery

The digest should be delivered through LINE or Email.

MVP recommendation:

1. Start with Email because implementation and testing are usually simpler.
2. Add LINE delivery after the digest content and scheduling flow are stable.

Delivery requirements:

- users should not need to open a new app every morning;
- delivery should be concise and readable on mobile;
- links should allow deeper reading when needed;
- failed delivery should be recorded for troubleshooting.

### MVP Feature 5: Personal Use First

The first release should optimize for Ion and individual users, not teams.

Do not overbuild enterprise features in the MVP. Design the data model so paid plans and organizations can be added later.

## 6. User Experience

### Core Experience

1. User selects interest categories.
2. User selects delivery channel and morning delivery time.
3. Every morning, the system collects relevant news.
4. AI summarizes and ranks the important items.
5. Ethan sends the final digest to the user through LINE or Email.
6. User reads the digest in about five minutes.
7. User opens original links only when more detail is needed.

### Product Feel

The experience should feel like Ethan saying:

> Ion, these are the things worth knowing today. Here is what happened, why it matters, and what you should take away.

### Non-goals for MVP UX

The MVP does not need:

- a full social feed;
- comments;
- complex dashboards;
- team workspaces;
- advanced analytics;
- native mobile apps.

## 7. Screen Structure

The MVP can be built with a small number of screens.

### 7.1 Onboarding / Category Selection

Purpose:

- let the user select interest categories;
- explain that the digest is delivered every morning.

Fields:

- selected categories;
- preferred delivery time;
- delivery channel;
- Email address or LINE connection status.

### 7.2 Settings

Purpose:

- allow the user to update categories, delivery time, and delivery channel.

Fields:

- categories;
- delivery time;
- timezone;
- delivery channel;
- plan status.

### 7.3 Digest Preview

Purpose:

- show the latest generated digest inside the web app;
- help test output before delivery automation is trusted.

Content:

- generated date;
- selected categories;
- top 3-5 stories;
- source links;
- delivery status.

### 7.4 Admin / Operator View

Purpose:

- allow Ethan, Ion, or the operator to inspect scheduled jobs and failures.

MVP content:

- latest collection run;
- latest summarization run;
- latest delivery run;
- errors and retry status.

This can be minimal and private in the first version.

## 8. Data Collection

### Sources

The product should collect news from:

- NewsAPI;
- major media RSS feeds;
- category-specific sources added over time.

### Collection Requirements

- collect articles by category;
- avoid duplicate stories where possible;
- preserve original source links;
- store source name, title, URL, published time, and raw description;
- track collection time and source reliability.

### Source Quality

Guard and Nova should help define source quality rules over time:

- prefer reputable sources;
- avoid fabricated or low-quality sources;
- preserve uncertainty when source confidence is low;
- do not present unverified information as fact.

## 9. AI Summarization

### Summary Goals

The AI should make news faster to understand, not distort it.

Summaries must be:

- concise;
- accurate;
- source-grounded;
- easy to read on mobile;
- clear about why the item matters.

### Ranking Criteria

The system should rank news using:

- relevance to selected categories;
- importance of the event;
- source credibility;
- novelty;
- likely impact on the user;
- diversity across categories.

### Output Format

Recommended digest format:

```text
おはよう、Ion。
今日5分で押さえるべきニュースです。

1. [Title]
一言要約: ...
なぜ重要か: ...
忙しい人向けの結論: ...
読む: [link]
```

### Safety and Accuracy

The AI must:

- avoid hallucinating details not present in source material;
- include source links;
- distinguish facts from interpretation;
- avoid giving medical, financial, or legal advice as a definitive instruction;
- treat medical and financial categories with extra caution.

## 10. Delivery

### Initial Channel Recommendation

Start with Email for the MVP.

Reasons:

- easier to implement;
- easier to test;
- no need for LINE approval flow at the earliest stage;
- works well for personal daily digests.

### LINE Expansion

LINE delivery should be added after Email delivery is stable.

LINE-specific requirements:

- message should be short enough for mobile chat reading;
- links should be easy to tap;
- user should be able to pause or adjust delivery later;
- authentication and privacy should be handled carefully.

## 11. Pricing Concept

### Free

- three categories;
- summary only;
- ads included.

### Premium

- monthly price: 980円;
- all categories;
- deeper explanations;
- weekly report.

### Pro

- monthly price: 2,980円;
- industry-specific news;
- examples: medical, finance, IT;
- deeper professional context.

Pricing should not be implemented in the first MVP unless needed for validation.

## 12. Future Expansion

Potential later features:

- weekly executive report;
- saved articles;
- read-later list;
- keyword tracking;
- company or stock watchlists;
- medical and financial specialty modes;
- team and corporate dashboards;
- Slack, Teams, or Notion delivery;
- user feedback buttons to improve personalization;
- source reliability scoring.

## 13. Suggested Division Responsibilities

| Division | AI Employee | Responsibility |
| --- | --- | --- |
| News Division | Nova | Source monitoring, article collection, news relevance. |
| Research Division | Atlas | Background context, source comparison, importance judgment. |
| Knowledge Division | Sage | Clear explanations and category organization. |
| Automation Division | Flow | Scheduled collection, summarization, and delivery workflows. |
| Scheduling Division | Pulse | Morning delivery time, cadence, and reminders. |
| Security Division | Guard | Privacy, source safety, delivery security, and risk review. |
| Engineering Division | Forge | Application implementation and system reliability. |
| Memory Division | Echo | User preferences, past digests, and personalization history. |
| Design Division | Vision | Digest readability and mobile-first presentation. |

## 14. Implementation Priority

Recommended first three implementation steps:

1. Build a single-user manual digest generator using fixed categories and sample RSS or NewsAPI data.
2. Add AI summarization into the required digest format with source links.
3. Add scheduled Email delivery for the morning digest.

After those are stable, add onboarding, persistent user settings, LINE delivery, and pricing-plan restrictions.

## 15. Open Questions for Claude Code

Claude Code should decide or ask Ion about:

1. Which stack to use for the MVP.
2. Whether to start with NewsAPI, RSS, or both.
3. Whether Email delivery should use Resend, SendGrid, SMTP, or another provider.
4. Whether LINE delivery is required in the first deployable version or should follow Email.
5. Whether the first version is single-user only for Ion or should include multi-user account support.
6. Which categories are highest priority for the first digest test.

## 16. Handoff Note

This file is a product requirements document only. It intentionally does not implement application behavior.

Claude Code should use this as the product baseline before creating app code, prompts, scheduled jobs, delivery integrations, or database schemas.
