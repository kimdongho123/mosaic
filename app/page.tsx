import { createInsForgeServerClient } from './lib/insforge/server'

export default async function Home() {
  const insforge = await createInsForgeServerClient()
  const { data } = await insforge.auth.getCurrentUser()
  const isLoggedIn = !!data?.user?.id

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#ECEEF0", color: "#202020" }}>

      {/* Navbar */}
      <header style={{ backgroundColor: "#ECEEF0" }} className="sticky top-0 z-50 border-b border-[#DEE0E2]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight" style={{ color: "#202020" }}>
            mosaic
          </span>
          <nav className="hidden md:flex items-center gap-8">
            {["기능", "사례", "가격보기"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm transition-opacity hover:opacity-60"
                style={{ color: "#202020" }}
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <a
                href="/generate"
                className="text-sm font-medium px-4 py-2 rounded-full transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#202020", color: "#ECEEF0" }}
              >
                시작하기 →
              </a>
            ) : (
              <>
                <a
                  href="/auth"
                  className="text-sm font-medium transition-opacity hover:opacity-60"
                  style={{ color: "#202020" }}
                >
                  로그인
                </a>
                <a
                  href="#demo"
                  className="text-sm font-medium px-4 py-2 rounded-full border transition-colors hover:opacity-80"
                  style={{ borderColor: "#202020", color: "#202020" }}
                >
                  데모 보기
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-28">
        <div className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-8 tracking-widest uppercase"
          style={{ backgroundColor: "#DEE0E2", color: "#202020" }}>
          AI 영상 생성 플랫폼
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight max-w-3xl mb-6">
          원클릭으로<br />바이럴 영상을
        </h1>
        <p className="text-lg md:text-xl max-w-xl mb-10 leading-relaxed" style={{ color: "#202020", opacity: 0.6 }}>
          AI가 스크립트부터 편집까지 전부 처리합니다.<br />
          당신은 아이디어만 떠올리면 됩니다.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a
            id="demo"
            href="#"
            className="px-8 py-4 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#202020", color: "#ECEEF0" }}
          >
            데모 영상 보기 →
          </a>
          <a
            href="/auth"
            className="text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-50"
            style={{ color: "#202020" }}
          >
            무료로 시작하기
          </a>
        </div>

        {/* Hero visual placeholder */}
        <div className="mt-20 w-full max-w-4xl rounded-2xl overflow-hidden shadow-xl"
          style={{ backgroundColor: "#DEE0E2", aspectRatio: "16/9" }}>
          <div className="w-full h-full flex items-center justify-center flex-col gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#202020" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <polygon points="9,7 19,12 9,17" fill="#ECEEF0" />
              </svg>
            </div>
            <span className="text-sm" style={{ color: "#202020", opacity: 0.5 }}>
              데모 영상
            </span>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section style={{ backgroundColor: "#DEE0E2" }} className="py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {[
            { value: "50,000+", label: "생성된 영상" },
            { value: "12,000+", label: "크리에이터" },
            { value: "평균 320만", label: "영상당 조회수" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="text-3xl md:text-4xl font-bold" style={{ color: "#202020" }}>
                {stat.value}
              </span>
              <span className="text-sm" style={{ color: "#202020", opacity: 0.55 }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ backgroundColor: "#ECEEF0" }} className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">왜 Mosaic인가요?</h2>
            <p className="text-base max-w-md mx-auto" style={{ color: "#202020", opacity: 0.55 }}>
              바이럴 영상 제작의 모든 단계를 AI가 대신합니다.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "원클릭 생성",
                desc: "주제를 입력하면 스크립트, 편집, 자막까지 완성 영상이 만들어집니다.",
              },
              {
                icon: "🎯",
                title: "바이럴 알고리즘 최적화",
                desc: "유튜브, 틱톡, 인스타그램의 알고리즘에 맞게 자동으로 최적화됩니다.",
              },
              {
                icon: "📤",
                title: "멀티 플랫폼 배포",
                desc: "만든 영상을 원하는 모든 플랫폼에 동시에 업로드하세요.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl p-8 flex flex-col gap-4"
                style={{ backgroundColor: "#DEE0E2" }}
              >
                <span className="text-3xl">{feature.icon}</span>
                <h3 className="text-lg font-semibold" style={{ color: "#202020" }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#202020", opacity: 0.6 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ backgroundColor: "#DEE0E2" }} className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">3단계로 끝납니다</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "아이디어 입력", desc: "영상 주제 또는 키워드를 입력하세요." },
              { step: "02", title: "AI가 제작", desc: "Mosaic이 스크립트, 편집, 자막을 자동 완성합니다." },
              { step: "03", title: "바이럴 확산", desc: "완성된 영상을 바로 업로드하고 조회수를 지켜보세요." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3">
                <span className="text-5xl font-bold" style={{ color: "#202020", opacity: 0.15 }}>
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold" style={{ color: "#202020" }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#202020", opacity: 0.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ backgroundColor: "#202020" }} className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight" style={{ color: "#ECEEF0" }}>
            첫 바이럴 영상,<br />지금 만들어보세요
          </h2>
          <p className="text-base" style={{ color: "#DEE0E2", opacity: 0.7 }}>
            신용카드 없이 무료로 시작할 수 있습니다.
          </p>
          <a
            href="#"
            className="px-8 py-4 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#ECEEF0", color: "#202020" }}
          >
            데모 영상 보기 →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: "#202020", borderColor: "#DEE0E222" }} className="border-t py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold" style={{ color: "#ECEEF0" }}>
            mosaic
          </span>
          <p className="text-xs" style={{ color: "#DEE0E2", opacity: 0.4 }}>
            © 2025 Mosaic. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["이용약관", "개인정보처리방침"].map((link) => (
              <a key={link} href="#" className="text-xs transition-opacity hover:opacity-60"
                style={{ color: "#DEE0E2" }}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
