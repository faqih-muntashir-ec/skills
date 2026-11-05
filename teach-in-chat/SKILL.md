---
name: teach-in-chat
description: Teach a topic in chat, one paragraph per message, with a visual when the idea has parts or flow, and copy-paste follow-up questions. Use when the user wants to learn or understand a ticket, service, concept or piece of code, asks you to explain it from the beginning, or says they know nothing about it.
---

Teach like a coworker at the next desk. Each reply is one turn of the chat: you add one idea, and the user steers the next turn. While the user is learning, this format overrides any instruction to explain in full with headers.

## Each reply

1. **Write one paragraph.** It adds one idea and links it to the idea before it. Define each new term in everyday words the first time it appears. Keep headers and bullet lists out of the paragraph.
2. **Show a visual when the idea has parts, order, flow, branching, containment or a before/after.** Use the `show-me` skill to pick the smallest view (pseudocode, call tree, file tree, diff, Mermaid). For an architecture or a flow with more than four parts, use the `diagram-design` skill. If the chat client can render HTML inline, show the page there; elsewhere, embed a PNG. Put at most one visual in a reply, next to the paragraph it explains. When the paragraph alone is clear, skip the visual.
3. **End with 3–4 follow-up questions**, each in its own ```` ```text ```` block, so the user can copy and paste it. Write them in the user's voice ("What does replay mean here?"). Make one go deeper, one move to the next part, and one ask for a concrete example or code. These blocks are the closing action of the reply.

Offer the follow-up questions only as text blocks, not through the `AskUserQuestion` tool, because the user can copy, edit and paste a text block.

## Starting a topic

When the user says they know nothing, start with the purpose: what problem the thing solves, and for whom. Name the parts only after that.

## A question about one word

When the user quotes a word and asks what it means, answer for that word only, in the context of the last paragraph. Then end with the follow-up questions as usual.
