# Fix Mentor Test Flow

## Issue
After submitting the mentor application, the test doesn't appear.

## Root Cause
The `handleApplicationSuccess()` function wasn't properly fetching the newly created mentor data before transitioning to the test step.

## Fix Applied

### Code Changes
Updated `src/pages/BecomeMentor.tsx`:
- Changed `handleApplicationSuccess()` to properly fetch mentor data after application submission
- Added toast import for error handling
- Now properly sets `mentorData` before showing the test

### What Changed
**Before**:
```typescript
const handleApplicationSuccess = () => {
  setCurrentStep("test");
  checkMentorStatus();
};
```

**After**:
```typescript
const handleApplicationSuccess = async () => {
  // Fetch the newly created mentor data
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: mentor } = await supabase
        .from("mentors")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (mentor) {
        setMentorData(mentor);
        setCurrentStep("test");
      }
    }
  } catch (error) {
    console.error("Error fetching mentor data:", error);
    toast.error("Failed to load test. Please refresh the page.");
  }
};
```

## Verification Steps

### 1. Verify Test Questions Exist
Run this SQL in Supabase to check if test questions are loaded:

```sql
-- Check if test questions exist for each subject
SELECT subject, difficulty, COUNT(*) as count
FROM test_questions
GROUP BY subject, difficulty
ORDER BY subject, difficulty;

-- Expected output:
-- Math: 10 easy, 10 medium, 5 hard
-- Physics: 10 easy, 10 medium, 5 hard
-- Chemistry: 10 easy, 10 medium, 5 hard
-- Computer Science: 10 easy, 10 medium, 5 hard
-- English: 10 easy, 10 medium, 5 hard
```

If no questions exist, run the migration:
```bash
# The questions should already be there from migration:
# supabase/migrations/20251113000004_create_test_questions.sql
```

### 2. Test the Flow

1. **Go to Become a Mentor page**: https://mentorlinkk.netlify.app/become-mentor
2. **Click "Start Application"**
3. **Fill in the form**:
   - Select a subject (e.g., "Math")
   - Set hourly rate (e.g., 500)
   - Upload a grade document (any JPG/PNG/CSV file)
4. **Click "Submit Application"**
5. **Test should appear immediately** with:
   - Test instructions
   - "Start Test" button
   - 20 questions
   - 30-minute timer

### 3. Verify RLS Policies

Make sure test_questions table has proper RLS policy:

```sql
-- Check if policy exists
SELECT * FROM pg_policies WHERE tablename = 'test_questions';

-- Should show:
-- "Test questions are viewable by authenticated users"
```

If policy is missing, run:
```sql
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Test questions are viewable by authenticated users"
  ON test_questions FOR SELECT
  TO authenticated
  USING (true);
```

## Testing Checklist

- [ ] Application form submits successfully
- [ ] Test appears immediately after submission
- [ ] Test shows 20 questions
- [ ] Timer starts at 30:00
- [ ] Can navigate between questions
- [ ] Can select answers
- [ ] Submit button appears on last question
- [ ] Test submits and shows results
- [ ] Mentor status updates to "verified" if score >= 70%
- [ ] Verification email is sent

## Troubleshooting

### Test still doesn't appear?
1. Check browser console for errors
2. Verify mentor record was created:
   ```sql
   SELECT * FROM mentors ORDER BY created_at DESC LIMIT 1;
   ```
3. Check if test_questions exist for the selected subject
4. Verify RLS policies allow reading test_questions

### Test questions don't load?
1. Check if questions exist in database
2. Verify RLS policy on test_questions table
3. Check browser console for Supabase errors
4. Verify user is authenticated

### Test submission fails?
1. Check if all 20 questions are answered
2. Verify mentors table has test_score column
3. Check Supabase logs for errors
4. Verify RLS policies allow updating mentors table

## Additional Notes

- Test requires 70% (14/20 correct) to pass
- Test auto-submits when timer reaches 0
- Questions are randomly selected: 8 easy, 8 medium, 4 hard
- Verification email is sent after test completion
- Failed tests keep mentor in "pending" status
- Passed tests update status to "verified"

---

**Status**: Fixed
**Date**: 2024-11-18
**Files Modified**: `src/pages/BecomeMentor.tsx`
