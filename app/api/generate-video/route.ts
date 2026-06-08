import Replicate from 'replicate'
import { createInsForgeServerClient } from '@/app/lib/insforge/server'

export const maxDuration = 300

const VIDEO_PROMPTS: Record<string, string> = {
  baseball:
    'Realistic Korean baseball broadcast audience shot, a person sitting in stadium crowd during evening game, candid reaction while watching the field, subtle blinking, natural breathing, slight hair movement from stadium breeze, tiny head movement, telephoto sports broadcast lens, shallow depth of field, surrounding crowd slightly blurred and moving naturally, yellow cheering towels waving softly, beer cups on seats, realistic stadium LED lighting, live TV compression artifacts, slight motion blur, authentic KBO broadcast atmosphere, live camera style, documentary realism, handheld broadcast camera micro shake, not posing, not looking at camera. Do not alter, remove, or change any text or graphics visible in the original image. All text overlays, scoreboards, and broadcast UI must remain exactly as they appear in the source image.',
  idol:
    'The person in the image shows subtle natural movement: gentle breathing, soft natural blink, slight hair movement from venue air, micro head sway with the rhythm. Ambient stage or event lighting shifts softly. Camera holds with gentle micro-shake and occasional shallow focus pull. Surrounding environment moves naturally — crowd, lights, or atmosphere animate organically around them. Cinematic quality, documentary realism, not posing, candid live moment.',
  show:
    'Realistic Korean hip-hop survival show broadcast audience shot, this person sitting in concert venue crowd during live rapper performance, candid reaction while watching the stage, subtle blinking, natural breathing, slight hair movement from indoor venue air circulation, tiny head movement following the performance, telephoto broadcast camera lens, shallow depth of field, surrounding crowd slightly blurred and moving naturally cheering and waving glow sticks, realistic concert venue red and amber stage lighting with occasional strobe flashes, live TV compression artifacts, slight motion blur, authentic SHOW ME THE MONEY broadcast atmosphere, live camera style, documentary realism, handheld broadcast camera micro shake, not posing, not looking at camera. Do not alter, remove, or change any text or graphics visible in the original image. All text overlays and broadcast UI must remain exactly as they appear in the source image.',
  anime:
    'Gentle Studio Ghibli-style 2D animated scene. The illustrated character in the image shows soft natural animation: hair and clothes move slowly in a gentle breeze, eyes blink softly, subtle breathing movement. Floating dust particles and petals drift through the air. Warm dappled sunlight shifts gently across the scene. Background elements animate quietly — leaves rustle, clouds drift slowly, distant grass sways. Hand-drawn Ghibli animation quality, smooth 2D cel animation movement, peaceful and dreamlike atmosphere, Miyazaki signature gentle pacing.',
}

// 카드별 영상 비율
const VIDEO_ASPECT_RATIOS: Record<string, string> = {
  baseball: '16:9',
  idol: '16:9',
  show: '16:9',
  anime: '16:9',
}

export async function POST(request: Request) {
  const insforge = await createInsForgeServerClient()
  const { data: authData } = await insforge.auth.getCurrentUser()
  if (!authData?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = authData.user.id

  const body = await request.json() as { generationId: string; imageUrl: string; cardId: string }
  const { generationId, imageUrl, cardId } = body
  if (!generationId || !imageUrl || !cardId) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const videoPrompt = VIDEO_PROMPTS[cardId] ?? VIDEO_PROMPTS.anime

  // 1. 상태 video_processing 업데이트
  await insforge.database.from('generations')
    .update({ status: 'video_processing', video_prompt: videoPrompt })
    .eq('id', generationId)

  // 2. Replicate google/veo-3.1 영상 생성
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })
  let videoUrl: string
  try {
    type FileOutput = { url: () => string }
    const aspectRatio = VIDEO_ASPECT_RATIOS[cardId] ?? '9:16'
    const output = await replicate.run('google/veo-3.1', {
      input: {
        prompt: videoPrompt,
        image: String(imageUrl),
        duration: 8,
        resolution: '720p',
        aspect_ratio: aspectRatio,
        generate_audio: false,
      },
    }) as string | FileOutput
    videoUrl = typeof output === 'string' ? output : output.url()
    if (!videoUrl) throw new Error('No video URL from Replicate')
  } catch (err) {
    console.error('[generate-video] Replicate error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    await insforge.database.from('generations').update({ status: 'video_failed' }).eq('id', generationId)
    return Response.json({ error: msg }, { status: 500 })
  }

  // 3. 생성된 영상을 InsForge Storage에 영구 저장 (Replicate CDN URL은 만료됨)
  let persistentVideoUrl = videoUrl
  const videoKey = `${userId}/videos/${generationId}.mp4`
  try {
    const vidRes = await fetch(videoUrl)
    const vidBlob = await vidRes.blob()
    const { data: videoUpload, error: uploadErr } = await insforge.storage
      .from('generations')
      .upload(videoKey, vidBlob)
    if (!uploadErr && videoUpload) {
      persistentVideoUrl = videoUpload.url
    } else {
      console.error('[generate-video] Video storage upload failed, using Replicate URL:', uploadErr)
    }
  } catch (err) {
    console.error('[generate-video] Video storage upload exception:', err)
  }

  // 4. generations 레코드 최종 업데이트
  await insforge.database.from('generations').update({
    output_video_url: persistentVideoUrl,
    output_video_key: videoKey,
    status: 'completed',
    updated_at: new Date().toISOString(),
  }).eq('id', generationId)

  return Response.json({ url: persistentVideoUrl })
}
