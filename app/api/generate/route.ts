import Replicate from 'replicate'
import { createInsForgeServerClient } from '@/app/lib/insforge/server'

export const maxDuration = 300

const PROMPTS: Record<string, string> = {
  baseball:
    "Transform the person in this photo into a viral Korean baseball broadcast-style image. Place them dramatically under stadium floodlights with sports broadcast overlay graphics, sharp action framing, and a professional sports media aesthetic. Keep the person's face and identity intact.",
  idol:
    "Transform the person in this photo into a K-pop idol fancam-style image. Place them on a vibrant concert stage with dynamic lighting, performance energy, and a polished K-pop entertainment photography aesthetic. Keep the person's face and identity intact.",
  show:
    "Transform the person in this photo into a hip-hop music show image inspired by Show Me The Money. Surround them with dramatic concert lighting, crowd energy, and stage atmosphere. Keep the person's face and identity intact.",
  fashion:
    "Transform the person in this photo into a viral Korean street fashion editorial image. Place them in an urban Seoul backdrop with a trendy composition and street-style photography aesthetic. Keep the person's face and identity intact.",
}

export async function POST(request: Request) {
  const insforge = await createInsForgeServerClient()
  const { data: authData } = await insforge.auth.getCurrentUser()
  if (!authData?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = authData.user.id

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const cardId = formData.get('cardId') as string | null
  if (!file || !cardId) {
    return Response.json({ error: 'Missing file or cardId' }, { status: 400 })
  }

  const prompt = PROMPTS[cardId] ?? PROMPTS.fashion

  // 1. 입력 이미지 → InsForge Storage 업로드
  const inputArrayBuffer = await file.arrayBuffer()
  const inputBlob = new Blob([inputArrayBuffer], { type: file.type })
  const ext = file.type.split('/')[1] ?? 'jpg'
  const inputKey = `${userId}/inputs/${Date.now()}.${ext}`

  const { data: inputUpload, error: inputError } = await insforge.storage
    .from('generations')
    .upload(inputKey, inputBlob)
  if (inputError || !inputUpload) {
    console.error('[generate] Input upload error:', inputError)
    return Response.json({ error: `Input upload failed: ${JSON.stringify(inputError)}` }, { status: 500 })
  }

  // 2. generations 레코드 생성
  const { data: genRecord, error: insertError } = await insforge.database
    .from('generations')
    .insert([{
      user_id: userId,
      card_id: cardId,
      prompt,
      input_image_url: inputUpload.url,
      input_image_key: inputKey,
      status: 'processing',
    }])
    .select('id')
    .single()
  if (insertError || !genRecord) {
    console.error('[generate] DB insert error:', insertError)
    return Response.json({ error: 'DB insert failed' }, { status: 500 })
  }

  // 3. Replicate openai/gpt-image-2 이미지 생성
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })
  let outputUrl: string
  try {
    const output = await replicate.run('openai/gpt-image-2', {
      input: {
        prompt,
        input_images: [inputUpload.url],
        quality: 'medium',
        aspect_ratio: '1:1',
        output_format: 'webp',
        number_of_images: 1,
        background: 'auto',
        moderation: 'auto',
        output_compression: 85,
      },
    }) as string[]
    outputUrl = output[0]
    if (!outputUrl) throw new Error('No output URL from Replicate')
  } catch (err) {
    console.error('[generate] Replicate error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    await insforge.database.from('generations').update({ status: 'failed' }).eq('id', genRecord.id)
    return Response.json({ error: msg }, { status: 500 })
  }

  // 4. 생성된 이미지 다운로드 → InsForge Storage 업로드
  const outputRes = await fetch(outputUrl)
  const outputBlob = await outputRes.blob()
  const outputKey = `${userId}/outputs/${Date.now()}.webp`

  const { data: outputUpload, error: outputError } = await insforge.storage
    .from('generations')
    .upload(outputKey, outputBlob)
  if (outputError || !outputUpload) {
    console.error('[generate] Output upload error:', outputError)
    return Response.json({ error: 'Output upload failed' }, { status: 500 })
  }

  // 5. 레코드 완료 업데이트
  await insforge.database.from('generations').update({
    output_image_url: outputUpload.url,
    output_image_key: outputKey,
    status: 'completed',
    updated_at: new Date().toISOString(),
  }).eq('id', genRecord.id)

  return Response.json({ url: outputUpload.url, generationId: genRecord.id })
}
