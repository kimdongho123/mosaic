alter table public.generations
  add column if not exists output_video_url  text,
  add column if not exists output_video_key  text,
  add column if not exists video_prompt      text;
