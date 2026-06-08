import Replicate from 'replicate'
import { createInsForgeServerClient } from '@/app/lib/insforge/server'

export const maxDuration = 300

interface PromptVariant {
  text: string
  aspectRatio: string
}

const PROMPTS: Record<string, PromptVariant[]> = {
  baseball: [
    {
      // 장면 1: 직캠 주인공
      text: "Use the uploaded reference image as the strongest identity anchor. The person must look like the exact same person from the reference image. Preserve their exact facial identity with high priority: same face shape, same eyes, same nose, same lips, same skin tone, same expression style, same hair. Create an ultra-realistic candid KBO baseball broadcast screenshot of this person accidentally caught by a live TV camera in the spectator seats. They are seated among a lively Korean baseball crowd, holding an iced drink and a cheering stick, wearing a clean white baseball jersey over a casual top. They notice the camera and give a small natural smile, slightly surprised but composed. Use a realistic broadcast camera look: telephoto compression, mild video softness, slight motion blur in the crowd, stadium lighting, natural skin texture, imperfect candid framing, 16:9 horizontal TV broadcast composition. Background: crowded Korean baseball stadium seats, cheering fans, bright stadium lights, LED boards softly out of focus.",
      aspectRatio: '3:2',
    },
    {
      // 장면 2: 4:3 인물 중심 스타일
      text: "한국 프로야구(KBO) 경기장 관중석에서 촬영한 초 현실적인 스포츠 중계 스타일 프레임, 다큐멘터리 스타일의 이미지. 피사체는 업로드한 인물과 동일한 얼굴로, 군중 속에 앉아 있습니다. 표정은 놀라움과 집중력이 미묘하게 섞여 경기장을 바라보며 자연스럽게 반응합니다. 실제 생방송 중에 포착된 것처럼 솔직하고 즉흥적이며 포즈를 취하지 않은 듯한 느낌. 정통 KBO 팀 유니폼을 입고 있으며 참조 이미지의 디자인·색상·세부사항을 보존합니다. 주변 좌석에는 관중·스마트폰·휴대용 선풍기 등이 자연스럽게 배치. 배경은 약간 흐릿하고 얕은 심도, 프레임 상단에는 한국 스포츠 방송 스타일 그래픽과 스코어보드 오버레이, 미묘한 방송 압축 아티팩트. 화면 비율: 4:3.",
      aspectRatio: '3:2',
    },
    {
      // 장면 3: 일반인 스타일
      text: "업로드한 인물 얼굴은 실제 그대로 유지하고, AI 미남/미녀 느낌 말고 '진짜 KBO 생중계 카메라에 우연히 잡힌 일반인 관중'처럼 자연스럽게 생성. SPOTV/KBO 방송 캡처 느낌, 관중석 직캠 구도, 주변 관중·맥주컵·응원도구·선풍기 자연스럽게 배치. 중요: 얼굴 과보정 금지, 눈 키우기 금지, 턱 보정 금지, 피부 뽀샤시 금지, 화보 느낌 금지, 인플루언서 느낌 금지. 실제 방송처럼 약간 흐린 생중계 화질, 압축 노이즈, 미세한 모션블러, 현실적인 피부결, 잔머리와 땀광 표현. 다리 꼬고 편하게 경기 보는 모습, 카메라 의식한 듯 안 한 듯한 자연스러운 표정. 'AI가 만든 사람'이 아니라 '진짜 방송에 잡혀 화제된 일반인'처럼 만들어줘. 16:9 화면 비율.",
      aspectRatio: '3:2',
    },
  ],
  idol: [
    {
      // 장면 1: 음방 원샷 무대
      text: "Use the uploaded portrait as the identity reference. Create a realistic Korean music show close-up camera shot, like the person is an idol captured during a live performance one-shot. Preserve facial identity. High-quality broadcast stage image, close-up upper body framing, glossy stage makeup, confident eye contact, one hand near face in a clean performance pose, wireless in-ear monitor, sparkling stage outfit, purple and blue LED lights, shallow depth of field, broadcast camera sharpness, subtle motion blur from performance, music show thumbnail energy. Horizontal 16:9 broadcast composition. No readable text, no logos.",
      aspectRatio: '3:2',
    },
    {
      // 장면 2: 팬싸인회
      text: "Use the uploaded photo as facial identity reference only. Transform the person into a K-pop idol at a fansign event, captured through a professional camera viewfinder display. Keep the face and identity. The person is sitting at a table, holding a signing pen, looking up at the camera with a focused gentle expression. Wearing a sleek black sleeveless top. The entire image is framed within a DSLR camera LCD screen interface with autofocus brackets, exposure info overlay, and slight green tint of a camera display. Clean studio lighting, professional event photography feel. No brand logos, no readable real text.",
      aspectRatio: '3:2',
    },
    {
      // 장면 3: K-POP 콘서트 전광판
      text: "첨부된 인물 사진을 참고해서 K-POP 콘서트장에서 관객이 찍은 대형 전광판 라이브 피드 사진처럼 만들어줘. 실제 무대 위 퍼포머는 보이지 않고, 인물은 거대한 LED 전광판 안의 클로즈업 라이브 화면에만 등장하게 해줘. 얼굴 특징과 헤어 정체성은 유지하고, 시선은 카메라 정면이 아닌 무대 쪽을 살짝 바라보는 자연스러운 사이드 게이즈로 구성해줘. 어두운 실내 아레나, 관객 실루엣, 핑크/보라 응원봉, 화면을 녹화하는 휴대폰, 디지털 줌 질감, LED 픽셀감, 약간의 흔들림이 있는 실제 아이폰 콘서트 직찍 느낌. 읽히는 로고나 자막, 워터마크는 넣지 마.",
      aspectRatio: '3:2',
    },
  ],
  show: [
    {
      // 장면 1: 관객석 응원
      text: "업로드한 인물 사진을 기반으로 한국 힙합 서바이벌 프로그램 SHOW ME THE MONEY 12 관객석 장면처럼 연출해주세요. 실제 방송 캡처 같은 리얼한 무드, 인물이 관객석 정가운데에 자연스럽게 잡힌 장면, 양손으로 SHOW ME THE MONEY 슬로건을 들고 응원하는 모습, 좋아하는 래퍼 무대를 보며 살짝 설레거나 집중한 표정. 주변 관객들은 흐릿하거나 어둡게 보여 메인 인물이 강조되게, 공연장 특유의 붉고 어두운 조명, 실제 방송국 중계 카메라 느낌, 살짝 거친 방송 압축 화질. 상단에는 SHOW ME THE MONEY 12 스타일 방송 UI, 관객석 구조와 사람 배치는 실제 공연장처럼 자연스럽게. 얼굴은 업로드한 인물과 동일 인물처럼 유지, 과한 화보 느낌 금지, AI 피부보정 금지, 일반인 관객처럼 자연스럽고 현실감 있게. 팔 손 손가락 형태 정상적으로 표현, 방송 캡처처럼 우연히 잡힌 느낌, 실제 공연장 카메라 구도 느낌 강조. 16:9 화면 비율.",
      aspectRatio: '3:2',
    },
    {
      // 장면 2: 1차 예선 참가
      text: "업로드한 인물 사진을 기반으로 SHOW ME THE MONEY 12 스타일의 실제 방송 캡처 느낌으로 연출해주세요. 참가자가 카메라를 향해 랩하는 순간, 한 손으로 제스처를 하며 자신감 있는 표정, 목에 헤드폰 착용. 뒤에는 참가자들과 스태프들이 자연스럽게 서 있는 대기장 분위기, 실내 체육관 느낌의 넓은 오디션 무대. 차가운 블루톤 조명과 방송 카메라 색감, 살짝 거친 방송 압축 화질과 실제 TV 캡처 느낌. 상단 좌측에는 힙합 서바이벌 프로그램 느낌의 로고 UI, 하단에는 한국 예능 스타일 자막 배치, 자막 폰트는 흰색 텍스트와 얇은 검정 테두리. 얼굴은 업로드한 인물과 동일 인물처럼 유지, 인플루언서 화보 느낌 금지, 너무 AI스럽거나 과한 피부보정 금지. 참가자는 전신이 자연스럽게 보이게, 팔 손 다리 정상적으로 표현. 16:9 화면 비율.",
      aspectRatio: '3:2',
    },
    {
      // 장면 3: 2차 예선 탈락
      text: "업로드한 인물 사진을 기반으로 한국 힙합 서바이벌 프로그램 2차 예선 탈락 무대처럼 연출해주세요. SHOW ME THE MONEY 12 스타일의 실제 방송 캡처 느낌, 참가자가 무대 중앙에서 결과를 듣고 아쉬워하는 순간. 뒤 대형 전광판에는 거대한 'FAIL' 텍스트, 바닥 양옆으로 강한 불기둥과 화염 연출. 붉은 조명과 뜨거운 화염 반사광, 실제 방송국 카메라 느낌의 거친 화질. 공연장 구조와 관객석도 실제 방송처럼 자연스럽게 배치, 상단에는 힙합 서바이벌 프로그램 스타일 방송 UI. 하단에는 한국 예능 스타일 탈락 자막 배치, 참가자는 고개를 살짝 숙이거나 허탈한 표정, 힘 빠진 자세와 무대 직후 같은 현실적인 감정 표현. 얼굴은 업로드한 인물과 동일 인물처럼 유지, AI 피부보정 금지, 인플루언서 화보 느낌 금지. 참가자는 전신이 자연스럽게 보이게, 팔 손 다리 정상적으로 표현. 16:9 화면 비율.",
      aspectRatio: '3:2',
    },
  ],
  anime: [
    {
      // 장면 1: 지브리 클래식 캐릭터 포트레이트
      text: "Transform the person in this photo into a Studio Ghibli-style 2D animated character illustration. Preserve the person's face shape, hair, and overall identity but fully render them in Hayao Miyazaki's iconic hand-drawn animation style. Soft watercolor background with gentle nature elements — sunlight through leaves, floating dust particles, wildflowers. Warm pastel color palette, delicate line art, characteristic Ghibli round eyes and expressive face. The character feels like they stepped out of My Neighbor Totoro or Kiki's Delivery Service. No photorealism, fully 2D illustrated.",
      aspectRatio: '1:1',
    },
    {
      // 장면 2: 지브리 신비로운 장면
      text: "Transform the person in this photo into a Studio Ghibli 2D anime illustration, Spirited Away / Howl's Moving Castle art style. Preserve the person's facial features and hair identity but render entirely in Ghibli hand-drawn style. Place them in a magical atmospheric Ghibli scene: ancient stone stairs, glowing lanterns, misty evening sky, soft warm light from distant windows. Painterly watercolor background, Ghibli signature color depth, delicate cel-shading, expressive Ghibli eyes, flowing clothes with fabric detail. Feels like a movie still from a Miyazaki film. No photorealism, fully 2D animated illustration.",
      aspectRatio: '3:2',
    },
    {
      // 장면 3: 지브리 자연 속 힐링 씬
      text: "Transform the person in this photo into a soft Studio Ghibli 2D anime character. Preserve facial identity and hair. Render in Ghibli's gentle hand-painted illustration style: the character is in a peaceful countryside scene — rolling green hills, a blue sky with fluffy white clouds, sunflower fields, a gentle breeze moving their hair. Princess Mononoke meets The Wind Rises color palette: rich natural greens, sky blues, golden sunlight. Delicate line work, characteristic Ghibli soft shading, no harsh outlines. The whole image feels like a serene moment from a Ghibli feature film. Fully 2D illustrated, no photorealism.",
      aspectRatio: '1:1',
    },
  ],
}

function pickPrompt(cardId: string): PromptVariant {
  const variants = PROMPTS[cardId] ?? PROMPTS.anime
  return variants[Math.floor(Math.random() * variants.length)]
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

  const { text: prompt, aspectRatio } = pickPrompt(cardId)

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
    type FileOutput = { url: () => string }
    const output = await replicate.run('openai/gpt-image-2', {
      input: {
        prompt,
        input_images: [inputUpload.url],
        quality: 'medium',
        aspect_ratio: aspectRatio,
        output_format: 'webp',
        number_of_images: 1,
        background: 'auto',
        moderation: 'auto',
        output_compression: 85,
      },
    }) as Array<string | FileOutput>
    const raw = output[0]
    outputUrl = typeof raw === 'string' ? raw : raw.url()
    if (!outputUrl) throw new Error('No output URL from Replicate')
  } catch (err) {
    console.error('[generate] Replicate error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    await insforge.database.from('generations').update({ status: 'failed' }).eq('id', genRecord.id)
    return Response.json({ error: msg }, { status: 500 })
  }

  // 4. 생성된 이미지를 InsForge Storage에 영구 저장 (Replicate CDN URL은 만료됨)
  let persistentImageUrl = outputUrl
  const outputKey = `${userId}/outputs/${genRecord.id}.webp`
  try {
    const imgRes = await fetch(outputUrl)
    const imgBlob = await imgRes.blob()
    const { data: outputUpload, error: uploadErr } = await insforge.storage
      .from('generations')
      .upload(outputKey, imgBlob)
    if (!uploadErr && outputUpload) {
      persistentImageUrl = outputUpload.url
    } else {
      console.error('[generate] Output storage upload failed, using Replicate URL:', uploadErr)
    }
  } catch (err) {
    console.error('[generate] Output storage upload exception:', err)
  }

  // 5. 레코드 완료 업데이트
  await insforge.database.from('generations').update({
    output_image_url: persistentImageUrl,
    output_image_key: outputKey,
    status: 'completed',
    updated_at: new Date().toISOString(),
  }).eq('id', genRecord.id)

  return Response.json({ url: persistentImageUrl, generationId: genRecord.id })
}
