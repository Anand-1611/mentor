# Upload Note Edge Function

This Supabase Edge Function handles PDF note uploads to the MentorLink platform.

## Features

- Accepts multipart form data with PDF file and metadata
- Validates file type (PDF only) and size (max 50MB)
- Uploads PDF to Supabase Storage with user-scoped paths
- Creates database record in the `notes` table
- Returns note ID, file URL, and thumbnail URL

## Deployment

Deploy this function using the Supabase CLI:

```bash
supabase functions deploy upload-note
```

## Environment Variables Required

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations

## API Usage

### Endpoint
```
POST /functions/v1/upload-note
```

### Headers
```
Authorization: Bearer <user_jwt_token>
Content-Type: multipart/form-data
```

### Request Body (FormData)
- `file`: PDF file (max 50MB)
- `metadata`: JSON string containing:
  ```json
  {
    "title": "Note title",
    "description": "Note description",
    "subject": "Subject name",
    "price": 100,
    "tags": ["tag1", "tag2"]
  }
  ```

### Response
```json
{
  "noteId": "uuid",
  "fileUrl": "https://...",
  "thumbnailUrl": null,
  "message": "Note uploaded successfully"
}
```

## Storage Structure

Files are stored in the following structure:
```
notes/
  └── {userId}/
      └── {noteId}/
          └── original.pdf
```

## Future Enhancements

- Implement thumbnail generation from first page of PDF
- Add virus scanning for uploaded files
- Implement file compression for large PDFs
- Add OCR for searchable text extraction
