# TeamCast A2A Demo — User Guide (MCP Key → Interview Request → Results)

This guide explains how to generate a **client MCP key** (used as the **A2A API key**) and how to use the **A2A Demo** page to request an interview, complete the assessment, and fetch results.

## Prerequisites

- **Support Admin / Technical Support access** to the TeamCast Support UI
- Access to the target **client** in Support
- A **candidate email address** that can receive an invite email

## Background (A2A configuration summary)

- **Auth**: A2A requests authenticate using the same MCP client key store.
  - Send the key as either:
    - `X-API-Key: <MCP_KEY>` (recommended), or
    - `Authorization: Bearer <MCP_KEY>` / `Authorization: ApiKey <MCP_KEY>`
- **A2A JSON-RPC methods** (server routes them):
  - `message/send` (main entry for running skills like `interview.request`)
  - `tasks/get`, `tasks/list`, `tasks/cancel`
  - `agent/info`
- **Skills available**:
  - `interview.request`
  - `interview.status`
  - `interview.results`
  - `interview.list`
  - `interview.cancel`

## Step-by-step: Using the A2A Demo with a client MCP key

### 1) Create / manage the MCP key for the client (Support UI)

- Log in to the **TeamCast Support UI** as a user with **Support Admin** or **Technical Support** role.
- Go to the **Clients** area and open the **client details** page for the client you want to use with A2A.

### 2) Generate and copy the MCP key (MCP Key tab)

- Open the **MCP Key** tab.
- Click **Generate / Rotate MCP Key**.
- Confirm the prompt.
- **Copy the new MCP key immediately.**
  - Important:
    - Existing keys **cannot be displayed** later.
    - Generating a key **invalidates the previous key** for that client.

### 3) Open the A2A Demo page and paste the MCP key

- Open: `https://devapi.teamcast.ai/a2a-demo`
- Paste the copied MCP key into the **API Key** field.
- (Optional but recommended) Click **Discover Agent** to load the agent card and confirm connectivity.

### 4) Request an interview (interview.request)

- In **A2A Skills**, select **`interview.request`**.
- Fill the required fields:
  - **Candidate Email**
  - **Candidate Name**
  - **Skills to Assess** (comma-separated)
- Fill optional fields as needed:
  - **Assessment Level** (Junior / Intermediate / Senior / Lead)
  - **Job Title**
  - **External Reference ID** (optional)
- Click **Execute Skill**.

### 5) Candidate receives the invite email

- The candidate email address you entered will receive an **invite email**.

### 6) Candidate opens invite link and sets up account

- Candidate copies the invite link from the email and opens it in a browser (or clicks the **Start assessment** button).
- The candidate is taken to an **account setup** flow:
  - Set password
  - Start interview

### 7) Candidate completes the assessment

- Candidate completes the interview/assessment flow (for example: **Onboarding** and **Job AI** sections, as applicable).

### 8) Fetch interview results in the A2A Demo (interview.results)

- Go back to `https://devapi.teamcast.ai/a2a-demo`.
- Select **`interview.results`**.
- Enter the **Interview ID**:
  - Use the `interviewId` returned from the `interview.request` response (or tracked by your reference ID).
- Click **Execute Skill**.
- The demo returns **results as JSON**.

## Tips & troubleshooting

- **401 Unauthorized / Invalid API key**
  - Ensure you pasted the **new** MCP key (keys are shown once).
  - If you rotated the key again, integrations using the old key will stop working immediately.
- **No email received**
  - Confirm the candidate email is correct and can receive external mail.
  - Check spam/junk folders.
- **Results not ready yet**
  - Use **`interview.status`** first and confirm status is `RESULTS_READY` before calling **`interview.results`**.

