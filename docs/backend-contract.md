# Backend Contract (Draft v1)

This document defines the minimal API contract for integrating game runs and problem generation.

## Endpoints

### POST `/api/runs/start`

Request:

```json
{
  "playerName": "Anna",
  "towerId": "fractions"
}
```

Response:

```json
{
  "runId": "run_123",
  "startedAt": "2026-04-26T10:00:00.000Z",
  "initialProblem": {
    "id": "p_1",
    "prompt": "1/2 + 1/4 = ?",
    "correctAnswers": ["3/4"],
    "wrongAnswers": ["1/2", "1/6"],
    "topic": "fractions",
    "difficulty": 1
  }
}
```

### POST `/api/runs/answer`

Request:

```json
{
  "runId": "run_123",
  "problemId": "p_1",
  "answer": "3/4"
}
```

Response:

```json
{
  "isCorrect": true,
  "state": "CONTINUE",
  "nextProblem": {
    "id": "p_2",
    "prompt": "3/4 - 1/4 = ?",
    "correctAnswers": ["1/2", "2/4"],
    "wrongAnswers": ["1/4", "1/6"],
    "topic": "fractions",
    "difficulty": 1
  },
  "rewardItemId": "ADD_TIME"
}
```

`state` values:
- `CONTINUE`
- `ENEMY_DEFEATED`
- `FLOOR_COMPLETE`
- `GAME_OVER`
- `VICTORY`

### GET `/api/problems/next?towerId=fractions&floor=1&enemyType=NORMAL`

Response:

```json
{
  "problem": {
    "id": "p_3",
    "prompt": "0.75 - 0.25 = ?",
    "correctAnswers": ["0.5", "1/2"],
    "wrongAnswers": ["0.25", "1.0"],
    "topic": "fractions",
    "difficulty": 1
  }
}
```
