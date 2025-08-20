# Quiz Selections Storage

This document describes the simple quiz selections storage system for the Influence Style Quiz.

## Overview

The quiz stores user answer selections with standardized tags for future analytics and insights.

## Analytics Tags Format

### Standard Format
- **Regular Questions**: `Q{number}_{answer}` (e.g., `Q1_A`, `Q2_B`, `Q3_C`)
- **Mix Answers**: `Q{number}_MIX` (e.g., `Q1_MIX`, `Q2_MIX`)
- **None Answers**: `Q{number}_NONE` (e.g., `Q1_NONE`, `Q2_NONE`)
- **Alternate Bank Questions**: `Q{number}-Alt_{answer}` (e.g., `Q1-Alt_A`, `Q2-Alt_B`)
- **Q10 Clarifier**: `Q10_{answer}` (e.g., `Q10_A`, `Q10_B`)

### Examples
- `Q1_A` - Question 1, Answer A (Take charge and push things forward)
- `Q1_MIX` - Question 1, Mix answer (A mix of two or more)
- `Q1_NONE` - Question 1, None answer (None of these feel right)
- `Q1-Alt_A` - Question 1 Alternate, Answer A (Step back, listen, and provide calm direction)
- `Q10_A` - Question 10, Answer A (Stay calm and steady so others can rely on me)

## Database Schema

### Table: `quiz_selections`
```sql
CREATE TABLE quiz_selections (
    id UUID PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES influence_users(id),
    question_id VARCHAR(20) NOT NULL,
    answer_id VARCHAR(10) NOT NULL,
    analytics_tag VARCHAR(50) NOT NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Features
- **Row Level Security (RLS)** enabled for data privacy
- **Unique constraint** prevents duplicate answers per user per question
- **Basic indexes** for query performance

## API Endpoints

### POST `/api/save-quiz-analytics`
Saves quiz selections to the database.

**Request Body:**
```json
{
  "userId": "user-uuid",
  "analyticsData": [
    {
      "questionId": "Q1",
      "answerId": "A",
      "analyticsTag": "Q1_A",
      "timestamp": "2024-01-01T12:00:00Z"
    }
  ]
}
```

## Implementation Details

### Code Changes
1. **Interface Updates**: Added `analyticsTag` to `QuizAnswer` interface
2. **State Management**: Added `analyticsData` to `QuizState`
3. **Answer Tracking**: Modified `handleNext` to capture analytics data
4. **Database Integration**: Added `saveQuizSelectionsToDatabase` function
5. **API Endpoint**: Created `/api/save-quiz-analytics` endpoint

### Data Flow
1. User selects an answer
2. Analytics tag is generated/retrieved
3. Data is stored in component state
4. On quiz completion, data is sent to API
5. API saves data to database

## Future Analytics Possibilities

This simple storage enables future analysis of:
- **Answer Distribution**: Which answers are most/least popular
- **User Behavior**: How users progress through the quiz
- **Question Performance**: Which questions cause users to select "None"
- **Completion Patterns**: How users interact with alternate banks
- **User Journeys**: Complete path through the quiz for each user

## Security Considerations

- **RLS Policies**: Users can only access their own quiz selections
- **Data Privacy**: Quiz selections are tied to user accounts
- **Audit Trail**: All selections are timestamped
