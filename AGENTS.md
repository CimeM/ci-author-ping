# Rules for agents

## Responses

- Keep responses concise and to the point - unless the user asks otherwise

## Planning mode
- Ask clarifying questions if ambiguity prevents progress
- Never assume design, tech stack or features
- Use deep-dive sub-agents to assist with research
- Use deep-dive sub-agents to review the different aspects of your plan before presenting to the user
- adhere to the coding style used in the project

## Changes / editing
- Delegate changes in code to sub-agents when possible.
- Identify changes from the plan that can be implemented in parallel, and use sub-agents to implement the features efficiently
- always use sub-agents when possible. If so use them to implement features, act as a coordinator only.
- Use the best model for the task - premium models for complex tasks (like coding) and mid-tier models for simpler tasks, like documentation
- After completing features (large or small), always check code quality using applicable project checks and report what couldn’t be run.

## Testing
- write tests if the feature is important
- use npm test to run tests
- never assume your changes work, always test

## Design

- Always follow standard coding and design principles.
- Apply the principle of least privilege.
- Make features optional; the decision to adopt them belongs to the consumer.
- Log/alert when the CI action runs in a misconfigured state.
